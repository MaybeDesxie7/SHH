"use client";
import React from "react";
import { Users, User2, Pin, Dot, Info } from "lucide-react";
import "@/styles/dashboard.css";
export default function ChatHeader({ activeGroup, activeUser, activeView }) {
  return (
    <div className="chat-header">
      {activeView === "group" && activeGroup && (
        <div className="chat-header-content">
          <Users size={20} className="chat-header-icon" />
          <div className="chat-header-info">
            <div className="chat-header-title">
              {activeGroup.name}
              {activeGroup.pinned && <Pin size={14} className="pin-icon" />}
            </div>
            <div className="chat-header-meta">
              {activeGroup.description || "No description provided"}
            </div>
          </div>
        </div>
      )}

      {activeView === "private" && activeUser && (
        <div className="chat-header-content">
          <img
            src={activeUser.avatar_url || "/default-avatar.png"}
            className="chat-header-avatar"
            alt={activeUser.name}
          />
          <div className="chat-header-info">
            <div className="chat-header-title">
              {activeUser.name}
              <Dot size={14} className="dot-online" />
            </div>
            <div className="chat-header-meta">Role: {activeUser.role}</div>
          </div>
        </div>
      )}

      {!activeGroup && !activeUser && (
        <div className="chat-header-content chat-header-placeholder">
          <Info size={16} /> Select a chat to begin
        </div>
      )}
    </div>
  );
}
