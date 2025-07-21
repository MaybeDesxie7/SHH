'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return setError(error.message);

    router.push('/dashboard'); // or redirect to login or onboarding
  };

  return (
    <div className="auth-container" id="signup-container">
      <Image src="/public/images/Robot Face with Dollar Sign Logo.png" alt="Logo" width={80} height={80} className="auth-logo" />
      <h1 className="auth-title">Sign Up</h1>
      <form onSubmit={handleSignup} className="auth-form">
        <input
          type="email"
          id="signup-email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <div className="auth-password-group">
          <input
            type={showPassword ? 'text' : 'password'}
            id="signup-password"
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
        <button type="submit" className="auth-button">Sign Up</button>
        <p className="auth-switch">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </form>
    </div>
  );
}
