'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InviteBetaPage() {
  const router = useRouter();

  useEffect(() => {
    document.cookie = 'beta_access=true; path=/;';
    router.push('/dashboard'); // Redirect to dashboard or any protected area
  }, []);

  return <p>Setting up your beta access...</p>;
}
