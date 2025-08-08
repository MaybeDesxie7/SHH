"use client";

import React, { useState } from "react";
import PrivateChatView from "./PrivateChatView";
import UserSearchBar from "./UserSearchBar";
import ChatSidebar from "./ChatSidebar";
import "@/styles/messages.css";

export default function MessagesPage() {
  // selectedChat will be an object { user_id, name, avatar } from search or chat list
  const [selectedChat, setSelectedChat] = useState(null);
  // For mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // When user selects chat from sidebar, close sidebar on mobile
  function handleSelectChat(user) {
    setSelectedChat(user);
    setSidebarOpen(false);
  }

  return (
    <div className="messages-wrapper">
      {/* Sidebar toggler for mobile */}
      <button
        className="sidebar-toggle-btn"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="Toggle chat sidebar"
      >
        ☰
      </button>

      {/* Sidebar with chat list and user search */}
      {(sidebarOpen || window.innerWidth > 768) && (
        <ChatSidebar
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat view */}
      <main className="chat-main">
        {!selectedChat ? (
          <UserSearchBar onSelectUser={handleSelectChat} />
        ) : (
          <PrivateChatView selectedUserId={selectedChat.user_id} />
        )}
      </main>
    </div>
  );
}
