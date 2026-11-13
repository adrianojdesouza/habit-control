import { Api } from "telegram";
import type { HabitLogEntry } from "@/lib/habits/types";
import { getTelegramClient } from "./client";
import { toHabitEntry } from "./extract";

export interface FetchOptions {
  /** Máximo de mensagens lidas do Saved Messages (das mais recentes para as mais antigas). */
  limit: number;
  /** Ignora mensagens enviadas antes desta data. */
  since?: Date;
}

/** Lê o Saved Messages e devolve as mensagens de hábito, da mais antiga para a mais recente. */
export async function fetchHabitsFromSavedMessages({ limit, since }: FetchOptions): Promise<HabitLogEntry[]> {
  const client = await getTelegramClient();
  const me = await client.getMe();
  const sender = {
    id: String(me.id),
    name: [me.firstName, me.lastName].filter(Boolean).join(" ") || null,
  };
  const prefix = process.env.HABIT_PREFIX?.trim() || undefined;
  const sinceSeconds = since ? Math.floor(since.getTime() / 1000) : undefined;

  const entries: HabitLogEntry[] = [];
  // "me" é o Saved Messages. As mensagens vêm da mais recente para a mais antiga.
  for await (const message of client.iterMessages("me", { limit })) {
    if (sinceSeconds !== undefined && message.date < sinceSeconds) break;
    if (!(message instanceof Api.Message) || !message.message) continue;

    const entry = toHabitEntry({ id: message.id, date: message.date, text: message.message }, sender, prefix);
    if (entry) entries.push(entry);
  }

  return entries.reverse();
}
