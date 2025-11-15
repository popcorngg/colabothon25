import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';
import { useSpeech } from '../../hooks/useSpeech';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { speak } = useSpeech();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    const messageText = input; // Сохраняем текст перед очисткой
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/neural-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: messageText })
      });

      const data = await response.json();
      const aiMessage = {
        id: Date.now() + 1,
        text: data.result || 'Нет ответа от нейросети',
        sender: 'ai'
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Озвучиваем ответ
      speak(aiMessage.text);

    } catch (error) {
      console.error('Ошибка:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Ошибка при получении ответа',
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>AI Assistant</h3>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <div className="empty-icon">💬</div>
                <p>Начните беседу с AI ассистентом</p>
                <p className="empty-hint">Задавайте вопросы о финансах, планировании бюджета и других темах</p>
              </div>
            ) : (
              messages.map(message => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-avatar">
                    {message.sender === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="message ai">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="message-text typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите сообщение..."
              disabled={loading}
              className="chat-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="chat-send-btn"
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
