import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./blik.css";
import logo from '../dash/logo.png';
export default function Blik() {
  const nav = useNavigate();
  const [balance, setBalance] = useState(1250.50); // Example balance
  const [blikCode, setBlikCode] = useState(generateBlikCode());
  const [timeLeft, setTimeLeft] = useState(120);
  const [expired, setExpired] = useState(false);

  // Generate 6-digit code
  function generateBlikCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Refresh code manually
  const handleRefresh = () => {
    setBlikCode(generateBlikCode());
    setTimeLeft(120);
    setExpired(false);
  };

  // Copy code
  const handleCopy = () => {
    navigator.clipboard.writeText(blikCode);
  };

  // Timer
  React.useEffect(() => {
    if (expired) return;
    if (timeLeft === 0) {
      setExpired(true);
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, expired]);

  // Generate code on load
  React.useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line
  }, []);

  // Format time
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div className="blik-page">
      <div className="bank-logo">
        <img src={logo} alt="Bank Logo" className="logo-image" />
      </div>
      <div className="blik-header">
        <button className="back-btn" onClick={() => nav('/')}>← Back</button>
        <h1 className="blik-title">BLIK</h1>
      </div>
      <div className="balanceCard" style={{cursor: 'default'}}>
        <div className="card-inner">
          <div className="front-card">
            <div className="card-chip"></div>          
            <h1>BALANCE</h1>
            <p className="amount">1,520.30 zł</p>
            <div className="balanceCard-info">
              <span className="card-number">•••• •••• •••• 1234</span>
            </div>
          </div>
        </div>
      </div>
      <div className="blik-code-section">
        <h1 className="blik-code">{blikCode}</h1>
        <div className="blik-actions">
          <button onClick={handleCopy}>Copy</button>
          {!expired ? (
            <button onClick={handleRefresh}>Refresh</button>
          ) : (
            <button onClick={handleRefresh}>New Code</button>
          )}
        </div>
        <div className="blik-timer">
          {!expired ? (
            <span>Expires in: {formatTime(timeLeft)}</span>
          ) : (
            <span style={{color: 'red'}}>Code Expired</span>
          )}
        </div>
      </div>
    </div>
  );
}