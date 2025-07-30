"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "@/styles/dashboard.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function UserSearchModal({ onClose, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("public_profiles")
        .select("user_id, name, avatar")
        .order("name", { ascending: true });

      if (error) console.error("Error fetching users:", error);
      else setUsers(data);

      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content user-search-modal">
        <div className="modal-header">
          <h2 className="modal-title">Start a Chat</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            aria-label="Search users"
          />

          {loading ? (
            <p className="loading-text">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="no-results">No users found.</p>
          ) : (
            <ul className="user-list">
              {filteredUsers.map((user) => (
                <li key={user.user_id} className="user-item">
                  {(user.avatar && user.avatar.trim() !== "") ? (
                    <img
                      src={user.avatar}
                      alt={`${user.name}'s avatar`}
                      className="user-avatar"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="https://i.pravatar.cc/100"
                      alt="default avatar"
                      className="user-avatar"
                      loading="lazy"
                    />
                  )}

                  <span className="user-name">{user.name}</span>

                  <button
                    className="start-chat-btn"
                    onClick={() => onSelectUser(user)}
                    aria-label={`Start chat with ${user.name}`}
                  >
                    Start Chat
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
