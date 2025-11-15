import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './sup.css';
import logo from '../dash/logo.png';
export default function Support() {
  const nav = useNavigate();

  return (
    <div className='sup-page'>
      <div className="bank-logo" onClick={() => nav('/')}>
        <img src={logo} alt="Bank Logo" className="logo-image" />
      </div>

      <div className="sup-header">
        <button className="back-btn" onClick={() => nav('/')}>
          ← Back
        </button>
        <h1 className="sup-title">Support</h1>
      </div>
      
      <div className="sup-content">
        <h2 className='sup-title'>How can we help you?</h2>
        <p>If you have any questions or need assistance, please contact our support team:</p>
        <ul>
          <li>Email:bimboop-support@gmail.com</li>
          <li>Phone: +48 123 456 789</li>
          <li>Live Chat: Available 24/7 on our website</li>
        </ul>
        <p>We are here to assist you with any issues or inquiries you may have regarding your account or our services.</p>
      </div>

    </div>
  )
}