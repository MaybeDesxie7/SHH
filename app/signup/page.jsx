'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    })

    if (signUpError) {
      setError(signUpError.message)
    } else {
      const { error: profileError } = await supabase.from('profiles').insert({
        name,
        email,
        user_id: data.user.id,
        avatar: 'default.png',
        role: 'buyer'
      })

      if (profileError) {
        setError(profileError.message)
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <form onSubmit={handleSignup}>
      <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Signup</button>
      {error && <p style={{color:'red'}}>{error}</p>}
    </form>
  )
}
