// app/dashboard/messages/page.jsx
// app/dashboard/messages/page.jsx
"use client";

import React, { useState } from "react";

import PrivateChatView from "./PrivateChatView";

import UserSearchBar from "./UserSearchBar";
import "@/styles/messages.css";

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="messages-wrapper">
      {!selectedChat && <UserSearchBar onSelectUser={setSelectedChat} />}

      {selectedChat ? (
        <div className="chat-container">
          
          <PrivateChatView selectedChat={selectedChat} />
        </div>
      ) : (
        <div className="empty-chat">Search and select a user to start chatting</div>
      )}
    </div>
  );
}
