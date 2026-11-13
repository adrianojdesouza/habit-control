import type { HabitLogEntry } from "./types";

type Result = { ok: true; value: HabitLogEntry } | { ok: false; errors: string[] };

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isNullableString = (v: unknown) => v === null || v === undefined || typeof v === "string";

/** Validação simples do JSON recebido em POST /api/habits. */
export function validateHabitLogEntry(body: unknown): Result {
  const errors: string[] = [];

  if (!isObject(body)) return { ok: false, errors: ["body deve ser um objeto JSON"] };

  if (body.source !== "telegram" && body.source !== "api")
    errors.push('source deve ser "telegram" ou "api"');
  if (typeof body.rawText !== "string" || !body.rawText.trim())
    errors.push("rawText é obrigatório");
  if (typeof body.receivedAt !== "string" || Number.isNaN(Date.parse(body.receivedAt)))
    errors.push("receivedAt deve ser uma data ISO 8601");
  for (const key of ["messageId", "from", "contactName"] as const) {
    if (!isNullableString(body[key])) errors.push(`${key} deve ser string ou null`);
  }

  const habit = body.habit;
  if (!isObject(habit)) {
    errors.push("habit é obrigatório");
  } else {
    if (typeof habit.verb !== "string" || !habit.verb) errors.push("habit.verb é obrigatório");
    if (!isNullableString(habit.action)) errors.push("habit.action deve ser string ou null");
    const q = habit.quantity;
    if (q !== null && q !== undefined) {
      if (!isObject(q) || typeof q.value !== "number" || !isNullableString(q.unit))
        errors.push("habit.quantity deve ser { value: number, unit: string | null } ou null");
    }
  }

  if (errors.length) return { ok: false, errors };

  const h = habit as Record<string, unknown>;
  const q = h.quantity as { value: number; unit?: string | null } | null | undefined;
  return {
    ok: true,
    value: {
      source: body.source as HabitLogEntry["source"],
      messageId: (body.messageId as string | undefined) ?? null,
      from: (body.from as string | undefined) ?? null,
      contactName: (body.contactName as string | undefined) ?? null,
      receivedAt: body.receivedAt as string,
      rawText: body.rawText as string,
      habit: {
        verb: h.verb as string,
        action: (h.action as string | undefined) ?? null,
        quantity: q ? { value: q.value, unit: q.unit ?? null } : null,
      },
    },
  };
}
