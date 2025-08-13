'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import '@/styles/style.css'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'affiliate',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError(null)

    // 1️⃣ Sign up user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (signUpError) return setError(signUpError.message)

    const user = signUpData.user
    if (!user) return setError("Signup failed: no user returned")

    // 2️⃣ Insert into profiles table
    const { error: profileError } = await supabase.from('profiles').insert({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      role: formData.role,
      avatar: '',
      user_id: user.id,
    })

    if (profileError) return setError(profileError.message)

    // 3️⃣ Automatically sign in user after signup
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })
    if (loginError) return setError(loginError.message)

    router.push('/dashboard')
  }

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSignup}>
        <img src="/logo.png" alt="Logo" className="auth-logo" />
        <h2>Create Your Account</h2>

        {error && <p className="auth-error">{error}</p>}

        <input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />
        <input
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        />
        <div className="password-field">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="affiliate">Affiliate</option>
          <option value="influencer">Social Media Influencer</option>
          <option value="developer">Developer</option>
          <option value="creator">Content Creator</option>
          <option value="marketer">Marketer</option>
        </select>

        <button type="submit" className="auth-btn">Sign Up</button>

        <p className="or-separator">or</p>

        <button type="button" className="google-btn" onClick={handleGoogleSignup}>
          Sign Up with Google
        </button>

        <p className="auth-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </form>
    </div>
  )
}
