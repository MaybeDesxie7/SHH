"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FaSmile, FaPaperclip } from "react-icons/fa";

export default function PrivateChatView({ selectedUser, currentUser, backToList }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [file, setFile] = useState(null);
  const bottomRef = useRef(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  // Fetch initial messages
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const fetchMessages = async () => {
      let data = [];
      if (selectedUser.user_id !== "star-ai") {
        const { data: msgs, error } = await supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${currentUser.id},recipient_id.eq.${selectedUser.user_id}),and(sender_id.eq.${selectedUser.user_id},recipient_id.eq.${currentUser.id})`
          )
          .order("created_at", { ascending: true });

        if (error) throw error;
        data = msgs || [];
      }
      setMessages(data);
      scrollToBottom();
    };

    fetchMessages();
  }, [currentUser, selectedUser]);

  // Real-time subscription for all messages including Star AI
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const handleNewMessage = (msg) => {
      // Add only relevant messages
      if (
        msg.sender_id === currentUser.id ||
        msg.recipient_id === currentUser.id ||
        msg.sender_id === "star-ai"
      ) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    };

    // Subscribe to Postgres changes for real users
    let channel;
    if (selectedUser.user_id !== "star-ai") {
      channel = supabase
        .channel(`dm:${currentUser.id}:${selectedUser.user_id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => handleNewMessage(payload.new)
        )
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [currentUser, selectedUser]);

  // Function to simulate Star AI instant reply
  const sendAIMessage = async (text) => {
    const aiMsg = {
      id: Date.now(),
      sender_id: "star-ai",
      recipient_id: currentUser.id,
      content: `🤖 Star AI: ${text}`,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    scrollToBottom();
  };

  // Send message handler
  const sendMessage = async () => {
    const text = input.trim();
    if (!text && !file) return;

    // Star AI message
    if (selectedUser.user_id === "star-ai") {
      await sendAIMessage(text);
      setInput("");
      return;
    }

    // Real user message
    setPending(true);
    try {
      let insertData = { sender_id: currentUser.id, recipient_id: selectedUser.user_id, content: text };
      if (file) insertData.file_url = file.name;

      const { error } = await supabase.from("messages").insert([insertData]);
      if (error) throw error;

      setInput("");
      setFile(null);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="PrivateChatView">
      {/* Header */}
      <div className="chat-header">
        <button className="back-btn" onClick={backToList}>←</button>
        {selectedUser.avatar ? (
          <img src={selectedUser.avatar} alt={selectedUser.name} />
        ) : (
          <div className="avatar-placeholder">{selectedUser.name.charAt(0).toUpperCase()}</div>
        )}
        <div className="user-info">
          <p>{selectedUser.name}</p>
          {selectedUser.user_id !== "star-ai" && <p className="online-status">Online</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((m) => {
          const mine = m.sender_id === currentUser.id;
          const aiMessage = m.sender_id === "star-ai";
          const wrapperClass = aiMessage
            ? "bubble-received-wrapper"
            : mine
            ? "bubble-sent-wrapper"
            : "bubble-received-wrapper";

          return (
            <div key={m.id} className={wrapperClass}>
              <div className={`message-bubble ${aiMessage ? "ai" : mine ? "sent" : "received"}`}>
                <div className={aiMessage ? "italic" : ""}>{m.content}</div>
                <div className="timestamp">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input">
        <button><FaSmile /></button>
        <button><FaPaperclip /></button>
        <textarea
          rows={1}
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={!input.trim() && !file || pending}
        >
          {pending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
