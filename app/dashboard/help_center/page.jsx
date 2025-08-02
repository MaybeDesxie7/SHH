'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function HelpCenterPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return router.push('/login');
      setUser(data.user);
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user) fetchFAQs();
  }, [user]);

  const fetchFAQs = async () => {
    const { data, error } = await supabase
      .from('help_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setFaqs(data);
  };

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo">Glimo</div>
        <nav>
          <ul>
            <li><a href="/dashboard" onClick={handleNavClick}><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile" onClick={handleNavClick}><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/hustlestreet" onClick={handleNavClick}><i className="fas fa-briefcase"></i> Hustle Street</a></li>
            <li><a href="/dashboard/messages" onClick={handleNavClick}><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools" onClick={handleNavClick}><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks" onClick={handleNavClick}><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/HustleChallenges" onClick={handleNavClick}><i className="fas fa-trophy"></i> Challenges</a></li>
            <li><a href="/dashboard/offers" onClick={handleNavClick}><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/help_center" className="active" onClick={handleNavClick}><i className="fas fa-question-circle"></i> Help Center</a></li>
            <li style={{ background: "linear-gradient(90deg, #FFD700, #FFA500)", borderRadius: "8px", margin: "10px 0" }}>
              <a href="/dashboard/Premium" onClick={handleNavClick} style={{ color: "#fff", fontWeight: "bold" }}>
                <i className="fas fa-crown"></i> Go Premium
              </a>
            </li>
            <li><a href="/dashboard/settings" onClick={handleNavClick}><i className="fas fa-cog"></i> Settings</a></li>
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
            <span>Reading FAQs like a detective... 🕵️‍♂️🔍</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button id="toggleModeBtn"><i className="fas fa-adjust" /></button>
            <button id="toggleMenuBtn" onClick={toggleSidebar}>
              <i className="fas fa-bars" />
            </button>
          </div>
        </header>

        <div className="help-content">
          <h2>Frequently Asked Questions</h2>
          {faqs.length === 0 && <p>No articles found.</p>}
          {faqs.map((faq, index) => (
            <div key={faq.id} className="faq-item">
              <button className="faq-question" onClick={() => toggleFAQ(index)}>
                {faq.title}
              </button>
              {openFAQ === index && (
                <p className="faq-answer">{faq.content}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
