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
    async function verifyToken() {
      const token = searchParams.get('token');
      console.log('Token from URL:', token);

      if (!token) {
        setStatus('No token provided.');
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Logged in user:', user, 'Error:', userError);

      if (userError || !user) {
        setStatus('You need to log in first.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('beta_invite_token')
        .eq('user_id', user.id)
        .single();

      console.log('Profile fetched:', profile, 'Error:', profileError);

      if (profileError || !profile) {
        setStatus('Profile not found.');
        return;
      }

      if (profile.beta_invite_token?.trim().toLowerCase() !== token.trim().toLowerCase()) {
        setStatus('Invalid or expired invitation token.');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_beta_user: true })
        .eq('user_id', user.id);

      if (updateError) {
        setStatus('Failed to update beta status.');
        return;
      }

      setStatus('You have joined the beta! Redirecting...');
      setTimeout(() => router.push('/'), 2000);
    }

    verifyToken();
  }, [searchParams, router, supabase]);

  return (
    <div className="main-content">
      <h1 className="title">🔒 Beta Access</h1>
      <p>{status}</p>
    </div>
  );
}
