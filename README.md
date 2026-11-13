# habit-control
A habit tracker fed by your Telegram "Saved Messages"

Registra hábitos escritos no **Saved Messages** do Telegram no formato **verbo + ação**,
por exemplo: `li memórias do subsolo` ou `corri 5km`.

Feito com Next.js (App Router) + TypeScript. O Saved Messages é um chat pessoal, e a
Bot API do Telegram não tem acesso a ele. Por isso o projeto usa a **API de usuário (MTProto)**
via [GramJS](https://gram.js.org), autenticada com a sua própria conta.

## Configuração

1. Em [my.telegram.org/apps](https://my.telegram.org/apps), crie um app e copie o `api_id` e o `api_hash`.
2. Crie o `.env.local`:
   ```bash
   cp .env.example .env.local   # preencha TELEGRAM_API_ID e TELEGRAM_API_HASH
   npm install
   ```
3. Faça login na sua conta (pede telefone, código e senha de 2 etapas, se houver):
   ```bash
   npm run telegram:login
   ```
   O script grava a `TELEGRAM_SESSION` direto no `.env.local`. **Essa sessão dá acesso
   total à sua conta do Telegram; trate como senha e nunca a versione.**
4. Suba o servidor:
   ```bash
   npm run dev
   ```

### Filtrando mensagens de hábito

O Saved Messages costuma ter outras coisas (links, notas). Defina `HABIT_PREFIX="#h"`
(com aspas, porque no `.env` um `#` sem aspas inicia um comentário) para que só mensagens
como `#h corri 5km` sejam tratadas como hábito.
Sem prefixo, toda mensagem de texto vira hábito.

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/telegram/sync` | Lê o Saved Messages, monta o JSON estruturado e registra |
| `POST` | `/api/habits` | Recebe diretamente o JSON estruturado (`HabitLogEntry`) e registra |

Por enquanto "registrar" significa apenas logar o JSON no console do servidor (`src/lib/habits/log.ts`).

### `POST /api/telegram/sync`

Body opcional: `{ "limit": 20, "since": "2026-11-13T00:00:00Z" }`
(`limit`: quantas mensagens recentes ler, 1–500, padrão 20; `since`: ignora mensagens anteriores).
Se `SYNC_SECRET` estiver definido, envie `Authorization: Bearer <SYNC_SECRET>`.

```bash
curl -X POST http://localhost:3000/api/telegram/sync -H 'Content-Type: application/json' -d '{"limit":10}'
```

Ainda não há persistência: cada chamada relê as mensagens do intervalo pedido.

### JSON estruturado (`HabitLogEntry`)

```json
{
  "source": "telegram",
  "messageId": "1234",
  "from": "123456789",
  "contactName": "Fulano",
  "receivedAt": "2026-11-13T14:00:00.000Z",
  "rawText": "corri 5km",
  "habit": {
    "verb": "corri",
    "action": "5km",
    "quantity": { "value": 5, "unit": "km" }
  }
}
```

### Testando sem o Telegram

```bash
curl -X POST http://localhost:3000/api/habits \
  -H 'Content-Type: application/json' \
  -d '{"source":"api","receivedAt":"2026-11-13T14:00:00Z","rawText":"li memórias do subsolo","habit":{"verb":"li","action":"memórias do subsolo","quantity":null}}'
```
