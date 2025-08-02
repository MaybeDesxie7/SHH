'use client';
import React from 'react';
import ChatItem from './ChatItem';

const ChatList = ({ chats = [], selectedChatId, onSelectChat }) => {
  return (
    <div className="msg-chat-list">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          name={chat.name}
          lastMessage={chat.lastMessage}
          timestamp={chat.timestamp}
          isActive={selectedChatId === chat.id}
          onClick={() => onSelectChat(chat)}
        />
      ))}
    </div>
  );
};

export default ChatList;
