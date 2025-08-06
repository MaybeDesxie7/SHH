import React, { useEffect, useState } from 'react';

export default function ChatList({ onSelectChat }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    // Fetch chats from Supabase
  }, []);

  return (
    <div className="chat-list">
      {chats.map(chat => (
        <div key={chat.id} className="chat-item" onClick={() => onSelectChat(chat)}>
          <p>{chat.name}</p>
        </div>
      ))}
    </div>
  );
}
