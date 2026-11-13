/** Quantidade numérica extraída da ação, ex.: "5km" -> { value: 5, unit: "km" }. */
export interface HabitQuantity {
  value: number;
  unit: string | null;
}

/** Hábito interpretado a partir do texto "verbo + ação". */
export interface ParsedHabit {
  /** Primeira palavra da mensagem, em minúsculas. Ex.: "corri", "li". */
  verb: string;
  /** Restante da mensagem. Ex.: "5km", "memórias do subsolo". Null se só veio o verbo. */
  action: string | null;
  /** Primeira quantidade numérica encontrada na ação, se houver. */
  quantity: HabitQuantity | null;
}

/** JSON estruturado de um registro de hábito. É o contrato do POST /api/habits. */
export interface HabitLogEntry {
  source: "telegram" | "api";
  /** ID da mensagem na origem (ex.: id da mensagem no Telegram). */
  messageId: string | null;
  /** ID do usuário que enviou (no Telegram, o seu próprio ID). */
  from: string | null;
  /** Nome de quem enviou, se disponível. */
  contactName: string | null;
  /** Data/hora ISO 8601 em que a mensagem foi enviada. */
  receivedAt: string;
  /** Texto original da mensagem. */
  rawText: string;
  habit: ParsedHabit;
}
