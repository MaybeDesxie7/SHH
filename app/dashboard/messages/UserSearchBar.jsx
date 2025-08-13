"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UserSearchBar({ onSelectUser, currentUserId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm) {
      setResults([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("public_profiles")
          .select("user_id, name, avatar")
          .ilike("name", `%${searchTerm}%`)
          .neq("user_id", currentUserId) // exclude logged-in user
          .limit(10);

        if (error) {
          console.error("Error fetching users:", error);
          setResults([]);
        } else {
          setResults(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentUserId]);

  return (
    <div className="user-search-bar">
      <input
        type="text"
        placeholder="Search users..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && <div className="text-gray-400 mt-1 text-sm">Searching...</div>}

      {results.length > 0 && (
        <ul className="search-results">
          {results.map((user) => (
            <li key={user.user_id} onClick={() => onSelectUser(user)}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="avatar" />
              ) : (
                <div className="default-avatar">{user.name?.charAt(0).toUpperCase() || "U"}</div>
              )}
              <span>{user.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
