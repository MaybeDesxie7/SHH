"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UserSearchBar({ onSelectUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchTerm) {
        setResults([]);
        return;
      }

      const { data, error } = await supabase
        .from("public_profiles")
        .select("user_id, name, avatar")
        .ilike("name", `%${searchTerm}%`);

      if (!error) setResults(data);
    };

    const delayDebounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div className="user-search-bar">
      <input
        type="text"
        placeholder="Search users..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((user) => (
            <li key={user.user_id} onClick={() => onSelectUser(user)}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="avatar" />
              ) : (
                <div className="default-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <span>{user.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
