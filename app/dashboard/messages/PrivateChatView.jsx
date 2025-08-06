"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const EMOJIS = ["😀", "😂", "😍", "👍", "🙏", "🎉"];

export default function PrivateChatView({ currentUserId, selectedUserId }) {
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState("Online"); // placeholder
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch recipient info
  useEffect(() => {
    if (!selectedUserId) return;

    async function fetchUser() {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("user_id, name, avatar")
        .eq("user_id", selectedUserId)
        .single();

      if (!error && data) {
        setOtherUser(data);
      } else {
        console.error("Failed to load user", error);
      }
    }

    fetchUser();
  }, [selectedUserId]);

  // Load and subscribe to messages
  useEffect(() => {
    if (!currentUserId || !selectedUserId) return;

    async function fetchMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender.eq.${currentUserId},recipient.eq.${selectedUserId}),and(sender.eq.${selectedUserId},recipient.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      if (!error) {
        setMessages(data);
      } else {
        console.error("Failed to fetch messages", error);
      }
    }

    fetchMessages();

    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new;
          const isRelevant =
            (msg.sender === currentUserId && msg.recipient === selectedUserId) ||
            (msg.sender === selectedUserId && msg.recipient === currentUserId);
          if (isRelevant) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedUserId]);

  // Scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  async function sendMessage(content, type = "text", metadata = null) {
    if (!content.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        sender: currentUserId,
        recipient: selectedUserId,
        content,
        type,
        metadata,
      },
    ]);

    if (error) {
      alert("Error sending message: " + error.message);
    } else {
      setNewMessage("");
      setShowEmojiPicker(false);
    }
  }

  // Handle file uploads
  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
    const { data, error: uploadError } = await supabase.storage
      .from("chat-files")
      .upload(fileName, file);

    if (uploadError) {
      alert("File upload failed: " + uploadError.message);
      return;
    }

    const { data: urlData, error: urlError } = supabase.storage
      .from("chat-files")
      .getPublicUrl(fileName);

    if (urlError || !urlData?.publicUrl) {
      alert("Failed to get file URL: " + urlError?.message);
      return;
    }

    await sendMessage(urlData.publicUrl, "file", { fileName: file.name });
  }

  function addEmoji(emoji) {
    setNewMessage((prev) => prev + emoji);
  }

  return (
    <div className="chat-view">
      {/* Top bar */}
      <div className="chat-header">
        {otherUser ? (
          <>
            {otherUser.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.name} className="avatar" />
            ) : (
              <div className="default-avatar">
                {otherUser.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="user-info">
              <div className="username">{otherUser.name}</div>
              <div className="status">{onlineStatus}</div>
            </div>
          </>
        ) : (
          <div className="loading">Loading user...</div>
        )}
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${
              msg.sender === currentUserId ? "sent" : "received"
            }`}
          >
            {msg.type === "file" ? (
              <a
                href={msg.content}
                target="_blank"
                rel="noopener noreferrer"
                className="file-link"
              >
                📎 {msg.metadata?.fileName || "File"}
              </a>
            ) : (
              <p>{msg.content}</p>
            )}
            <span className="timestamp">
              {new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <button
          className="emoji-toggle-btn"
          onClick={() => setShowEmojiPicker((v) => !v)}
        >
          😀
        </button>

        {showEmojiPicker && (
          <div className="emoji-picker">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className="emoji-btn"
                onClick={() => addEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(newMessage);
            }
          }}
        />

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button
          className="file-upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          📎
        </button>

        <button
          className="send-btn"
          onClick={() => sendMessage(newMessage)}
          disabled={!newMessage.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
