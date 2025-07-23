'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function TutorialsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tutorials, setTutorials] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return router.push('/login');
      setUser(data.user);
    };
    getUser();
  }, [router]);

  useEffect(() => {
    if (user) fetchTutorials();
  }, [user]);

  const fetchTutorials = async () => {
    const { data, error } = await supabase
      .from('tutorials')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setTutorials(data);
  };

  const filteredTutorials =
    filter === 'all'
      ? tutorials
      : tutorials.filter((t) => t.tags.includes(filter));

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`} id="sidebar">
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li><a href="/dashboard"><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile"><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/hustlestreet"><i className="fas fa-briefcase"></i> Hustle Street</a></li>
            <li><a href="/dashboard/messages"><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools"><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks"><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/tutorials" className="active"><i className="fas fa-video"></i> Tutorials</a></li>
            <li><a href="/dashboard/offers"><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/help_center"><i className="fas fa-question-circle"></i> Help Center</a></li>
            <li><a href="/dashboard/settings"><i className="fas fa-cog"></i> Settings</a></li>
            <li>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff4d4d',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 16px',
                }}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header>
          <div className="user-info">
            <span>Tutorials</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button id="toggleModeBtn" title="Toggle Light/Dark Mode">
              <i className="fas fa-adjust"></i>
            </button>
            <button id="toggleMenuBtn" title="Toggle Menu" onClick={() => setSidebarOpen(prev => !prev)}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>

        <div className="tutorial-filter">
          <label htmlFor="tutorialFilter">Filter by topic:</label>
          <select id="tutorialFilter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="ai">AI</option>
            <option value="freelancing">Freelancing</option>
            <option value="affiliate">Affiliate Marketing</option>
            <option value="tools">Tools</option>
            <option value="apps">App Usage</option>
          </select>
        </div>

        <div className="tutorials-grid">
          {filteredTutorials.map((tutorial, i) => (
            <div key={i} className="tutorial-card">
              <iframe src={tutorial.video_url} allowFullScreen title={tutorial.title}></iframe>
              <h3>{tutorial.title}</h3>
              <p>{tutorial.summary}</p>
              <div className="tutorial-tags">
                {tutorial.tags.map((tag, index) => (
                  <span key={index} className="tutorial-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
