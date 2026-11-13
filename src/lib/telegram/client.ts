import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

// O Saved Messages é um chat pessoal, então não dá para lê-lo com a Bot API.
// Usamos a API de usuário (MTProto) via GramJS, autenticada com a sua conta.

// Reaproveita a conexão entre requisições (e entre hot reloads no `next dev`).
const globalForTelegram = globalThis as unknown as {
  telegramClient?: Promise<TelegramClient>;
};

function readConfig() {
  const apiId = Number(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const session = process.env.TELEGRAM_SESSION;

  const missing = [
    !apiId && "TELEGRAM_API_ID",
    !apiHash && "TELEGRAM_API_HASH",
    !session && "TELEGRAM_SESSION",
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(`Variáveis de ambiente ausentes: ${missing.join(", ")}`);
  }

  return { apiId, apiHash: apiHash!, session: session! };
}

async function connect(): Promise<TelegramClient> {
  const { apiId, apiHash, session } = readConfig();
  const client = new TelegramClient(new StringSession(session), apiId, apiHash, {
    connectionRetries: 5,
  });
  client.setLogLevel("error" as never);
  await client.connect();

  if (!(await client.checkAuthorization())) {
    throw new Error("Sessão do Telegram inválida ou expirada. Rode `npm run telegram:login` de novo.");
  }
  return client;
}

/** Retorna um cliente do Telegram já conectado e autenticado. */
export function getTelegramClient(): Promise<TelegramClient> {
  if (!globalForTelegram.telegramClient) {
    globalForTelegram.telegramClient = connect().catch((err) => {
      // Não guarda uma conexão que falhou; a próxima chamada tenta de novo.
      globalForTelegram.telegramClient = undefined;
      throw err;
    });
  }
  return globalForTelegram.telegramClient;
}
