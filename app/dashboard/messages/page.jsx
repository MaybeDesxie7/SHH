"use client";

import React, { useState, useEffect } from "react";
import PrivateChatView from "./PrivateChatView";
import UserSearchBar from "./UserSearchBar";
import ChatSidebar from "./ChatSidebar";
import "@/styles/messages.css";

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth);

    // Update width on resize
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleSelectChat(user) {
    setSelectedChat(user);
    setSidebarOpen(false);
  }

  // Sidebar is open if sidebarOpen state is true or screen wider than 768px
  const showSidebar = sidebarOpen || windowWidth > 768;

  return (
    <div className="messages-wrapper">
      <button
        className="sidebar-toggle-btn"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="Toggle chat sidebar"
      >
        ☰
      </button>

      {showSidebar && (
        <ChatSidebar
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onClose={() => setSidebarOpen(false)}
        />
      )}

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
