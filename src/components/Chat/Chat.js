import React, { useState, useRef, useEffect, forwardRef } from 'react';
import './Chat.css';
import { useSpeech } from '../../hooks/useSpeech';

const Chat = forwardRef(({ onBobbyDetected, pendingMessage, shouldOpenChat }, ref) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const { speak } = useSpeech();
  const wsRef = useRef(null);
  const recognizerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Bobby detection from closed chat - open chat and send message
  useEffect(() => {
    if (shouldOpenChat && pendingMessage) {
      setIsOpen(true);
      // Send message after chat opens
      setTimeout(() => {
        sendMessage(pendingMessage, true);
      }, 100);
    }
  }, [shouldOpenChat, pendingMessage]);

  // Initialize voice recognition when chat opens
  useEffect(() => {
    if (isOpen && !wsRef.current) {
      initializeVoiceRecognition();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen]);

  const initializeVoiceRecognition = async () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:4269');
      wsRef.current.binaryType = 'arraybuffer';

      wsRef.current.onopen = () => console.log('Voice connection opened');

      wsRef.current.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          const cmd = (data.final || data.partial || '').toLowerCase();
          if (!cmd) return;

          // Check for Bobby keyword
          if (cmd.includes('bobby')) {
            const cleaned = cmd.split('bobby')[1]?.trim() || '';
            if (cleaned.length > 0) {
              // If chat is closed, notify parent to open it
              if (!isOpen && onBobbyDetected) {
                onBobbyDetected(cleaned);
              } else {
                // If chat is already open, send message directly
                sendMessage(cleaned, true);
              }
            }
          }
        } catch (err) {
          console.error('Voice parsing error:', err);
        }
      };

      wsRef.current.onerror = (err) => console.error('Voice WS error:', err);
      wsRef.current.onclose = () => console.log('Voice connection closed');

      // Start audio stream
      const audioContext = new AudioContext({ sampleRate: 16000 });
      await audioContext.resume();

      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(micStream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const float32 = e.inputBuffer.getChannelData(0);
        const sum = float32.reduce((acc, v) => acc + Math.abs(v), 0);
        if (sum === 0) return;

        const pcm16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          let s = Math.max(-1, Math.min(1, float32[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        wsRef.current.send(new Uint8Array(pcm16.buffer));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsListening(true);
    } catch (err) {
      console.error('Voice initialization error:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    await sendMessage(input, false);
  };

  const sendMessage = async (messageText, isVoice) => {
    // Add user message to chat
    const userMessage = { id: Date.now(), text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    if (!isVoice) {
      setInput('');
    }
    
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
        text: data.result || 'No response from AI',
        sender: 'ai'
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the response
      speak(aiMessage.text);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Error retrieving response',
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
                <p>Start a conversation with AI Assistant</p>
                <p className="empty-hint">Ask questions about finances, budgeting, and other topics</p>
                <p className="empty-hint" style={{ marginTop: '12px', fontSize: '11px' }}>💡 Say "Bobby" to use voice control</p>
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
              placeholder="Type a message..."
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
});

Chat.displayName = 'Chat';

export default Chat;
