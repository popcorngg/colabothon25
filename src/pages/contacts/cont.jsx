import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './cont.css';
import logo from '../dash/logo.png';

export default function Contacts() {
  const nav = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const contacts = [
    { id: 1, name: 'Anna Kowalska', phone: '+48 123 456 789', lastTransfer: '500 zł', date: '12 Nov 2025', avatar: 'AK' },
    { id: 2, name: 'Piotr Nowak', phone: '+48 234 567 890', lastTransfer: '250 zł', date: '10 Nov 2025', avatar: 'PN' },
    { id: 3, name: 'Maria Wiśniewska', phone: '+48 345 678 901', lastTransfer: '1,200 zł', date: '08 Nov 2025', avatar: 'MW' },
    { id: 4, name: 'Jan Kowalczyk', phone: '+48 456 789 012', lastTransfer: '80 zł', date: '05 Nov 2025', avatar: 'JK' },
    { id: 5, name: 'Ewa Dąbrowska', phone: '+48 567 890 123', lastTransfer: '350 zł', date: '03 Nov 2025', avatar: 'ED' },
  ];

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const getAvatarColor = (index) => {
    const colors = [
      'gradient-green',
      'gradient-blue',
      'gradient-red',
      'gradient-purple',
      'gradient-yellow'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="contacts-page">
      {/* Logo */}
      <div className="bank-logo" onClick={() => nav('/')}>
        <img src={logo} alt="Bank Logo" className="logo-image" />
      </div>

      {/* Header */}
      <div className="contacts-header">
        <button className="back-btn" onClick={() => nav('/')}>
          ← Back
        </button>
        <h1 className="contacts-title">Contacts</h1>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Contacts List */}
      <div className="contacts-list-container">
        <ul className="contacts-list">
          {filteredContacts.map((contact, index) => (
            <li key={contact.id} className="contact-item">
              {/* Avatar */}
              <div className={`contact-avatar ${getAvatarColor(index)}`}>
                {contact.avatar}
              </div>

              {/* Contact Info */}
              <div className="contact-details">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-meta">
                  <span>📞 {contact.phone}</span>
                </div>
                <div className="contact-last-transfer">
                  Last: {contact.lastTransfer} • {contact.date}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="contact-actions">
                <button className="action-btn transfer-btn">💸</button>
                <button className="action-btn message-btn">💬</button>
              </div>
            </li>
          ))}
        </ul>

        {/* Add Contact Button */}
        <button className="add-contact-btn">
          <span className="add-icon">+</span>
          <span className="add-text">Add New Contact</span>
        </button>
      </div>
    </div>
  );
}