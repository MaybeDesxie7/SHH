'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkAccess();
  }, [router]);

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-container">
      <h1>Welcome, Admin</h1>
      <p className="admin-email">Logged in as: {user?.email}</p>

      <div className="admin-cards">
        <div className="admin-card">📈 User Growth</div>
        <div className="admin-card">💰 Earnings</div>
        <div className="admin-card">🛠️ Tools</div>
        <div className="admin-card">📬 Support Messages</div>
      </div>
    </div>
  );
}
