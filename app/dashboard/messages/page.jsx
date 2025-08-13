"use client";

import React, { useState, useEffect } from "react";
import PrivateChatView from "./PrivateChatView";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import "@/styles/dashboard.css";

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatList, setChatList] = useState([]);

  // Detect desktop screen size
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : false);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) return console.error(error);
      if (data?.user) setCurrentUser(data.user);
    };
    loadUser();
  }, []);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchChats = async () => {
      try {
        const { data: messages, error } = await supabase
          .from("messages")
          .select("id, sender_id, recipient_id, created_at")
          .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const userIdsMap = {};
        messages.forEach(msg => {
          const otherId = msg.sender_id === currentUser.id ? msg.recipient_id : msg.sender_id;
          if (otherId && !userIdsMap[otherId]) userIdsMap[otherId] = msg.created_at;
        });

        const userIds = Object.keys(userIdsMap);

        const { data: profiles, error: profilesErr } = await supabase
          .from("public_profiles")
          .select("user_id, name, avatar")
          .in("user_id", userIds);

        if (profilesErr) throw profilesErr;

        const chats = profiles.map(p => ({
          ...p,
          lastMessageAt: userIdsMap[p.user_id]
        }));

        chats.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

        // Cute star bot avatar
        const defaultChat = {
          user_id: "star-ai",
          name: "Star AI",
          avatar: null,
          lastMessageAt: new Date().toISOString()
        };

        setChatList([defaultChat, ...chats]);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };

    fetchChats();
  }, [currentUser]);

  if (!currentUser) return <p className="text-center mt-10">Loading user…</p>;

  function handleNavClick() {
    if (!isDesktop) setSidebarOpen(false);
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo">Glimo</div>
        <nav>
          <ul>
            <li>
              <a href="/dashboard" onClick={handleNavClick}>
                <i className="fas fa-home"></i> Dashboard
              </a>
            </li>
            <li>
              <a href="/dashboard/profile" onClick={handleNavClick}>
                <i className="fas fa-user"></i> Profile
              </a>
            </li>
            <li>
              <a href="/dashboard/hustlestreet" onClick={handleNavClick}>
                <i className="fas fa-briefcase"></i> Hustle Street
              </a>
            </li>
            <li>
              <a href="/dashboard/messages" onClick={handleNavClick}>
                <i className="fas fa-envelope"></i> Messages
              </a>
            </li>
            <li>
              <a href="/dashboard/tools" onClick={handleNavClick}>
                <i className="fas fa-toolbox"></i> Tools
              </a>
            </li>
            <li>
              <a href="/dashboard/ebooks" onClick={handleNavClick}>
                <i className="fas fa-book"></i> Ebooks
              </a>
            </li>
            <li>
              <a href="/dashboard/HustleChallenges" onClick={handleNavClick}>
                <i className="fas fa-trophy"></i> Challenges
              </a>
            </li>
            <li>
              <a href="/dashboard/offers" className="active" onClick={handleNavClick}>
                <i className="fas fa-tags"></i> Offers
              </a>
            </li>
            <li>
              <a href="/dashboard/help_center" onClick={handleNavClick}>
                <i className="fas fa-question-circle"></i> Help Center
              </a>
            </li>

            {/* Animated Premium Button */}
            <motion.li
              style={{
                background: "linear-gradient(90deg, #FFD700, #FFA500)",
                borderRadius: "8px",
                margin: "10px 0",
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [1, 0.9, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <a href="/dashboard/Premium" onClick={handleNavClick} style={{ color: "#fff", fontWeight: "bold" }}>
                <i className="fas fa-crown"></i> Go Premium
              </a>
            </motion.li>

            <li>
              <a href="/dashboard/settings" onClick={handleNavClick}>
                <i className="fas fa-cog"></i> Settings
              </a>
            </li>
            <li>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff4d4d",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "8px 16px",
                }}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div className="user-info">
            <span>Deals & Offers</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button id="toggleModeBtn">
              <i className="fas fa-adjust" />
            </button>
            <button id="toggleMenuBtn" onClick={() => setSidebarOpen(prev => !prev)}>
              <i className="fas fa-bars" />
            </button>
          </div>
        </header>

        <div className="messages-wrapper-mobile h-screen flex flex-col bg-black text-white">
          {!selectedChat ? (
            <div className="flex flex-col h-full">
              <header className="px-4 py-3 border-b border-limegreen font-bold text-lg">
                Messages
              </header>
              <div className="flex-1 overflow-y-auto chat-list-scroll">
                {chatList.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-900"
                    onClick={() => setSelectedChat(user)}
                  >
                    {user.user_id === "star-ai" ? (
                      <div className="star-avatar">🌟🤖</div>
                    ) : (
                      <img
                        src={user.avatar || "https://i.pravatar.cc/50"}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="ml-3 flex-1">
                      <p className="font-semibold truncate">{user.name}</p>
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {user.lastMessageAt
                        ? new Date(user.lastMessageAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <PrivateChatView
              selectedUser={selectedChat}
              currentUser={currentUser}
              backToList={() => setSelectedChat(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
