import { logHabit } from "@/lib/habits/log";
import { validateHabitLogEntry } from "@/lib/habits/validate";

/** Recebe um registro de hábito já estruturado (ver HabitLogEntry) e o registra. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ errors: ["JSON inválido"] }, { status: 400 });
  }

  const result = validateHabitLogEntry(body);
  if (!result.ok) {
    return Response.json({ errors: result.errors }, { status: 400 });
  }

  await logHabit(result.value);
  return Response.json({ ok: true, entry: result.value }, { status: 201 });
}
