"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ChatSidebar({
  onSelectGroup,
  onSelectUser,
  activeView,
  setActiveView,
  user,
}) {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from("group_members")
        .select("group_chats(id, name, description, role)")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching groups:", error.message);
      } else {
        setGroups(data.map((gm) => gm.group_chats) || []);
      }
    };

    const fetchUsers = async () => {
      const { data, error } = await supabase.from("public_profiles").select("*");
      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        const uniqueUsers = [];
        const seen = new Set();
        for (const u of data || []) {
          if (u.user_id && u.user_id !== user.id && !seen.has(u.user_id)) {
            seen.add(u.user_id);
            uniqueUsers.push(u);
          }
        }
        setUsers(uniqueUsers);
      }
    };

    fetchGroups();
    fetchUsers();
  }, [user]);

  const filteredGroups = groups.filter((group) =>
    group.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <button
          className={`tab-btn ${activeView === "group" ? "active" : ""}`}
          onClick={() => setActiveView("group")}
        >
          Groups
        </button>
        <button
          className={`tab-btn ${activeView === "private" ? "active" : ""}`}
          onClick={() => setActiveView("private")}
        >
          Private
        </button>
      </div>

      <div className="chat-search-box">
        <input
          type="text"
          placeholder="Search..."
          className="chat-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="chat-list">
        {activeView === "group" &&
          (filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div
                key={`group-${group.id}`}
                className="chat-list-item"
                onClick={() => onSelectGroup(group)}
              >
                <div className="chat-avatar">{group.name?.charAt(0) || "G"}</div>
                <div className="chat-list-details">
                  <div className="chat-list-name">{group.name}</div>
                  <div className="chat-list-desc">{group.description}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-text">No groups found.</p>
          ))}

        {activeView === "private" &&
          (filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <div
                key={`user-${u.user_id}`}
                className="chat-list-item"
                onClick={() => onSelectUser(u)}
              >
                <img
                  src={u.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="chat-avatar-img"
                />
                <div className="chat-list-name">{u.name || "Unnamed User"}</div>
              </div>
            ))
          ) : (
            <p className="empty-text">No users found.</p>
          ))}
      </div>
    </div>
  );
}
