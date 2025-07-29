"use client";
import React, { useEffect, useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import GroupChatView from "./GroupChatView";
import PrivateChatView from "./PrivateChatView";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [search, setSearch] = useState("");

  const router = useRouter();

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // Fetch user and auto-join role group
  useEffect(() => {
    const initUserAndGroup = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return router.push("/login");
      setUser(data.user);
    };
    initUserAndGroup();
  }, [router]);

  const handleDashboardClick = () => {
    if (!isDesktop) setSidebarOpen(false);
  };

  const handleSelectGroup = (group) => {
    setActiveGroup(group);
    setActiveUser(null);
    if (!isDesktop) setChatOpen(true);
    setSearch("");
  };

  const handleSelectUser = (chatUser) => {
    setActiveUser(chatUser);
    setActiveGroup(null);
    if (!isDesktop) setChatOpen(true);
    setSearch("");
  };

  const handleBackToList = () => {
    setChatOpen(false);
    setSearch("");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`} id="sidebar">
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li>
              <a href="/dashboard" onClick={handleDashboardClick}>
                <i className="fas fa-home"></i> Dashboard
              </a>
            </li>
            <li><a href="/dashboard/profile"><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/hustlestreet"><i className="fas fa-briefcase"></i> Hustle Street</a></li>
            <li><a href="/dashboard/messages" className="active"><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools"><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks"><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/tutorials"><i className="fas fa-video"></i> Tutorials</a></li>
            <li><a href="/dashboard/offers"><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/help_center"><i className="fas fa-question-circle"></i> Help Center</a></li>
            <li><a href="/dashboard/settings"><i className="fas fa-cog"></i> Settings</a></li>
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

      <main className="main-content">
        <header>
          <div className="user-info">
            <span>Messages</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button id="toggleModeBtn" title="Toggle Light/Dark Mode">
              <i className="fas fa-adjust"></i>
            </button>
            <button
              id="toggleMenuBtn"
              title="Toggle Menu"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <i className="fas fa-bars"></i>
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
                activeGroup={activeGroup}
                activeUser={activeUser}
                activeView={activeView}
              />
              {activeView === "group" && activeGroup ? (
                <GroupChatView group={activeGroup} user={user} />
              ) : activeView === "private" && activeUser ? (
                <PrivateChatView recipient={activeUser} user={user} />
              ) : (
                <div className="messages-placeholder">Select a chat to start messaging.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="mobile-messages">
            <div className={`mobile-chat-list ${chatOpen ? "slide-out" : "slide-in"}`}>
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
            </div>

            <div className={`mobile-chat-panel ${chatOpen ? "slide-in" : "slide-out"}`}>
              <div className="chat-header-mobile">
                <button className="back-btn" onClick={handleBackToList}>
                  <i className="fas fa-arrow-left"></i>
                </button>
                <ChatHeader
                  activeGroup={activeGroup}
                  activeUser={activeUser}
                  activeView={activeView}
                />
              </div>
              {activeView === "group" && activeGroup ? (
                <GroupChatView group={activeGroup} user={user} />
              ) : activeView === "private" && activeUser ? (
                <PrivateChatView recipient={activeUser} user={user} />
              ) : (
                <div className="messages-placeholder">Select a chat to start messaging.</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
