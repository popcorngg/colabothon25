import { useState } from 'react';
import "./Dashboard.css";
import logo from './logo.png';

export default function Dashboard({ onOpenAssistant }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="dashboard">
      <div className="bank-logo">
        <img src={logo} alt="Bank Logo" className="logo-image"/>
      </div>
      
      <div className="balanceCard" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front of Card */}
          <div className="front-card">
            <div className="card-chip"></div>
            <h1>BALANCE</h1>
            <p className="amount">1,520.30 zł</p>
            <div className="balanceCard-info">
              <span className="card-number">•••• •••• •••• 1234</span>
              <span className="card-expiry">12/28</span>
            </div>
          </div>

          {/* Back of Card */}
          <div className="back-card">
            <div style={{ 
              marginBottom: '24px', 
              fontSize: '13px', 
              fontWeight: '600', 
              letterSpacing: '2px', 
              opacity: '0.7', 
              textTransform: 'uppercase' 
            }}>
              CARD DETAILS
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '14px', opacity: '0.7', marginBottom: '8px' }}>
                Card Number
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '2px' }}>
                6749 9153 2591 1234
              </div>
            </div>
            
            <div className="balanceCard-info">
              <div>
                <div style={{ fontSize: '12px', opacity: '0.7', marginBottom: '4px' }}>
                  Valid Thru
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>12/28</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: '0.7', marginBottom: '4px' }}>
                  CVV
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>228</div>
              </div>
            </div>

            <div style={{
              marginTop: '32px',
              fontSize: '12px',
              opacity: '0.6',
              textAlign: 'center'
            }}>
              Kliknij aby odwrócić kartę
            </div>
          </div>
        </div>
      </div>

      <section className="transactions">
        <h2 className="transactions-title">Recent Transactions</h2>
        <ul className="transactions-list">
          <li className="transaction">
            <div className="transaction-icon income-icon">↑</div>
            <div className="transaction-details">
              <div className="transaction-name">Salary Payment</div>
              <div className="transaction-date">12 Nov 2025</div>
            </div>
            <div className="transaction-amount income">+200 zł</div>
          </li>
          <li className="transaction">
            <div className="transaction-icon expense-icon">↓</div>
            <div className="transaction-details">
              <div className="transaction-name">Grocery Shopping</div>
              <div className="transaction-date">11 Nov 2025</div>
            </div>
            <div className="transaction-amount expense">-50 zł</div>
          </li>
          <li className="transaction">
            <div className="transaction-icon expense-icon">↓</div>
            <div className="transaction-details">
              <div className="transaction-name">Pharmacy</div>
              <div className="transaction-date">10 Nov 2025</div>
            </div>
            <div className="transaction-amount expense">-15 zł</div>
          </li>
          <li className="transaction">
            <div className="transaction-icon expense-icon">↓</div>
            <div className="transaction-details">
              <div className="transaction-name">Coffee Shop</div>
              <div className="transaction-date">10 Nov 2025</div>
            </div>
            <div className="transaction-amount expense">-10 zł</div>
          </li>
          <li className="transaction">
            <div className="transaction-icon income-icon">↑</div>
            <div className="transaction-details">
              <div className="transaction-name">Gift Received</div>
              <div className="transaction-date">09 Nov 2025</div>
            </div>
            <div className="transaction-amount income">+100 zł</div>
          </li>
        </ul>
      </section>

      <button className="assistantBtn" onClick={onOpenAssistant}>
        <span className="btn-icon">✨</span>
        <span>AI Financial Assistant</span>
      </button>
    </div>
  );
}