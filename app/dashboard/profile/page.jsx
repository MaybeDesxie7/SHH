'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('https://i.pravatar.cc/150?img=3');
  const avatarInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return router.push('/login');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        console.warn('No existing profile found. Creating a new one...');
        const { error: createError } = await supabase.from('profiles').upsert({
          user_id: user.id,
          name: '',
          email: user.email,
          phone: '',
          address: '',
          avatar: avatarUrl,
        }, { onConflict: 'user_id' });

        if (createError) console.error('Error creating profile:', createError);

        setProfile({
          user_id: user.id,
          name: '',
          email: user.email,
          phone: '',
          address: '',
          avatar: avatarUrl,
        });
      } else {
        setProfile(data);
        setAvatarUrl(data.avatar || avatarUrl);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return alert('User not authenticated');

    let avatarPath = profile.avatar;

    if (avatarInputRef.current?.files[0]) {
      const file = avatarInputRef.current.files[0];
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}/${file.name}`, file, { upsert: true });

      if (uploadError) return alert('Upload failed: ' + uploadError.message);

      avatarPath = supabase
        .storage
        .from('avatars')
        .getPublicUrl(`${user.id}/${file.name}`).data.publicUrl;
    }

    const { error: upsertError } = await supabase.from('profiles').upsert({
      user_id: user.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      avatar: avatarPath,
    }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return alert('Failed to save profile: ' + upsertError.message);
    }

    alert('Profile updated!');
  };

  if (loading || !profile) return <p>Loading profile...</p>;

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar" id="sidebar">
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li><a href="/dashboard"><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile" className="active"><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/services"><i className="fas fa-briefcase"></i> My Services</a></li>
            <li><a href="/dashboard/messages"><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools"><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks"><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/tutorials"><i className="fas fa-video"></i> Tutorials</a></li>
            <li><a href="/dashboard/offers"><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/settings"><i className="fas fa-cog"></i> Settings</a></li>
            <li>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px' }}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div className="user-info">
            <span>Manage your profile, {profile.name || profile.email}</span>
            <img src={avatarUrl} alt="User Avatar" />
            <button id="toggleModeBtn" title="Toggle Light/Dark Mode"><i className="fas fa-adjust"></i></button>
            <button id="toggleMenuBtn" title="Toggle Menu"><i className="fas fa-bars"></i></button>
          </div>
        </header>

        <section className="profile-section">
          <h2><i className="fas fa-user-circle"></i> My Profile</h2>
          <form className="profile-container" onSubmit={handleSave}>
            <div className="profile-avatar">
              <img id="avatarPreview" src={avatarUrl} alt="Avatar" />
              <input type="file" id="avatarUpload" name="avatar" ref={avatarInputRef} onChange={handleAvatarChange} />
            </div>

            <div className="profile-details">
              <label>Name: <input type="text" name="name" value={profile.name || ''} onChange={handleInputChange} /></label>
              <label>Email: <input type="email" name="email" value={profile.email || ''} onChange={handleInputChange} /></label>
              <label>Phone: <input type="tel" name="phone" value={profile.phone || ''} onChange={handleInputChange} /></label>
              <label>Address: <input type="text" name="address" value={profile.address || ''} onChange={handleInputChange} /></label>
              <button type="submit" className="save-btn">Save Changes</button>
            </div>
          </form>
        </section>

        <section className="tools">
          <h2><i className="fas fa-clock"></i> Recent Activity</h2>
          <ul className="activity-feed">
            <li><i className="fas fa-briefcase"></i> Added a new service: Web Design</li>
            <li><i className="fas fa-envelope"></i> Replied to a client message</li>
            <li><i className="fas fa-cogs"></i> Updated profile information</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
