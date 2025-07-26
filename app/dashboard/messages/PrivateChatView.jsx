"use client";
import React, { useEffect, useState, useRef } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PrivateChatView({ recipient, user }) {
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const bottomRef = useRef(null);

  // Generate stable private room ID
  const privateRoomId = React.useMemo(() => {
    if (!user?.id || !recipient?.user_id) return null;
    return [user.id, recipient.user_id].sort().join("_");
  }, [user, recipient]);

  // ✅ Fetch private messages (sender/recipient combo)
  const fetchMessages = async () => {
    if (!user?.id || !recipient?.user_id) return;

    const filterString = `and(sender.eq.${user.id},recipient.eq.${recipient.user_id}),and(sender.eq.${recipient.user_id},recipient.eq.${user.id})`;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(filterString)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error.message);
    } else {
      setMessages(data);
      scrollToBottom();
    }
  };

  useEffect(() => {
    if (!user || !recipient) return;
    fetchMessages();

    // ✅ Real-time subscription for new private messages
    const subscription = supabase
      .channel(`private-chat-${privateRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(and(sender.eq.${user.id},recipient.eq.${recipient.user_id}),and(sender.eq.${recipient.user_id},recipient.eq.${user.id}))`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, recipient, privateRoomId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // ✅ Send message
  const handleSend = async (content) => {
    if (!user || !recipient) return;

    let fileUrl = null;
    let metadata = null;

    if (file) {
      setUploading(true);

      const fileName = `private/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("chat_uploads")
        .upload(fileName, file);

      if (uploadError) {
        console.error("File upload error:", uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("chat_uploads")
        .getPublicUrl(fileName);

      fileUrl = urlData.publicUrl;
      metadata = { file_url: fileUrl, file_name: file.name, file_type: file.type };

      setUploading(false);
      setFile(null);
    }

    const { error } = await supabase.from("messages").insert({
      sender: user.id,
      recipient: recipient.user_id,
      content,
      type: file ? "file" : "text",
      metadata,
    });

    if (error) console.error("Error sending message:", error.message);
  };

  // ✅ Typing indicator
  const handleTyping = async () => {
    if (!user || !privateRoomId) return;
    const { error } = await supabase.from("typing").upsert({
      channel_id: privateRoomId,
      user_id: user.id,
      name: user.user_metadata?.name || "Unknown",
      last_typing_at: new Date().toISOString(),
    });
    if (error) console.error("Typing indicator error:", error.message);
  };

  // ✅ Pin & Star handlers
  const handlePin = async (id, isPinned) => {
    const { error } = await supabase
      .from("messages")
      .update({ is_pinned: !isPinned })
      .eq("id", id);
    if (error) console.error("Pin message error:", error.message);
  };

  const handleStar = async (id, isStarred) => {
    const { data: msgData, error: selectError } = await supabase
      .from("messages")
      .select("metadata")
      .eq("id", id)
      .single();

    if (selectError) {
      console.error("Error fetching message for starring:", selectError.message);
      return;
    }

    const starredBy = msgData.metadata?.starred_by || [];
    const newStarredBy = starredBy.includes(user.id)
      ? starredBy.filter((uid) => uid !== user.id)
      : [...starredBy, user.id];

    const { error: updateError } = await supabase
      .from("messages")
      .update({
        metadata: { ...msgData.metadata, starred_by: newStarredBy },
        is_starred: newStarredBy.length > 0,
      })
      .eq("id", id);

    if (updateError) console.error("Error updating star status:", updateError.message);
  };

  return (
    <div className="chat-view">
      <div className="messages-container">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUser={user}
            onPin={() => handlePin(msg.id, msg.is_pinned)}
            onStar={() => handleStar(msg.id, msg.is_starred)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <TypingIndicator username={typingUser} />

      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        uploading={uploading}
        setFile={setFile}
      />
    </div>
  );
}
