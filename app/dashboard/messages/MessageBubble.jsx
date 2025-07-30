"use client";
import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { FaThumbtack } from "react-icons/fa";
import { BsFillPinAngleFill } from "react-icons/bs";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";
import { PiSmileyBold } from "react-icons/pi";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const EMOJIS = ["👍", "🔥", "😂", "❤️", "😮", "🎯"];

export default function MessageBubble({ message, currentUser, onPin, onStar }) {
  const isMine = message.user_id === currentUser?.id;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReaction = async (emoji) => {
    await supabase.from("message_reactions").insert({
      message_id: message.id,
      user_id: currentUser.id,
      emoji,
    });
    setShowEmojiPicker(false);
  };

  const isPinned = message.pinned || false;
  const isStarred = message.starred_by?.includes(currentUser.id);

  return (
    <div className={`message-bubble ${isMine ? "own" : "other"}`}>
      <div className="message-header">
        {message.avatar_url && (
          <img src={message.avatar_url} alt="avatar" className="avatar" />
        )}
        {!isMine && (
          <span className="sender">{message.sender_name}</span>
        )}
        <span className="timestamp">
          {formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true,
          })}
        </span>
        {isPinned && <BsFillPinAngleFill className="pinned-icon" />}
      </div>

      <div className="message-content">
        <p>{message.content}</p>
        {message.file_url && (
          <a href={message.file_url} target="_blank" rel="noreferrer">
            📎 {message.file_name}
          </a>
        )}
      </div>

      <div className="message-actions">
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <PiSmileyBold />
        </button>
        <button onClick={() => onPin(message.id)}>
          <FaThumbtack />
        </button>
        <button onClick={() => onStar(message.id)}>
          {isStarred ? <AiFillStar color="gold" /> : <AiOutlineStar />}
        </button>
      </div>

      {showEmojiPicker && (
        <div className="emoji-picker">
          {EMOJIS.map((emoji) => (
            <button key={emoji} onClick={() => handleReaction(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      {message.reactions && message.reactions.length > 0 && (
        <div className="reactions-display">
          {message.reactions.map((r, index) => (
            <span key={index}>{r.emoji}</span>
          ))}
        </div>
      )}
    </div>
  );
}
