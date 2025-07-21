'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      return;
    }

    const user_id = data.user.id;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user_id)
      .single();

    if (profile?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="auth-container" id="login-container">
      <Image src="/logo.png" alt="Logo" width={80} height={80} className="auth-logo" />
      <h1 className="auth-title">Login</h1>
      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          id="login-email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <div className="auth-password-group">
          <input
            type={showPassword ? 'text' : 'password'}
            id="login-password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <span
            className="auth-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </span>
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-button">Login</button>
        <p className="auth-switch">
          Don’t have an account? <a href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  );
}
