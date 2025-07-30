"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion"; // needed for premium pulse, remove if you don't use framer-motion
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import GroupChatView from "./GroupChatView";
import PrivateChatView from "./PrivateChatView";
import UserSearchModal from "./UserSearchModal"; // ✅ IMPORT MODAL
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import "@/styles/dashboard.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState("group");
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const router = useRouter();

  // Fix: handle nav clicks close sidebar on mobile
  const handleNavClick = () => {
    if (!isDesktop) setSidebarOpen(false);
  };

  useEffect(() => {
    const checkScreenSize = () => {
      const isWide = window.innerWidth >= 768;
      setIsDesktop(isWide);
      setSidebarOpen(isWide);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data?.user) router.push("/login");
      else setUser(data.user);
    });
  }, [router]);

  useEffect(() => {
    const last = localStorage.getItem("activeView");
    if (last === "group" || last === "private") setActiveView(last);
  }, []);

  useEffect(() => {
    localStorage.setItem("activeView", activeView);
  }, [activeView]);

  const handleSelectGroup = (group) => {
    setActiveGroup(group);
    setActiveUser(null);
    if (!isDesktop) setChatOpen(true);
  };

  const handleSelectUser = (u) => {
    setActiveUser(u);
    setActiveGroup(null);
    if (!isDesktop) setChatOpen(true);
  };

  const handleBack = () => {
    setChatOpen(false);
    setActiveGroup(null);
    setActiveUser(null);
  };

  const [chatSidebarVisible, setChatSidebarVisible] = useState(false);

  const toggleChatSidebar = () => setChatSidebarVisible((prev) => !prev);
  const closeChatSidebar = () => setChatSidebarVisible(false);


  function toggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  const openUserSearch = () => setSearchModalOpen(true);
  const closeUserSearch = () => setSearchModalOpen(false);
  const openGroupSearch = () => router.push("/dashboard/messages/group-search");

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo">Smart Hustle Hub</div>
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
              <a href="/dashboard/messages" className="active" onClick={handleNavClick}>
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
              <a href="/dashboard/offers" onClick={handleNavClick}>
                <i className="fas fa-tags"></i> Offers
              </a>
            </li>
            <li>
              <a href="/dashboard/help_center" onClick={handleNavClick}>
                <i className="fas fa-question-circle"></i> Help Center
              </a>
            </li>

            {/* Premium pulse animation */}
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
            <span>Messages</span>
            {/* Fix img src warning by rendering null if no avatar */}
            {user.user_metadata?.avatar ? (
              <img src={user.user_metadata.avatar} alt="User Profile" />
            ) : (
              <img src="https://i.pravatar.cc/100" alt="User Profile" />
            )}
            <button id="toggleModeBtn" title="Toggle Light/Dark Mode">
              <i className="fas fa-adjust" />
            </button>
            <button id="toggleMenuBtn" onClick={toggleSidebar} title="Toggle Menu">
              <i className="fas fa-bars" />
            </button>
          </div>
        </header>

        {isDesktop ? (
          <div className="messages-wrapper">
            <ChatSidebar
              user={user}
              onSelectGroup={handleSelectGroup}
              onSelectUser={handleSelectUser}
              activeView={activeView}
              setActiveView={setActiveView}
            />
            <div className="messages-panel">
              <ChatHeader
                user={user}
                activeView={activeView}
                activeGroup={activeGroup}
                activeUser={activeUser}
              />
              {activeView === "group" && activeGroup ? (
                <GroupChatView group={activeGroup} user={user} />
              ) : activeView === "private" && activeUser ? (
                <PrivateChatView recipient={activeUser} user={user} />
              ) : (
                <div className="messages-placeholder">
                  <button className="start-button" onClick={openUserSearch}>
                    Start Chatting
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mobile-messages">
            <div
              className={`mobile-chat-list ${chatOpen ? "slide-out" : "slide-in"}`}
            >
              <div className="mobile-topbar">
                <h2>{activeView === "group" ? "Groups" : "Chats"}</h2>
              </div>
              <ChatSidebar
                user={user}
                onSelectGroup={handleSelectGroup}
                onSelectUser={handleSelectUser}
                activeView={activeView}
                setActiveView={setActiveView}
              />

              {/* NEW: Show Search Groups button on mobile group view when no active group */}
              {activeView === "group" && !activeGroup && (
                <div className="messages-placeholder">
                  <button className="start-button" onClick={openGroupSearch}>
                    Search Groups
                  </button>
                </div>
              )}

              {activeView === "private" && !activeUser && !activeGroup && (
                <div className="messages-placeholder">
                  <button className="start-button" onClick={openUserSearch}>
                    Start Chatting
                  </button>
                </div>
              )}
            </div>

            <div
              className={`mobile-chat-panel ${chatOpen ? "slide-in" : "slide-out"}`}
            >
              <div className="chat-header-mobile">
                <button className="back-btn" onClick={handleBack}>
                  <i className="fas fa-arrow-left"></i>
                </button>
                <ChatHeader
                  user={user}
                  activeView={activeView}
                  activeGroup={activeGroup}
                  activeUser={activeUser}
                />
              </div>
              {activeView === "group" && activeGroup ? (
                <GroupChatView group={activeGroup} user={user} />
              ) : activeView === "private" && activeUser ? (
                <PrivateChatView recipient={activeUser} user={user} />
              ) : (
                <div className="messages-placeholder">
                  <button className="start-button" onClick={openUserSearch}>
                    Start Chatting
                  </button>
                </div>
              )}
            </div>

            <div className="mobile-tab-bar">
              <button
                className={`tab-btn ${activeView === "group" ? "active" : ""}`}
                onClick={() => {
                  setActiveView("group");
                  setChatOpen(false);
                }}
              >
                <i className="fas fa-users"></i>
                <span>Groups</span>
              </button>
              <button
                className={`tab-btn ${activeView === "private" ? "active" : ""}`}
                onClick={() => {
                  setActiveView("private");
                  setChatOpen(false);
                }}
              >
                <i className="fas fa-user-friends"></i>
                <span>Chats</span>
              </button>
            </div>
          </div>
        )}

        {/* User Search Modal */}
        {searchModalOpen && (
          <UserSearchModal
            onSelectUser={(u) => {
              handleSelectUser(u);
              closeUserSearch();
            }}
            onClose={closeUserSearch}
          />
        )}
      </main>
    </div>
  );
}
