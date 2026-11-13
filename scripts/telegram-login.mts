// Faz login na sua conta do Telegram e grava a TELEGRAM_SESSION no .env.local.
// Uso: npm run telegram:login  (precisa de TELEGRAM_API_ID e TELEGRAM_API_HASH no .env.local)
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const ENV_FILE = ".env.local";

/** Substitui (ou adiciona) a linha TELEGRAM_SESSION= no .env.local, mantendo o resto do arquivo. */
function saveSessionToEnvFile(value: string) {
  const line = `TELEGRAM_SESSION=${value}`;
  const current = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";
  const updated = /^TELEGRAM_SESSION=.*$/m.test(current)
    ? current.replace(/^TELEGRAM_SESSION=.*$/m, () => line)
    : `${current}${current && !current.endsWith("\n") ? "\n" : ""}${line}\n`;
  writeFileSync(ENV_FILE, updated, { mode: 0o600 });
}

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
if (!apiId || !apiHash) {
  console.error("Defina TELEGRAM_API_ID e TELEGRAM_API_HASH no .env.local (pegue em https://my.telegram.org/apps).");
  process.exit(1);
}

const rl = createInterface({ input, output });
const ask = (q: string) => rl.question(q);

const session = new StringSession("");
const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });
client.setLogLevel("error" as never);

await client.start({
  phoneNumber: () => ask("Telefone (com DDI, ex.: +5511999999999): "),
  phoneCode: () => ask("Código recebido no Telegram: "),
  password: () => ask("Senha da verificação em duas etapas (se houver): "),
  onError: (err) => console.error(err),
});

saveSessionToEnvFile(session.save());
console.log(`\nLogin feito. TELEGRAM_SESSION salva em ${ENV_FILE}.`);
console.log("Ela dá acesso total à sua conta do Telegram: não compartilhe esse arquivo.\n");

rl.close();
await client.disconnect();
process.exit(0);
