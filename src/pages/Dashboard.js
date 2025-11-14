import "./Dashboard.css";

export default function Dashboard({ onOpenAssistant }) {
  return (
    <div className="dashboard">
      <div className="balanceCard">
        <h1>Balance</h1>
        <p className="amount">1520.30 zł</p>
        <div className="balanceCard-info">
          <span className="card-number">•••• •••• •••• 1234</span>
          <span className="card-expiry">12/28</span>
        </div>
      </div>

      <div className="historyCard">
        <h2>Transaction History</h2>

        <ul className="historyList">
          <li className="item plus">+ 200 zł — Salary</li>
          <li className="item minus">- 50 zł — Grocery</li>
          <li className="item minus">- 15 zł — Pharmacy</li>
          <li className="item minus">- 10 zł — Coffee</li>
          <li className="item plus">+ 100 zł — Gift</li>
        </ul>
      </div>

      <button className="assistantBtn" onClick={onOpenAssistant}>
        Open AI Assistant
      </button>
    </div>
  );
}
