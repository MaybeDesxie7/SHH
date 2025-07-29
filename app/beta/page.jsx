'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function BetaPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('Checking invite token...');
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!token) {
      setStatus('No token provided.');
      return;
    }

    const checkToken = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('beta_invite_token', token)
        .single();

      if (error || !data) {
        setStatus('Invalid or expired token.');
      } else {
        setStatus(`Welcome, ${data.email}! Your invite token is valid.`);
      }
    };

    checkToken();
  }, [token]);

  return (
    <div className="main-content">
      <h1>Beta Invite</h1>
      <p>{status}</p>
    </div>
  );
}
