import { logHabit } from "@/lib/habits/log";
import { fetchHabitsFromSavedMessages } from "@/lib/telegram/saved-messages";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 500;

function isAuthorized(request: Request): boolean | "misconfigured" {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return process.env.NODE_ENV === "production" ? "misconfigured" : true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Lê o Saved Messages do Telegram, monta o JSON estruturado de cada hábito e registra.
 *
 * Body (opcional): { "limit": 20, "since": "2026-11-13T00:00:00Z" }
 */
export async function POST(request: Request) {
  const auth = isAuthorized(request);
  if (auth === "misconfigured") {
    console.error("[telegram] SYNC_SECRET não configurado; recusando sync.");
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { limit?: unknown; since?: unknown } = {};
  const text = await request.text();
  if (text.trim()) {
    try {
      body = JSON.parse(text);
    } catch {
      return Response.json({ error: "JSON inválido" }, { status: 400 });
    }
  }

  const limit = body.limit === undefined ? DEFAULT_LIMIT : Number(body.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return Response.json({ error: `limit deve ser um inteiro entre 1 e ${MAX_LIMIT}` }, { status: 400 });
  }

  let since: Date | undefined;
  if (body.since !== undefined) {
    since = new Date(String(body.since));
    if (Number.isNaN(since.getTime())) {
      return Response.json({ error: "since deve ser uma data ISO 8601" }, { status: 400 });
    }
  }

  let entries;
  try {
    entries = await fetchHabitsFromSavedMessages({ limit, since });
  } catch (err) {
    console.error("[telegram] falha ao ler o Saved Messages:", err);
    return Response.json({ error: (err as Error).message }, { status: 502 });
  }

  for (const entry of entries) {
    await logHabit(entry);
  }
  return Response.json({ received: entries.length, entries });
}
