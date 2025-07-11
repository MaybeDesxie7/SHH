'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    username: '',
    role: '',
    avatar: '',
    agree: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.agree) return setError('Please accept the terms and conditions');

    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const userId = data.user?.id;

      if (userId) {
        const { error: profileError } = await supabase.from('profiles').insert([{
          user_id: userId, // ✅ correct foreign key column
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
         avatar: form.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(form.name),
        }]);

        if (profileError) {
          setError(profileError.message);
        } else {
          alert('Signup successful! Please check your email to verify.');
          router.push('/login');
        }
      }

      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSignup}>
        <h2>Sign Up</h2>

        <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} />
        <input type="text" name="username" placeholder="Username" required onChange={handleChange} />
        <input type="text" name="phone" placeholder="Phone Number" required onChange={handleChange} />
        <input type="text" name="address" placeholder="Address / Country" required onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />

        <select name="role" required onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="both">Both</option>
        </select>

        <label className="auth-checkbox">
          <input type="checkbox" name="agree" onChange={handleChange} />
          I agree to Smart Hustle Hub's terms and privacy policy.
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Create Account'}
        </button>

        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
}
