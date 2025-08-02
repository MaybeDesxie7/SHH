'use client';
import React from 'react';

const ChatItem = ({ name, lastMessage, timestamp, isActive, onClick }) => {
  return (
    <div
      className={`msg-chat-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="msg-chat-name">{name}</div>
      <div className="msg-chat-preview">
        <span className="msg-last-message">{lastMessage}</span>
        <span className="msg-timestamp">{timestamp}</span>
      </div>
    </div>
  );
};

export default ChatItem;
