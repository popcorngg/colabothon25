import "./Dashboard.css";

export default function Dashboard({ onOpenAssistant }) {
  return (
    <div className="dashboard">
      <div className="balanceCard">
        <h1>Balance</h1>
        <p className="amount">1520,30 zł</p>
      </div>

      <div className="historyCard">
        <h2>История операций</h2>

        <ul className="historyList">
          <li className="item plus">+ 200 zł — Зарплата</li>
          <li className="item minus">- 50 zł — Biedronka</li>
          <li className="item minus">- 15 zł — Аптека</li>
          <li className="item minus">- 10 zł — Кофе</li>
          <li className="item plus">+ 100 zł — Подарок</li>
        </ul>
      </div>

      <button className="assistantBtn" onClick={onOpenAssistant}>
        Открыть AI помощника
      </button>
    </div>
  );
}
