'use client';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

export default function GroupChatView({ groupId, groupDetails }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  // ✅ Get current user from Supabase
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setCurrentUser(data.user);
    };
    getCurrentUser();
  }, []);

  // ✅ Fetch group messages
  useEffect(() => {
    if (!groupId || !currentUser) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (!error) setMessages(data);
    };

    fetchMessages();
  }, [groupId, currentUser]);

  // ✅ Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ Group typing indicator
  useEffect(() => {
    if (!groupId || !currentUser) return;

    const typingChannel = supabase
      .channel('group-typing')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'typing',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.new.user_id !== currentUser.id) {
            setTypingUser(payload.new.username);
            setTimeout(() => setTypingUser(null), 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [groupId, currentUser]);

  // ✅ Send typing event
  const handleTyping = async () => {
    if (!currentUser) return;

    await supabase.from('typing').insert([
      {
        group_id: groupId,
        user_id: currentUser.id,
        username:
          currentUser.user_metadata?.display_name || currentUser.email,
      },
    ]);
  };

  // ✅ Send message
  const handleSend = async (content) => {
    if (!currentUser) return;

    const { error } = await supabase.from('messages').insert([
      {
        group_id: groupId,
        sender_id: currentUser.id,
        content,
      },
    ]);

    if (!error) {
      setMessages((prev) => [
        ...prev,
        {
          group_id: groupId,
          sender_id: currentUser.id,
          content,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  if (!groupId) return <div>No group selected.</div>;
  if (!currentUser) return <div>Loading user...</div>;

  return (
    <div className="msg-view-container">
      <div className="msg-thread">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id || msg.created_at}
            message={msg}
            isOwn={msg.sender_id === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingUser && <TypingIndicator username={typingUser} />}
      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
}
