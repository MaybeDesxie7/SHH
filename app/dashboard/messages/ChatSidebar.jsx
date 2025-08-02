'use client';
import React, { useEffect, useState } from 'react';
import ChatList from './ChatList';
import { supabase } from '@/lib/supabase';

const ChatSidebar = ({ selectedTab, setSelectedTab, setActiveChat, activeChat, isMobile }) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [chats, setChats] = useState([]);
  const [groups, setGroups] = useState([]);

  // Fetch public profiles for search
  useEffect(() => {
    const fetchProfiles = async () => {
      if (search.length < 2) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('public_profiles')
        .select('user_id, name, avatar')
        .ilike('name', `%${search}%`);

      if (!error) {
        setSearchResults(data);
      }
    };

    fetchProfiles();
  }, [search]);

  // Fetch user groups from memberships
  useEffect(() => {
    const fetchGroups = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase
        .from('group_members')
        .select('group_chats(id, name)')
        .eq('user_id', userData.user.id);

      if (!error) {
        const formatted = data.map(item => ({
          id: item.group_chats.id,
          name: item.group_chats.name,
          type: 'group',
        }));
        setGroups(formatted);
      }
    };

    if (selectedTab === 'groups') fetchGroups();
  }, [selectedTab]);

  // Placeholder for private chats
  useEffect(() => {
    setChats([]); // Replace with real recent chat fetch if needed
  }, []);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    if (isMobile) {
      // Auto-close sidebar on mobile
      document.body.click(); // trigger outside click listener
    }
  };

  return (
    <div className="msg-chat-sidebar">
      <div className="msg-sidebar-header">
        <input
          type="text"
          className="msg-search-input"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="msg-tab-toggle">
          <button
            className={selectedTab === 'chats' ? 'active' : ''}
            onClick={() => setSelectedTab('chats')}
          >
            Chats
          </button>
          <button
            className={selectedTab === 'groups' ? 'active' : ''}
            onClick={() => setSelectedTab('groups')}
          >
            Groups
          </button>
        </div>
      </div>

      {search.length >= 2 ? (
        <ChatList
          chats={searchResults
            .filter(u => u.user_id && u.name)
            .map((u) => ({
              id: u.user_id,
              name: u.name,
              avatar: u.avatar || '',
              type: 'private',
            }))
          }
          selectedChatId={activeChat?.id}
          onSelectChat={handleSelectChat}
        />
      ) : selectedTab === 'groups' ? (
        <ChatList
          chats={groups}
          selectedChatId={activeChat?.id}
          onSelectChat={handleSelectChat}
        />
      ) : (
        <ChatList
          chats={chats}
          selectedChatId={activeChat?.id}
          onSelectChat={handleSelectChat}
        />
      )}
    </div>
  );
};

export default ChatSidebar;
