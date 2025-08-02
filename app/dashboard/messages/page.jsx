'use client';
import React, { useState, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import PrivateChatView from './PrivateChatView';
import GroupChatView from './GroupChatView';
import BottomTabNavigator from './BottomTabNavigator';
import ChatHeader from './ChatHeader';
import { supabase } from '@/lib/supabase';
import './styles/messages.css';

const MessagesPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTab, setSelectedTab] = useState('chats');
  const [activeChat, setActiveChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (isMobile && sidebarOpen && !e.target.closest('.msg-chat-sidebar')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      const { data, error } = await supabase
        .from('public_profiles')
        .select('user_id, name, avatar')
        .ilike('name', `%${searchQuery.trim()}%`);

      if (!error) setSearchResults(data);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  return (
    <div className="msg-page-container">
      <div className="msg-header-wrapper">
        <ChatHeader />

        {selectedTab === 'chats' && !activeChat && (
          <div className="msg-search-bar">
            <input
              type="text"
              placeholder="Search users..."
              className="msg-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="msg-search-results">
                {searchResults.map((user) => (
                  <div key={user.user_id} className="msg-search-result-item">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="msg-search-avatar"
                      />
                    ) : (
                      <div className="msg-search-avatar msg-avatar-placeholder" />
                    )}
                    <span className="msg-search-name">{user.name}</span>
                    <button
                      className="msg-chat-btn"
                      onClick={() => {
                        setActiveChat({
                          id: user.user_id,
                          name: user.name,
                          avatar: user.avatar,
                          type: 'private',
                        });
                        setSidebarOpen(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      Chat
                    </button>
                  </div>
                ))}
                {searchResults.length === 0 && (
                  <div className="msg-no-results">No users found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="msg-content-wrapper">
        {(!isMobile || sidebarOpen) && (
          <ChatSidebar
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            setActiveChat={setActiveChat}
            activeChat={activeChat}
            isMobile={isMobile}
          />
        )}

        <div className="msg-chat-view">
          {!activeChat ? (
            <div className="msg-placeholder">Select a chat to start messaging</div>
          ) : activeChat.type === 'private' ? (
            <PrivateChatView key={activeChat.id} chat={activeChat} />
          ) : (
            <GroupChatView group={activeChat} />
          )}
        </div>
      </div>

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
