'use client';
import React, { useState, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import PrivateChatView from './PrivateChatView';
import GroupChatView from './GroupChatView';
import BottomTabNavigator from './BottomTabNavigator';
import ChatHeader from './ChatHeader';
import '../../styles/messages.css';

const MessagesPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTab, setSelectedTab] = useState('chats'); // 'chats' or 'groups'
  const [activeChat, setActiveChat] = useState(null); // null, or { id, name, type: 'private' | 'group' }
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // run once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on outside click (mobile only)
  useEffect(() => {
    const handleClick = (e) => {
      if (isMobile && sidebarOpen && !e.target.closest('.msg-chat-sidebar')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isMobile, sidebarOpen]);

  return (
    <div className="msg-page-container">
      <div className="msg-header-wrapper">
        <ChatHeader />
      </div>

      <div className="msg-content-wrapper">
        {/* Sidebar */}
        {(!isMobile || sidebarOpen) && (
          <ChatSidebar
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            setActiveChat={setActiveChat}
            activeChat={activeChat}
            isMobile={isMobile}
          />
        )}

        {/* Chat View */}
        <div className="msg-chat-view">
          {!activeChat ? (
            <div className="msg-placeholder">Select a chat to start messaging</div>
          ) : activeChat.type === 'private' ? (
            <PrivateChatView chat={activeChat} />
          ) : (
            <GroupChatView chat={activeChat} />
          )}
        </div>
      </div>

      {/* Bottom Tabs for Mobile */}
      {isMobile && !activeChat && (
        <BottomTabNavigator
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      )}
    </div>
  );
};

export default MessagesPage;
