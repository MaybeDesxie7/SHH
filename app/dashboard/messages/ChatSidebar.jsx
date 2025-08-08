"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ChatSidebar({ onSelectChat, selectedChat }) {
  const [chats, setChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchChats() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch recent messages involving the user
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("id, sender, recipient, content, type, created_at")
        .or(`sender.eq.${user.id},recipient.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (messagesError) {
        console.error("Failed to fetch messages", messagesError);
        setLoading(false);
        return;
      }

      // Extract unique other user ids
      const uniqueUserIds = new Set();

      messages.forEach((msg) => {
        if (msg.sender !== user.id) uniqueUserIds.add(msg.sender);
        if (msg.recipient !== user.id) uniqueUserIds.add(msg.recipient);
      });

      // Add default Star AI chat user id (example UUID for Star AI)
      // Replace this with your actual Star AI user id or a dummy object for UI
      const STAR_AI_USER_ID = "00000000-0000-0000-0000-000000000001";
      uniqueUserIds.add(STAR_AI_USER_ID);

      // Fetch profile info for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("public_profiles")
        .select("user_id, name, avatar")
        .in("user_id", Array.from(uniqueUserIds));

      if (profilesError) {
        console.error("Failed to fetch profiles", profilesError);
        setLoading(false);
        return;
      }

      // Map profiles by user_id
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      // Construct chat list entries with last message info
      const uniqueChatsMap = new Map();

      messages.forEach((msg) => {
        const otherUserId = msg.sender === user.id ? msg.recipient : msg.sender;
        if (!uniqueChatsMap.has(otherUserId)) {
          uniqueChatsMap.set(otherUserId, {
            id: otherUserId,
            lastMessage: msg.content,
            lastMessageType: msg.type,
            lastMessageAt: msg.created_at,
            user: profileMap.get(otherUserId) || { name: "Unknown", avatar: null },
          });
        }
      });

      // Also add Star AI if not in chats already
      if (!uniqueChatsMap.has(STAR_AI_USER_ID)) {
        uniqueChatsMap.set(STAR_AI_USER_ID, {
          id: STAR_AI_USER_ID,
          lastMessage: "Start chatting with Star AI",
          lastMessageType: "text",
          lastMessageAt: null,
          user: profileMap.get(STAR_AI_USER_ID) || {
            name: "Star AI",
            avatar: null,
          },
        });
      }

      setChats(Array.from(uniqueChatsMap.values()));
      setLoading(false);
    }

    fetchChats();
  }, []);

  // Handle selecting a chat: close sidebar on mobile
  function handleSelect(chat) {
    onSelectChat(chat);
    setSidebarOpen(false);
  }

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        className="chat-sidebar-toggle-btn"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label="Toggle chat sidebar"
      >
        ☰
      </button>

      <div className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <h2 className="chat-sidebar-title">Messages</h2>

        {loading && <p className="loading-text">Loading chats...</p>}

        {!loading && chats.length === 0 && (
          <p className="empty-text">No chats yet. Start a conversation!</p>
        )}

        <ul className="chat-list">
          {chats.map((chat) => {
            const isActive = selectedChat?.id === chat.id;
            const avatar = chat.user.avatar;
            const name = chat.user.name || "Unknown";

            return (
              <li
                key={chat.id}
                className={`chat-list-item ${isActive ? "active" : ""}`}
                onClick={() => handleSelect(chat)}
              >
                {avatar ? (
                  <img src={avatar} alt={name} className="chat-avatar" />
                ) : (
                  <div className="default-avatar">{name.charAt(0)}</div>
                )}
                <div className="chat-info">
                  <div className="chat-name">{name}</div>
                  <div className="chat-last-message">
                    {chat.lastMessageType === "file" ? "📎 File" : chat.lastMessage}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx>{`
        /* Sidebar toggle button - visible on mobile only */
        .chat-sidebar-toggle-btn {
          display: none;
          position: fixed;
          top: 10px;
          left: 10px;
          z-index: 1001;
          background: #000;
          color: #fff;
          border: none;
          font-size: 24px;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
        }

        /* Sidebar container */
        .chat-sidebar {
          width: 320px;
          max-width: 100vw;
          background: #111;
          color: white;
          height: 100vh;
          overflow-y: auto;
          padding: 1rem;
          box-sizing: border-box;
          border-right: 1px solid #222;
          position: fixed;
          top: 0;
          left: 0;
          transition: transform 0.3s ease;
          z-index: 1000;
        }

        /* Hide sidebar offscreen on mobile by default */
        @media (max-width: 768px) {
          .chat-sidebar {
            transform: translateX(-100%);
            width: 80vw;
            max-width: 320px;
          }
          .chat-sidebar.open {
            transform: translateX(0);
          }
          .chat-sidebar-toggle-btn {
            display: block;
          }
        }

        /* Chat list */
        .chat-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .chat-list-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.2s ease;
        }

        .chat-list-item:hover {
          background-color: #222;
        }

        .chat-list-item.active {
          background-color: #444;
        }

        .chat-avatar,
        .default-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #333;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #ccc;
          font-weight: bold;
          font-size: 18px;
          margin-right: 0.75rem;
          object-fit: cover;
        }

        .chat-info {
          flex: 1;
          overflow: hidden;
        }

        .chat-name {
          font-weight: 600;
          font-size: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chat-last-message {
          font-size: 14px;
          color: #bbb;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .loading-text,
        .empty-text {
          color: #888;
          padding: 1rem;
          text-align: center;
          font-style: italic;
        }
      `}</style>
    </>
  );
}
