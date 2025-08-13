"use client";

/**
 * MessagesPage.jsx
 * - Fully corrected JSX (260+ lines)
 * - Keeps your existing layout (sidebar + main content + header)
 * - Fixes sidebar toggle / header alignment
 * - Adds a pretty search bar above the Star AI pinned chat
 * - Fetches recent chats and public profiles (for search) from Supabase
 * - Opens PrivateChatView on click
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import PrivateChatView from "./PrivateChatView";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import "@/styles/dashboard.css"; // uses your dashboard.css so header matches the dashboard look

// Small, reusable list item for both chats and search results
function ChatListItem({ user, onClick, showTime }) {
  const isStar = user?.user_id === "star-ai";
  const avatarSrc = isStar
    ? null
    : user?.avatar || "https://i.pravatar.cc/50?img=12";

  return (
    <div
      className="flex items-center px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-900"
      onClick={onClick}
      role="button"
      aria-label={`Open chat with ${user?.name || "user"}`}
    >
      {isStar ? (
        <div className="star-avatar text-2xl" aria-hidden>
          🌟🤖
        </div>
      ) : (
        <img
          src={avatarSrc}
          alt={user?.name || "User"}
          className="w-12 h-12 rounded-full object-cover"
          loading="lazy"
        />
      )}

      <div className="ml-3 flex-1">
        <p className="font-semibold truncate">{user?.name}</p>
      </div>

      {showTime ? (
        <div className="text-xs text-gray-500 ml-2">
          {user?.lastMessageAt
            ? new Date(user.lastMessageAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </div>
      ) : null}
    </div>
  );
}

export default function MessagesPage() {
  // Router
  const router = useRouter();

  // Auth / user
  const [currentUser, setCurrentUser] = useState(null);

  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );

  // Messaging state
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatList, setChatList] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const trimmedQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

  // ---------- Window & Layout ----------
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    // initialize once
    setIsDesktop(typeof window !== "undefined" ? window.innerWidth >= 1024 : false);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // ---------- Auth ----------
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
        return;
      }
      if (data?.user) setCurrentUser(data.user);
    };
    loadUser();
  }, []);

  // ---------- Fetch Recent Chats ----------
  useEffect(() => {
    if (!currentUser) return;

    const fetchChats = async () => {
      try {
        // get all messages where the user is either sender or recipient
        const { data: messages, error } = await supabase
          .from("messages")
          .select("id, sender_id, recipient_id, created_at")
          .or(
            `sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Map other user ids to their most recent message time
        const userIdsMap = {};
        (messages || []).forEach((msg) => {
          const otherId =
            msg.sender_id === currentUser.id ? msg.recipient_id : msg.sender_id;
          if (otherId && !userIdsMap[otherId]) {
            userIdsMap[otherId] = msg.created_at;
          }
        });

        const userIds = Object.keys(userIdsMap);

        // If no prior chats, still pin Star AI
        if (userIds.length === 0) {
          setChatList([
            {
              user_id: "star-ai",
              name: "Star AI",
              avatar: null,
              lastMessageAt: new Date().toISOString(),
            },
          ]);
          return;
        }

        // Fetch profiles for those user ids
        const { data: profiles, error: profilesErr } = await supabase
          .from("public_profiles")
          .select("user_id, name, avatar")
          .in("user_id", userIds);

        if (profilesErr) throw profilesErr;

        // Compose chats array
        const chats = (profiles || []).map((p) => ({
          ...p,
          lastMessageAt: userIdsMap[p.user_id],
        }));

        // Sort by recency
        chats.sort(
          (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );

        // Always pin Star AI at top
        const starAI = {
          user_id: "star-ai",
          name: "Star AI",
          avatar: null,
          lastMessageAt: new Date().toISOString(),
        };

        setChatList([starAI, ...chats]);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };

    fetchChats();
  }, [currentUser]);

  // ---------- Live Search ----------
  useEffect(() => {
    let cancelled = false;

    const runSearch = async () => {
      if (!trimmedQuery) {
        setSearchResults([]);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("public_profiles")
          .select("user_id, name, avatar")
          .ilike("name", `%${trimmedQuery}%`)
          .neq("user_id", currentUser?.id)
          .limit(12);

        if (!cancelled) {
          if (error) {
            console.error(error);
            setSearchResults([]);
          } else {
            setSearchResults(data || []);
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setSearchResults([]);
        }
      }
    };

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [trimmedQuery, currentUser]);

  // ---------- Handlers ----------
  const handleNavClick = useCallback(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [isDesktop]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const openChat = useCallback((user) => {
    setSelectedChat(user);
  }, []);

  // ---------- Render ----------
  if (!currentUser) {
    return <p className="text-center mt-10">Loading user…</p>;
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
              <a
                href="/dashboard/offers"
                className="active"
                onClick={handleNavClick}
              >
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
              <a
                href="/dashboard/Premium"
                onClick={handleNavClick}
                style={{ color: "#fff", fontWeight: "bold" }}
              >
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
                onClick={handleLogout}
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
        {/* Header aligned like dashboard (title left, actions right) */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "2px solid #32cd32",
            backgroundColor: "#000",
            gap: "8px",
          }}
        >
          <div style={{ fontWeight: 700 }}>Messages</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            {/* Optional mode button kept for parity with your layout */}
            <button id="toggleModeBtn" title="Toggle theme">
              <i className="fas fa-adjust" />
            </button>
            {/* This button is hidden on desktop via your dashboard.css */}
            <button
              id="toggleMenuBtn"
              onClick={() => setSidebarOpen((prev) => !prev)}
              title="Toggle menu"
            >
              <i className="fas fa-bars" />
            </button>
          </div>
        </header>

        {/* Page wrapper (mobile-first look retained) */}
        <div className="messages-wrapper-mobile h-screen flex flex-col bg-black text-white">
          {!selectedChat ? (
            <div className="flex flex-col h-full">
              {/* Section header inside page */}
              <header className="px-4 py-3 border-b border-limegreen font-bold text-lg">
                Chats
              </header>

              {/* Search Bar (neat + matches theme) */}
              <div
                className="p-3 border-b border-gray-800"
                style={{
                  backgroundColor: "#0a0a0a",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#000",
                    border: "1px solid #32cd32",
                    borderRadius: "12px",
                    padding: "8px 12px",
                  }}
                >
                  <i className="fas fa-search" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name…"
                    aria-label="Search users"
                    className="w-full bg-transparent text-white outline-none"
                    style={{
                      border: "none",
                      height: "32px",
                    }}
                  />
                  {trimmedQuery ? (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs"
                      title="Clear search"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#32cd32",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: "8px",
                      }}
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              </div>

              {/* List: search results (if any) else chats (Star AI pinned) */}
              <div className="flex-1 overflow-y-auto chat-list-scroll">
                {trimmedQuery ? (
                  <>
                    {searchResults.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-gray-400">
                        No users match “{trimmedQuery}”.
                      </div>
                    ) : (
                      searchResults.map((user) => (
                        <ChatListItem
                          key={user.user_id}
                          user={user}
                          onClick={() => openChat(user)}
                          showTime={false}
                        />
                      ))
                    )}
                  </>
                ) : (
                  <>
                    {/* Pinned Star AI at top always */}
                    {chatList.length > 0 && chatList[0]?.user_id === "star-ai" ? (
                      <ChatListItem
                        user={chatList[0]}
                        onClick={() => openChat(chatList[0])}
                        showTime={false}
                      />
                    ) : (
                      <ChatListItem
                        user={{
                          user_id: "star-ai",
                          name: "Star AI",
                          avatar: null,
                          lastMessageAt: new Date().toISOString(),
                        }}
                        onClick={() =>
                          openChat({
                            user_id: "star-ai",
                            name: "Star AI",
                            avatar: null,
                            lastMessageAt: new Date().toISOString(),
                          })
                        }
                        showTime={false}
                      />
                    )}

                    {/* Rest of chats */}
                    {(chatList || [])
                      .filter((c, idx) => !(idx === 0 && c.user_id === "star-ai"))
                      .map((user) => (
                        <ChatListItem
                          key={user.user_id}
                          user={user}
                          onClick={() => openChat(user)}
                          showTime={true}
                        />
                      ))}
                  </>
                )}
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
