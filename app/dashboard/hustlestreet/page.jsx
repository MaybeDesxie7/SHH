'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function HustleStreetPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', type: '', stars_used: 0 });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [topUsers, setTopUsers] = useState([]);

  // Check screen size for sidebar behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const isWide = window.innerWidth >= 768;
      setIsDesktop(isWide);
      setSidebarOpen(isWide);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push('/login');
        return;
      }
      setUser(data.user);
      setLoading(false);
    }
    getUser();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchOffers();
      fetchTopUsers();
    }
  }, [user]);

  async function fetchOffers() {
    const { data, error } = await supabase
      .from('hustle_offers')
      .select('*')
      .order('stars_used', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load offers');
      console.error(error);
    } else {
      setOffers(data);
    }
  }

  async function fetchTopUsers() {
    const { data, error } = await supabase.rpc('get_top_users');
    if (error) {
      console.error('Failed to fetch top users', error);
      toast.error('Error loading top users');
    } else {
      setTopUsers(data);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'stars_used') {
      const val = parseInt(value, 10);
      if (isNaN(val) || val < 0) return;
      setForm(f => ({ ...f, [name]: val }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.description || !form.type) {
      return toast.error('Please fill all fields');
    }
    if (typeof form.stars_used !== 'number' || form.stars_used < 0) {
      return toast.error('Stars used must be ≥ 0');
    }

    const { error } = await supabase.from('hustle_offers').insert({
      ...form,
      user_id: user.id
    });

    if (error) {
      toast.error('Error posting offer');
      console.error(error);
    } else {
      toast.success('Offer posted!');
      setForm({ title: '', description: '', type: '', stars_used: 0 });
      fetchOffers();
      setExpandedCard(null);
    }
  }

  const filteredOffers = offers.filter(o => {
    const matchesFilter = filter === 'all' || o.type === filter;
    const searchText = search.toLowerCase();
    return matchesFilter &&
      (o.title.toLowerCase().includes(searchText) ||
      o.description.toLowerCase().includes(searchText));
  });

  const myOffers = filteredOffers.filter(o => o.user_id === user.id);
  const streetOffers = filteredOffers.filter(o => o.user_id !== user.id);

  function openJoinModal(offer) {
    setSelectedOffer(offer);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedOffer(null);
  }

  function toggleCard(key) {
    setExpandedCard(prev => prev === key ? null : key);
  }

  if (loading) return <p>Loading...</p>;

  // Sidebar toggle and nav close on mobile
  function toggleSidebar() {
    setSidebarOpen(prev => !prev);
  }

  function handleNavClick() {
    if (!isDesktop) setSidebarOpen(false);
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li><a href="/dashboard" onClick={handleNavClick}><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile" onClick={handleNavClick}><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/hustlestreet" className="active" onClick={handleNavClick}><i className="fas fa-briefcase"></i> Hustle Street</a></li>
            <li><a href="/dashboard/messages" onClick={handleNavClick}><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools" onClick={handleNavClick}><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks" onClick={handleNavClick}><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/HustleChallenges" onClick={handleNavClick}><i className="fas fa-trophy"></i> Challenges</a></li>
            <li><a href="/dashboard/offers" onClick={handleNavClick}><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/help_center" onClick={handleNavClick}><i className="fas fa-question-circle"></i> Help Center</a></li>

            {/* ✅ Premium link with Framer Motion pulse */}
            <motion.li
              style={{
                background: "linear-gradient(90deg, #FFD700, #FFA500)",
                borderRadius: "8px",
                margin: "10px 0"
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [1, 0.9, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
            >
              <a href="/dashboard/Premium" onClick={handleNavClick} style={{ color: "#fff", fontWeight: "bold" }}>
                <i className="fas fa-crown"></i> Go Premium
              </a>
            </motion.li>

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
                  padding: '8px 16px'
                }}
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
            <span>Hustle Street</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button id="toggleModeBtn"><i className="fas fa-adjust" /></button>
            <button id="toggleMenuBtn" onClick={toggleSidebar}>
              <i className="fas fa-bars" />
            </button>
          </div>
        </header>

        {/* Collapsible Cards */}
        <section className="shh-feature-cards">
          {[
            { name: 'My Offers', key: 'my' },
            { name: 'Trending Offers', key: 'trending' },
            { name: 'Top Users', key: 'top' },
            { name: 'Post New Offer', key: 'form' },
            { name: 'Street Offers', key: 'street' },
          ].map(card => (
            <motion.div key={card.key} className="shh-collapsible-card">
              <div
                className="shh-card-header"
                onClick={() => toggleCard(card.key)}
                role="button"
                tabIndex={0}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleCard(card.key)}
              >
                <h3>{card.name}</h3>
                <i className={`fas fa-chevron-${expandedCard === card.key ? 'up' : 'down'}`} />
              </div>

              <AnimatePresence>
                {expandedCard === card.key && (
                  <motion.div
                    className="shh-card-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* === Content for each card === */}
                    {card.key === 'top' && (
                      topUsers.length === 0
                        ? <p>No top users yet.</p>
                        : (
                          <ul className="top-users-list">
                            {topUsers.map((u) => (
                              <li key={u.user_id} className="user-card">
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.name} className="user-avatar" />
                                ) : (
                                  <div className="shh-avatar-fallback">{u.name?.[0]?.toUpperCase()}</div>
                                )}
                                <div className="user-details">
                                  <p className="user-name">{u.name}</p>
                                  <p><strong>⭐ Stars:</strong> {u.total_stars}</p>
                                  <p><strong>🎯 Offers:</strong> {u.total_offers}</p>
                                  <a href="/dashboard/messages" className="message-btn">Message</a>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )
                    )}

                    {card.key === 'form' && (
                      <form onSubmit={handleSubmit} className="shh-offer-form">
                        <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} />
                        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
                        <input type="text" name="type" placeholder="Type" value={form.type} onChange={handleChange} />
                        <input type="number" name="stars_used" placeholder="Stars used" value={form.stars_used} onChange={handleChange} />
                        <button type="submit">Post Offer</button>
                      </form>
                    )}

                    {card.key === 'my' && (
                      myOffers.length === 0
                        ? <p>No offers yet.</p>
                        : <ul className="shh-offer-list">
                            {myOffers.map(o => (
                              <li key={o.id} className="shh-offer-card">
                                <h4>{o.title}</h4>
                                <p>{o.description}</p>
                                <span>⭐ {o.stars_used}</span>
                              </li>
                            ))}
                          </ul>
                    )}

                    {card.key === 'street' && (
                      streetOffers.length === 0
                        ? <p>No community offers yet.</p>
                        : <ul className="shh-offer-list">
                            {streetOffers.map(o => (
                              <li key={o.id} className="shh-offer-card">
                                <h4>{o.title}</h4>
                                <p>{o.description}</p>
                                <button onClick={() => openJoinModal(o)}>Join</button>
                              </li>
                            ))}
                          </ul>
                    )}

                    {card.key === 'trending' && (
                      <ul className="shh-offer-list">
                        {filteredOffers
                          .filter(o => o.stars_used > 0)
                          .slice(0, 5)
                          .map(o => (
                            <li key={o.id} className="shh-offer-card">
                              <h4>{o.title}</h4>
                              <p>{o.description}</p>
                              <span>🔥 {o.stars_used} Stars</span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </section>

        {showModal && selectedOffer && (
          <div className="shh-modal">
            <div className="shh-modal-content">
              <h3>Join Offer: {selectedOffer.title}</h3>
              <p>{selectedOffer.description}</p>
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
