"use client";
import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import MessageInput from "./MessageInput";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GroupChatView({ group, user }) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!group?.id) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("group_id", group.id)
        .order("created_at", { ascending: true });

      if (!error) setMessages(data || []);
    };

    fetchMessages();

    const messageSub = supabase
      .channel(`group-messages-${group.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `group_id=eq.${group.id}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    const typingSub = supabase
      .channel(`typing-${group.id}`)
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.user_id !== user?.id) {
          setTypingUsers((prev) => {
            if (!prev.includes(payload.name)) return [...prev, payload.name];
            return prev;
          });

          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== payload.name));
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSub);
      supabase.removeChannel(typingSub);
    };
  }, [group, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text, fileUrl = null) => {
    if (!user || !group) return;
    await supabase.from("messages").insert({
      content: text,
      group_id: group.id,
      sender: user.id,
      type: fileUrl ? "file" : "text",
      metadata: fileUrl ? { file_url: fileUrl } : null
    });
  };

  const handleTyping = async () => {
    if (!group || !user) return;
    supabase.channel(`typing-${group.id}`).send({
      type: "broadcast",
      event: "typing",
      payload: {
        user_id: user.id,
        name: user.user_metadata?.name || "User"
      }
    });
  };

  if (!group) {
    return (
      <div id="group-chat-wrapper">
        <p className="empty-state">Select a group to start chatting</p>
      </div>
    );
  }

  return (
    <div id="group-chat-wrapper">
      <div id="group-chat-header">
        <h2>{group.name}</h2>
        <p>{group.description}</p>
        <span className="group-role-badge">{group.role || "General"} Group</span>
      </div>

      <div id="group-chat-body">
        <div id="group-chat-messages">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender === user?.id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <TypingIndicator users={typingUsers} />

        <div id="group-chat-input-wrapper">
          <MessageInput
            onSend={handleSendMessage}
            onTyping={handleTyping}
            groupId={group.id}
            user={user}
          />
        </div>
      </div>
    </div>
  );
}
