import type { HabitLogEntry } from "./types";

/**
 * Registra um hábito. Por enquanto só escreve no log do servidor;
 * é aqui que futuramente entra a persistência.
 */
export async function logHabit(entry: HabitLogEntry): Promise<void> {
  console.log("[habit] registro recebido:\n" + JSON.stringify(entry, null, 2));
}
