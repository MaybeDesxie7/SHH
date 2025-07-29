// app/beta-join/page.tsx
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function BetaJoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Checking token...');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('No token provided.');
      return;
    }

    const verifyToken = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus('You need to log in first.');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('beta_invite_token')
        .eq('user_id', user.id)
        .single();

      if (error || !profile || profile.beta_invite_token !== token) {
        setStatus('Invalid or expired invitation token.');
        return;
      }

      await supabase
        .from('profiles')
        .update({ is_beta_user: true })
        .eq('user_id', user.id);

      setStatus('You have joined the beta! Redirecting...');
      setTimeout(() => router.push('/'), 2000);
    };

    verifyToken();
  }, []);

  return (
    <div className="main-content">
      <h1 className="title">🔒 Beta Access</h1>
      <p>{status}</p>
    </div>
  );
}
