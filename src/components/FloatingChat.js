import React, { useState, useRef, useEffect, forwardRef } from 'react';
import './FloatingChat.css';
import Chat from './Chat/Chat';

const FloatingChat = forwardRef(({ pendingBobbyMessage }, ref) => {
  const [pendingMessage, setPendingMessage] = useState(null);
  const [shouldOpenChat, setShouldOpenChat] = useState(false);
  const chatRef = useRef(null);

  // Handle Bobby message from App.js
  useEffect(() => {
    if (pendingBobbyMessage) {
      setPendingMessage(pendingBobbyMessage);
      setShouldOpenChat(true);
      // Reset flags after processing
      setTimeout(() => {
        setShouldOpenChat(false);
      }, 100);
    }
  }, [pendingBobbyMessage]);

  const handleBobbyDetected = (message) => {
    setPendingMessage(message);
    setShouldOpenChat(true);
    // Reset flags after processing
    setTimeout(() => {
      setShouldOpenChat(false);
    }, 100);
  };

  return (
    <div className="floating-chat">
      <Chat 
        ref={chatRef}
        onBobbyDetected={handleBobbyDetected}
        pendingMessage={pendingMessage}
        shouldOpenChat={shouldOpenChat}
      />
    </div>
  );
});

FloatingChat.displayName = 'FloatingChat';

export default FloatingChat;