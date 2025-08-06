// app/dashboard/messages/ChatSidebar.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ChatSidebar({ onSelectChat, selectedChat }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      const user = await supabase.auth.getUser();
      if (!user.data?.user) return;

      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, recipient_id, profiles!messages_sender_id_fkey(username, avatar_url)")
        .or(`sender_id.eq.${user.data.user.id},recipient_id.eq.${user.data.user.id}`)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const uniqueChats = Array.from(
          new Map(
            data.map((msg) => {
              const otherUser = msg.sender_id === user.data.user.id ? msg.recipient_id : msg.sender_id;
              return [otherUser, msg];
            })
          ).values()
        );
        setChats(uniqueChats);
      }
    };

    fetchChats();
  }, []);

  return (
    <div className="chat-sidebar">
      <h2>Messages</h2>
      {chats.map((chat) => {
        const chatPartner = chat.profiles;
        return (
          <div
            key={chat.id}
            className={`chat-list-item ${selectedChat?.id === chat.id ? "active" : ""}`}
            onClick={() => onSelectChat(chat)}
          >
            <img src={chatPartner.avatar_url} alt="avatar" className="chat-avatar" />
            <span>{chatPartner.username}</span>
          </div>
        );
      })}
    </div>
  );
}
