'use client';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

export default function PrivateChatView({ chat }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  const myId = currentUser?.id;
  const otherUserId = chat?.id;

  // ✅ Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setCurrentUser(data.user);
    };
    getCurrentUser();
  }, []);

  // ✅ Fetch other user profile
  useEffect(() => {
    if (!otherUserId) return;
    const fetchOtherUser = async () => {
      const { data } = await supabase
        .from('public_profiles')
        .select('name, avatar')
        .eq('user_id', otherUserId)
        .single();
      if (data) setOtherUser(data);
    };
    fetchOtherUser();
  }, [otherUserId]);

  // ✅ Fetch messages
  useEffect(() => {
    if (!myId || !otherUserId) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${myId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${myId})`
        )
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();
  }, [myId, otherUserId]);

  // ✅ Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ Listen for typing
  useEffect(() => {
    if (!myId || !otherUserId) return;
    const typingChannel = supabase
      .channel('typing-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'typing',
          filter: `chat_id=eq.${otherUserId}`,
        },
        (payload) => {
          if (payload.new.user_id !== myId) {
            setTypingUser(payload.new.username);
            setTimeout(() => setTypingUser(null), 3000);
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(typingChannel);
  }, [myId, otherUserId]);

  const handleTyping = async () => {
    await supabase.from('typing').insert([
      {
        chat_id: otherUserId,
        user_id: myId,
        username:
          currentUser?.user_metadata?.display_name || currentUser?.email,
      },
    ]);
  };

  const handleSend = async (content) => {
    if (!content) return;
    const { error } = await supabase.from('messages').insert([
      {
        sender_id: myId,
        recipient_id: otherUserId,
        content,
      },
    ]);
    if (!error) {
      setMessages((prev) => [
        ...prev,
        {
          sender_id: myId,
          recipient_id: otherUserId,
          content,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  // ✅ Loading guards
  if (!chat) return <div>No chat selected.</div>;
  if (!currentUser) return <div>Loading user...</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="msg-private-header flex items-center gap-2 p-2 border-b bg-white shadow-sm">
        {otherUser?.avatar ? (
          <img src={otherUser.avatar} className="msg-avatar" />
        ) : (
          <div className="msg-avatar msg-avatar-placeholder" />
        )}
        <span className="font-semibold">{otherUser?.name || 'User'}</span>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 bg-[#f0f0f0]">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id || msg.created_at}
            message={msg}
            isOwn={msg.sender_id === myId}
          />
        ))}
        <div ref={messagesEndRef} />
        {typingUser && <TypingIndicator username={typingUser} />}
      </div>

      {/* Input at bottom */}
      <div className="border-t bg-white p-2">
        <MessageInput
          onSend={handleSend}
          onTyping={handleTyping}
          uploading={false}
          setFile={() => {}}
        />
      </div>
    </div>
  );
}
