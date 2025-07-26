"use client";
import React from "react";

export default function TypingIndicator({ username }) {
  if (!username) return null;

  return (
    <div className="typing-indicator">
      <span>{username} is typing...</span>
    </div>
  );
}
