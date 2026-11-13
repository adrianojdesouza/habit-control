import { parseHabitText } from "@/lib/habits/parse";
import type { HabitLogEntry } from "@/lib/habits/types";

/** Dados mínimos de uma mensagem do Telegram usados para montar o registro. */
export interface TelegramTextMessage {
  id: number;
  /** Unix timestamp em segundos. */
  date: number;
  text: string;
}

export interface TelegramSender {
  id: string;
  name: string | null;
}

/**
 * Converte uma mensagem do Saved Messages em registro de hábito.
 *
 * Se `prefix` for informado (ex.: "#h"), só mensagens que começam com ele são
 * consideradas hábitos, e o prefixo é removido antes do parse. Sem prefixo,
 * toda mensagem de texto vira um hábito.
 */
export function toHabitEntry(
  message: TelegramTextMessage,
  sender: TelegramSender,
  prefix?: string,
): HabitLogEntry | null {
  let text = message.text.trim();

  if (prefix) {
    if (!text.toLowerCase().startsWith(prefix.toLowerCase())) return null;
    text = text.slice(prefix.length);
    // Exige espaço após o prefixo: com "#h", "#hoje fiz..." não é um hábito.
    if (text && !/^\s/.test(text)) return null;
  }

  const habit = parseHabitText(text);
  if (!habit) return null;

  return {
    source: "telegram",
    messageId: String(message.id),
    from: sender.id,
    contactName: sender.name,
    receivedAt: new Date(message.date * 1000).toISOString(),
    rawText: message.text,
    habit,
  };
}
