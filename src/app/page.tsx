export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: "var(--font-geist-sans), sans-serif" }}>
      <h1>habit-control</h1>
      <p>Registro de hábitos a partir do Saved Messages do Telegram.</p>
      <ul>
        <li>
          <code>POST /api/telegram/sync</code>: lê o Saved Messages e registra os hábitos
        </li>
        <li>
          <code>POST /api/habits</code>: recebe um registro de hábito já estruturado
        </li>
      </ul>
    </main>
  );
}
