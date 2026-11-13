import type { HabitQuantity, ParsedHabit } from "./types";

// Número (com vírgula ou ponto decimal) seguido opcionalmente de uma unidade colada ou separada.
// Ex.: "5km", "5 km", "2,5h", "30 páginas", "10".
const QUANTITY_REGEX = /(\d+(?:[.,]\d+)?)\s*([\p{L}]+)?/u;

function parseQuantity(action: string): HabitQuantity | null {
  const match = action.match(QUANTITY_REGEX);
  if (!match) return null;

  const value = Number(match[1].replace(",", "."));
  if (!Number.isFinite(value)) return null;

  return { value, unit: match[2]?.toLowerCase() ?? null };
}

/**
 * Interpreta uma mensagem no formato "verbo + ação".
 *
 *   "corri 5km"               -> { verb: "corri", action: "5km", quantity: { value: 5, unit: "km" } }
 *   "li memórias do subsolo"  -> { verb: "li", action: "memórias do subsolo", quantity: null }
 *   "meditei"                 -> { verb: "meditei", action: null, quantity: null }
 *
 * Retorna null se o texto estiver vazio.
 */
export function parseHabitText(text: string): ParsedHabit | null {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) return null;

  const [firstWord, ...rest] = normalized.split(" ");
  const action = rest.join(" ") || null;

  return {
    verb: firstWord.toLowerCase(),
    action,
    quantity: action ? parseQuantity(action) : null,
  };
}
