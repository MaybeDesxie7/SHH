'use client';
import React from 'react';
import { UserCircle2 } from 'lucide-react';
import { useUser } from '@supabase/auth-helpers-react';

const ChatHeader = () => {
  const user = useUser();

  return (
    <div className="msg-chat-header">
      <h2 className="msg-chat-title">Messages</h2>
      <div className="msg-chat-user">
        <UserCircle2 size={24} />
        <span>{user?.user_metadata?.full_name || 'You'}</span>
      </div>
    </div>
  );
};

export default ChatHeader;
