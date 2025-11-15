import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './cont.css';
import logo from '../dash/logo.png';

export default function Contacs() {
  const nav = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Состояния для управления контактами
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Anna Kowalska', phone: '+48 123 456 789', lastTransfer: '500 zł', date: '12 Nov 2025', avatar: 'AK', email: 'anna.k@example.com' },
    { id: 2, name: 'Piotr Nowak', phone: '+48 234 567 890', lastTransfer: '250 zł', date: '10 Nov 2025', avatar: 'PN', email: 'piotr.n@example.com' },
    { id: 3, name: 'Maria Wiśniewska', phone: '+48 345 678 901', lastTransfer: '1,200 zł', date: '08 Nov 2025', avatar: 'MW', email: 'maria.w@example.com' },
    { id: 4, name: 'Jan Kowalczyk', phone: '+48 456 789 012', lastTransfer: '80 zł', date: '05 Nov 2025', avatar: 'JK', email: 'jan.k@example.com' },
    { id: 5, name: 'Ewa Dąbrowska', phone: '+48 567 890 123', lastTransfer: '350 zł', date: '03 Nov 2025', avatar: 'ED', email: 'ewa.d@example.com' },
  ]);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [message, setMessage] = useState('');

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

  // AI функционал
  const handleAIRequest = async () => {
    if (!aiInput.trim()) return;

    setLoading(true);
    setAiResponse('🤖 Processing your request...');

    try {
      const response = await fetch('http://localhost:5000/api/neural-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: aiInput,
          current_page: 'contacts',
          contacts: contacts, // Отправляем список контактов для контекста
        }),
      });

      const data = await response.json();
      const result = data.result || 'No response from AI';

      setAiResponse(result);

      // Проверяем, есть ли команда навигации
      if (data.action && data.action.type === "navigate") {
        speak(result);
        // Даем время прочитать сообщение, затем переходим
        setTimeout(() => {
          nav(data.action.route);
        }, 1500);
      } else {
        // Проверяем, есть ли в ответе команды для выполнения
        await processAICommands(result, aiInput);
        speak(result);
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      const errorMsg = 'Error connecting to AI assistant';
      setAiResponse(errorMsg);
      speak(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Обработка команд от AI
  const processAICommands = async (aiResponse, userInput) => {
    const lowerInput = userInput.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    // Команда: Отправить деньги
    if (lowerInput.includes('send') || lowerInput.includes('transfer') ||
      lowerInput.includes('отправ') || lowerInput.includes('перевед')) {

      // Ищем имя контакта в запросе
      const contact = contacts.find(c =>
        lowerInput.includes(c.name.toLowerCase()) ||
        lowerInput.includes(c.name.split(' ')[0].toLowerCase())
      );

      if (contact) {
        // Ищем сумму в запросе
        const amountMatch = userInput.match(/(\d+(?:\.\d+)?)\s*(?:zł|złoty|złotych)?/i);
        if (amountMatch) {
          setSelectedContact(contact);
          setTransferAmount(amountMatch[1]);
          setShowTransferModal(true);
          setAiResponse(prev => prev + `\n\n✅ Opening transfer form for ${contact.name} (${amountMatch[1]} zł)`);
        }
      }
    }

    // Команда: Написать сообщение
    if (lowerInput.includes('message') || lowerInput.includes('write') ||
      lowerInput.includes('сообщен') || lowerInput.includes('напиш')) {

      const contact = contacts.find(c =>
        lowerInput.includes(c.name.toLowerCase()) ||
        lowerInput.includes(c.name.split(' ')[0].toLowerCase())
      );

      if (contact) {
        setSelectedContact(contact);
        setShowMessageModal(true);
        setAiResponse(prev => prev + `\n\n✅ Opening message form for ${contact.name}`);
      }
    }

    // Команда: Добавить контакт
    if (lowerInput.includes('add contact') || lowerInput.includes('new contact') ||
      lowerInput.includes('добав') && lowerInput.includes('контакт')) {
      // Здесь можно добавить модальное окно для создания контакта
      setAiResponse(prev => prev + '\n\n✅ To add a contact, please use the "Add New Contact" button below');
    }
  };

  // Выполнение перевода
  const handleTransfer = () => {
    if (!transferAmount || !selectedContact) return;

    alert(`✅ Successfully transferred ${transferAmount} zł to ${selectedContact.name}!`);

    // Обновляем последний перевод
    setContacts(prev => prev.map(c =>
      c.id === selectedContact.id
        ? { ...c, lastTransfer: `${transferAmount} zł`, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
        : c
    ));

    setShowTransferModal(false);
    setTransferAmount('');
    setSelectedContact(null);
  };

  // Отправка сообщения
  const handleSendMessage = () => {
    if (!message || !selectedContact) return;

    alert(`✅ Message sent to ${selectedContact.name}!\n\n"${message}"`);

    setShowMessageModal(false);
    setMessage('');
    setSelectedContact(null);
  };

  // Озвучивание
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      if (text.match(/[а-яА-ЯЁё]/)) {
        utterance.lang = 'ru-RU';
      } else if (text.match(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/)) {
        utterance.lang = 'pl-PL';
      } else {
        utterance.lang = 'en-US';
      }

      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
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
        <button className="ai-toggle-btn" onClick={() => setShowAI(!showAI)}>
          {showAI ? '✕' : '🤖 AI'}
        </button>
      </div>

      {/* AI Assistant Panel */}
      {showAI && (
        <div className="ai-panel">
          <h3 className="ai-panel-title">💬 AI Assistant</h3>
          <p className="ai-panel-hint">
            Try: "Send 100 zł to Anna" or "Message Piotr" or "Show contacts with most transfers"
          </p>
          <div className="ai-input-container">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask AI to help with contacts..."
              className="ai-input"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleAIRequest()}
            />
            <button
              onClick={handleAIRequest}
              disabled={loading || !aiInput.trim()}
              className="ai-send-btn"
            >
              {loading ? '⏳' : '→'}
            </button>
          </div>

          {aiResponse && (
            <div className="ai-response-box">
              <div className="ai-response-content">{aiResponse}</div>
              {aiResponse && aiResponse !== '🤖 Processing your request...' && (
                <div className="ai-audio-controls">
                  {!isSpeaking ? (
                    <button onClick={() => speak(aiResponse)} className="audio-btn">
                      ▶️ Read
                    </button>
                  ) : (
                    <>
                      <button onClick={stop} className="audio-btn stop">
                        ⏹️ Stop
                      </button>
                      <button onClick={() => speak(aiResponse)} className="audio-btn">
                        🔄 Restart
                      </button>
                    </>
                  )}
                  {isSpeaking && <span className="speaking-indicator">🔊</span>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
                <button
                  className="action-btn transfer-btn"
                  onClick={() => {
                    setSelectedContact(contact);
                    setShowTransferModal(true);
                  }}
                  title="Send money"
                >
                  💸
                </button>
                <button
                  className="action-btn message-btn"
                  onClick={() => {
                    setSelectedContact(contact);
                    setShowMessageModal(true);
                  }}
                  title="Send message"
                >
                  💬
                </button>
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

      {/* Transfer Modal */}
      {showTransferModal && selectedContact && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">💸 Send Money</h3>
            <div className="modal-contact-info">
              <div className={`contact-avatar-modal ${getAvatarColor(contacts.indexOf(selectedContact))}`}>
                {selectedContact.avatar}
              </div>
              <div>
                <div className="modal-contact-name">{selectedContact.name}</div>
                <div className="modal-contact-phone">{selectedContact.phone}</div>
              </div>
            </div>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Amount (zł)"
              className="modal-input"
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={handleTransfer} className="modal-btn primary">
                Send {transferAmount ? `${transferAmount} zł` : ''}
              </button>
              <button onClick={() => setShowTransferModal(false)} className="modal-btn secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedContact && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">💬 Send Message</h3>
            <div className="modal-contact-info">
              <div className={`contact-avatar-modal ${getAvatarColor(contacts.indexOf(selectedContact))}`}>
                {selectedContact.avatar}
              </div>
              <div>
                <div className="modal-contact-name">{selectedContact.name}</div>
                <div className="modal-contact-phone">{selectedContact.phone}</div>
              </div>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="modal-textarea"
              rows="4"
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={handleSendMessage} className="modal-btn primary">
                Send Message
              </button>
              <button onClick={() => setShowMessageModal(false)} className="modal-btn secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}