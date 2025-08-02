'use client';

import React from 'react';
import '@/styles/hustlestreet.css';

export default function TabsNavigator({ activeTab, onTabChange, tabs }) {
  if (typeof onTabChange !== 'function') {
    console.error('TabsNavigator expected a function for onTabChange but got:', typeof onTabChange);
  }

  return (
    <div className="tabs-navigator">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
