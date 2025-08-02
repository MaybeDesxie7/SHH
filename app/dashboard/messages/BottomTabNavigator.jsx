'use client';
import React from 'react';

const BottomTabNavigator = ({ selectedTab, setSelectedTab }) => {
  return (
    <div className="msg-tab-bar">
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
  );
};

export default BottomTabNavigator;
