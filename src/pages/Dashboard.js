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



      <section className="transactions">
        <h2 className="transactions-title">Transaction History</h2>
        <ul className="transactions-list">
          <li className="transaction">
            <div className="transaction-row">
              <span className="transaction-type income">Income</span>
              <span className="transaction-amount income">+200 zł</span>
            </div>
            <div className="transaction-desc">Salary • 12 Nov 2025</div>
          </li>
          <li className="transaction">
            <div className="transaction-row">
              <span className="transaction-type expense">Expense</span>
              <span className="transaction-amount expense">-50 zł</span>
            </div>
            <div className="transaction-desc">Grocery • 11 Nov 2025</div>
          </li>
          <li className="transaction">
            <div className="transaction-row">
              <span className="transaction-type expense">Expense</span>
              <span className="transaction-amount expense">-15 zł</span>
            </div>
            <div className="transaction-desc">Pharmacy • 10 Nov 2025</div>
          </li>
          <li className="transaction">
            <div className="transaction-row">
              <span className="transaction-type expense">Expense</span>
              <span className="transaction-amount expense">-10 zł</span>
            </div>
            <div className="transaction-desc">Coffee • 10 Nov 2025</div>
          </li>
          <li className="transaction">
            <div className="transaction-row">
              <span className="transaction-type income">Income</span>
              <span className="transaction-amount income">+100 zł</span>
            </div>
            <div className="transaction-desc">Gift • 09 Nov 2025</div>
          </li>
        </ul>
      </section>

      <button className="assistantBtn" onClick={onOpenAssistant}>
        Open AI Assistant
      </button>
    </div>
  );
}
