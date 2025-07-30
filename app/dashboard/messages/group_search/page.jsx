"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import "@/styles/dashboard.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GroupSearchPage() {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("group_chats")
        .select("id, name, description")
        .order("name", { ascending: true });

      if (error) console.error("Error fetching groups:", error);
      else setGroups(data);

      setLoading(false);
    };

    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinGroup = async (groupId) => {
    const user = await supabase.auth.getUser();
    if (!user?.data?.user?.id) return alert("Not authenticated");

    const { error } = await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: user.data.user.id,
    });

    if (error) {
      console.error("Failed to join group", error);
      alert("Error joining group");
    } else {
      alert("Joined group successfully!");
      router.push("/dashboard/messages");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content user-search-modal">
        <div className="modal-header">
          <h2 className="modal-title">Explore Groups</h2>
          <button
            className="close-btn"
            onClick={() => router.back()}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          <input
            type="text"
            className="search-input"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            aria-label="Search groups"
          />

          {loading ? (
            <p className="loading-text">Loading groups...</p>
          ) : filteredGroups.length === 0 ? (
            <p className="no-results">No groups found.</p>
          ) : (
            <ul className="user-list">
              {filteredGroups.map((group) => (
                <li key={group.id} className="user-item">
                  <div>
                    <strong className="user-name">{group.name}</strong>
                    <p style={{ fontSize: "0.9rem", marginTop: "4px" }}>
                      {group.description || "No description"}
                    </p>
                  </div>

                  <button
                    className="start-chat-btn"
                    onClick={() => handleJoinGroup(group.id)}
                    aria-label={`Join ${group.name}`}
                  >
                    Join Group
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
