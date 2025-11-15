import React, { useState } from 'react';
import "./cur.css";
import { useNavigate } from 'react-router-dom';
import logo from '../dash/logo.png';


const STATIC_RATES = {
  PLN: { USD: 0.25, EUR: 0.23, UAH: 9.5, GBP: 0.20, CHF: 0.22, JPY: 37.0, CAD: 0.34 },
  USD: { PLN: 4.0, EUR: 0.92, UAH: 38.2, GBP: 0.80, CHF: 0.88, JPY: 148.0, CAD: 1.36 },
  EUR: { PLN: 4.35, USD: 1.09, UAH: 41.5, GBP: 0.87, CHF: 0.96, JPY: 161.0, CAD: 1.48 },
  UAH: { PLN: 0.105, USD: 0.0262, EUR: 0.024, GBP: 0.021, CHF: 0.023, JPY: 3.88, CAD: 0.036 },
  GBP: { PLN: 5.0, USD: 1.25, EUR: 1.15, UAH: 47.0, CHF: 1.10, JPY: 185.0, CAD: 1.70 },
  CHF: { PLN: 4.6, USD: 1.14, EUR: 1.04, UAH: 43.0, GBP: 0.91, JPY: 168.0, CAD: 1.54 },
  JPY: { PLN: 0.027, USD: 0.0068, EUR: 0.0062, UAH: 0.26, GBP: 0.0054, CHF: 0.0060, CAD: 0.0092 },
  CAD: { PLN: 2.95, USD: 0.74, EUR: 0.68, UAH: 27.0, GBP: 0.59, CHF: 0.65, JPY: 108.0 },
};

const STATIC_CHANGES = {
  PLN: { USD: 1.2, EUR: -0.5, UAH: 0.3, GBP: 0.7, CHF: -0.2, JPY: 0.1, CAD: 0.4 },
  USD: { PLN: -0.8, EUR: 0.2, UAH: 0.1, GBP: -0.3, CHF: 0.5, JPY: 0.0, CAD: 0.2 },
  EUR: { PLN: 0.5, USD: -0.3, UAH: 0.7, GBP: 0.1, CHF: -0.1, JPY: 0.2, CAD: 0.3 },
  UAH: { PLN: 0.1, USD: 0.0, EUR: -0.2, GBP: 0.2, CHF: 0.1, JPY: -0.1, CAD: 0.0 },
  GBP: { PLN: 0.2, USD: 0.1, EUR: -0.1, UAH: 0.3, CHF: 0.0, JPY: 0.2, CAD: -0.2 },
  CHF: { PLN: -0.1, USD: 0.2, EUR: 0.0, UAH: 0.1, GBP: 0.1, JPY: -0.2, CAD: 0.1 },
  JPY: { PLN: 0.0, USD: 0.1, EUR: -0.1, UAH: 0.2, GBP: 0.1, CHF: 0.0, CAD: -0.1 },
  CAD: { PLN: 0.2, USD: -0.1, EUR: 0.1, UAH: 0.0, GBP: 0.2, CHF: -0.1, JPY: 0.1 },
};

export default function Currency() {
  const nav = useNavigate();
  const [base, setBase] = useState('PLN');
  const [amount, setAmount] = useState(1);
  const [to, setTo] = useState('USD');
  const [result, setResult] = useState(null);
  const currencies = Object.keys(STATIC_RATES);

  const filteredCurrencies = currencies.filter(cur => cur !== base);

  const handleConvert = () => {
    if (base === to) {
      setResult(amount);
      return;
    }
    setResult((amount * STATIC_RATES[base][to]).toFixed(2));
  };


  return (
    <div className="cur-page">
      <div className="bank-logo">
        <img src={logo} alt="Bank Logo" className="logo-image" />
      </div>
      <div className="cur-header">
        <button className="back-btn" onClick={() => nav('/')}>← Back</button>
        <h1 className="cur-title">Currency</h1>
      </div>
      <div className="cur-card">
        <div className="cur-form">
          <label className="cur-label">Base currency:</label>
          <select value={base} onChange={e => setBase(e.target.value)} className="cur-select">
            {currencies.map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>
        <div className="cur-table-container">
          <table className="cur-table">
            <thead>
              <tr>
                <th>Currency</th>
                <th>Rate</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredCurrencies.map(cur => (
                <tr key={cur}>
                  <td>{cur}</td>
                  <td>{STATIC_RATES[base][cur]}</td>
                  <td>
                    {STATIC_CHANGES[base][cur] > 0 && <span style={{color: '#4ade80'}}>↑ {STATIC_CHANGES[base][cur]}%</span>}
                    {STATIC_CHANGES[base][cur] < 0 && <span style={{color: '#f87171'}}>↓ {Math.abs(STATIC_CHANGES[base][cur])}%</span>}
                    {STATIC_CHANGES[base][cur] === 0 && <span style={{color: '#888'}}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="cur-form" style={{marginTop: 24}}>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="cur-input"
            placeholder="Amount"
          />
          <select value={base} onChange={e => setBase(e.target.value)} className="cur-select">
            {currencies.map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
          <span className="cur-arrow">→</span>
          <select value={to} onChange={e => setTo(e.target.value)} className="cur-select">
            {currencies.map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
          <button className="cur-btn" onClick={handleConvert}>Convert</button>
        </div>
        {result !== null && (
          <div className="cur-result">
            <span>{amount} {base} = </span>
            <span className="cur-result-value">{result} {to}</span>
          </div>
        )}
      </div>
    </div>
  );
}
