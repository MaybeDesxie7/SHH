'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoggedInUser() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setUser(userData.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, avatar")
        .eq("user_id", userData.user.id)
        .single();

      setProfile(profileData);
    };
    fetchUser();
  }, []);

  if (!user) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: '#1a1a1a',
      padding: '8px 12px',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '14px'
    }}>
      <img
        src={profile?.avatar || "https://i.pravatar.cc/100"}
        alt="User Avatar"
        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffd700' }}
      />
      <div>
        <div style={{ fontWeight: '600', fontSize: '15px' }}>
          {profile?.name || user.user_metadata?.name || user.email}
        </div>
        <div style={{ fontSize: '12px', color: '#ccc' }}>
          {user.email}
        </div>
      </div>
    </div>
  );
}
