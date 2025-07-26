"use client";
import React, { useState } from "react";
import { AiOutlineSend, AiOutlinePaperClip } from "react-icons/ai";

export default function MessageInput({ onSend, onTyping, uploading, setFile }) {
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (content.trim() === "") return;
    onSend(content);
    setContent("");
  };

  return (
    <div className="message-input-wrapper">
      <input
        type="file"
        id="file-upload"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
          }
        }}
      />
      <label htmlFor="file-upload" className="upload-button">
        <AiOutlinePaperClip />
      </label>

      <input
        type="text"
        className="message-input"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onTyping();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
        placeholder={uploading ? "Uploading file..." : "Type your message..."}
        disabled={uploading}
      />

      <button onClick={handleSend} disabled={uploading}>
        <AiOutlineSend />
      </button>
    </div>
  );
}
