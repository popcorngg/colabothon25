import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './trans.css';
import logo from '../dash/logo.png';

export default function Trans() {
  const nav = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  const transactions = [
    { id: 1, type: 'income', name: 'Salary Payment', date: '12 Nov 2025', amount: 200, category: 'Salary' },
    { id: 2, type: 'expense', name: 'Grocery Shopping', date: '11 Nov 2025', amount: -50, category: 'Food' },
    { id: 3, type: 'expense', name: 'Pharmacy', date: '10 Nov 2025', amount: -15, category: 'Health' },
    { id: 4, type: 'expense', name: 'Coffee Shop', date: '10 Nov 2025', amount: -10, category: 'Food' },
    { id: 5, type: 'income', name: 'Gift Received', date: '09 Nov 2025', amount: 100, category: 'Other' },
    { id: 6, type: 'expense', name: 'Uber Ride', date: '08 Nov 2025', amount: -25, category: 'Transport' },
    { id: 7, type: 'expense', name: 'Netflix Subscription', date: '07 Nov 2025', amount: -45, category: 'Entertainment' },
    { id: 8, type: 'income', name: 'Freelance Work', date: '06 Nov 2025', amount: 350, category: 'Work' },
    { id: 9, type: 'expense', name: 'Restaurant', date: '05 Nov 2025', amount: -80, category: 'Food' },
    { id: 10, type: 'expense', name: 'Gas Station', date: '04 Nov 2025', amount: -120, category: 'Transport' },
  ];

  const filteredTransactions = activeFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === activeFilter);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = Math.abs(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));

  return (
    <div className="trans-page">
      <div className="bank-logo" onClick={() => nav('/')}>
        <img src={logo} alt="Bank Logo" className="logo-image" />
      </div>

      <div className="trans-header">
        <button className="back-btn" onClick={() => nav('/')}>
          ← Back
        </button>
        <h1 className="trans-title">Transactions</h1>
      </div>

      <div className="stats-container">
        <div className="stat-card income-stat">
          <div className="stat-icon">↑</div>
          <div className="stat-info">
            <div className="stat-label">Total Income</div>
            <div className="stat-amount">+{totalIncome} zł</div>
          </div>
        </div>
        <div className="stat-card expense-stat">
          <div className="stat-icon">↓</div>
          <div className="stat-info">
            <div className="stat-label">Total Expenses</div>
            <div className="stat-amount">-{totalExpense} zł</div>
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'income' ? 'active' : ''}`}
          onClick={() => setActiveFilter('income')}
        >
          Income
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'expense' ? 'active' : ''}`}
          onClick={() => setActiveFilter('expense')}
        >
          Expenses
        </button>
      </div>

      <div className="trans-list-container">
        <ul className="trans-list">
          {filteredTransactions.map(transaction => (
            <li key={transaction.id} className="trans-item">
              <div className={`trans-icon ${transaction.type}-icon`}>
                {transaction.type === 'income' ? '↑' : '↓'}
              </div>
              <div className="trans-details">
                <div className="trans-name">{transaction.name}</div>
                <div className="trans-meta">
                  <span className="trans-date">{transaction.date}</span>
                  <span className="trans-category">{transaction.category}</span>
                </div>
              </div>
              <div className={`trans-amount ${transaction.type}`}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount} zł
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}