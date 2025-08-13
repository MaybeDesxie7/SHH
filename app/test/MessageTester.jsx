"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function MessageTester() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherUserId, setOtherUserId] = useState(
    "e3c5d503-ec54-4e97-bd6e-e576e01bb4c8"
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  const bottomRef = useRef(null);

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  // 1️⃣ Get logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting logged-in user:", error);
        return;
      }
      console.log("Logged-in user:", data?.user);
      setCurrentUserId(data?.user?.id);
    };
    fetchUser();
  }, []);

  // 2️⃣ Fetch messages safely
  const fetchMessages = async () => {
    if (!currentUserId || !otherUserId) {
      console.log("Waiting for both user IDs before fetching messages...");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, recipient_id, content, created_at")
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Supabase fetch error:", error);
        return;
      }

      console.log("Fetched messages:", data);
      setMessages(data || []);
      scrollToBottom();
    } catch (err) {
      console.error("Unexpected fetch error:", err);
    }
  };

  // 3️⃣ Real-time subscription
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    // Initial fetch
    fetchMessages();

    const channel = supabase
      .channel(`dm:${currentUserId}:${otherUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new;
          const relevant =
            (msg.sender_id === currentUserId &&
              msg.recipient_id === otherUserId) ||
            (msg.sender_id === otherUserId &&
              msg.recipient_id === currentUserId);
          if (relevant) {
            setMessages((prev) => [...prev, msg]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUserId, otherUserId]);

  // 4️⃣ Send message
  const sendMessage = async () => {
    if (!input.trim() || !currentUserId || !otherUserId) return;

    setPending(true);
    const { error } = await supabase.from("messages").insert([
      {
        sender_id: currentUserId,
        recipient_id: otherUserId,
        content: input.trim(),
      },
    ]);
    setPending(false);

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    setInput("");
    fetchMessages(); // Refresh after sending
  };

  return (
    <div
      style={{
        background: "#000",
        color: "#fff",
        padding: "1rem",
        height: "100vh",
      }}
    >
      <h2>Message Tester</h2>
      <p>Logged-in User ID: {currentUserId || "Loading..."}</p>
      <p>Other User ID: {otherUserId}</p>

      <button onClick={fetchMessages}>Fetch Messages</button>

      <div
        style={{
          marginTop: "1rem",
          maxHeight: "60vh",
          overflowY: "auto",
          border: "1px solid #555",
          padding: "0.5rem",
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: "0.5rem",
              color: m.sender_id === currentUserId ? "lightgreen" : "lightblue",
            }}
          >
            <strong>{m.sender_id === currentUserId ? "You" : "Other"}:</strong>{" "}
            {m.content}
            <div style={{ fontSize: "10px", opacity: 0.7 }}>
              {new Date(m.created_at).toLocaleString()}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div
        style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a test message…"
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #555",
            background: "#111",
            color: "#fff",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          disabled={pending || !input.trim()}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            background: pending ? "#555" : "#0b5",
          }}
        >
          {pending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
