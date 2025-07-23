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
  const [form, setForm] = useState({ title: '', description: '', type: '' });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // New state for sidebar open/close
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
    if (user) fetchOffers();
  }, [user]);

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from('hustle_offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load offers');
      console.error(error);
    } else {
      setOffers(data);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.type) return toast.error('Please fill all fields');

    const { error } = await supabase.from('hustle_offers').insert({ ...form, user_id: user.id });
    if (error) {
      toast.error('Error posting offer');
      console.error(error);
    } else {
      toast.success('Offer posted!');
      setForm({ title: '', description: '', type: '' });
      fetchOffers();
    }
  };

  const filteredOffers = offers.filter((o) => {
    const matchesFilter = filter === 'all' || o.type === filter;
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const myOffers = filteredOffers.filter((o) => o.user_id === user?.id);
  const streetOffers = filteredOffers.filter((o) => o.user_id !== user?.id);

  const openJoinModal = (offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOffer(null);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      {/* Sidebar with toggle classes */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`} id="sidebar">
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li>
              <a href="/dashboard"><i className="fas fa-home"></i> Dashboard</a>
            </li>
            <li>
              <a href="/dashboard/profile"><i className="fas fa-user"></i> Profile</a>
            </li>
            <li>
              <a href="/dashboard/hustlestreet" className="active"><i className="fas fa-briefcase"></i> Hustle Street</a>
            </li>
            <li>
              <a href="/dashboard/messages"><i className="fas fa-envelope"></i> Messages</a>
            </li>
            <li>
              <a href="/dashboard/tools"><i className="fas fa-toolbox"></i> Tools</a>
            </li>
            <li>
              <a href="/dashboard/ebooks"><i className="fas fa-book"></i> Ebooks</a>
            </li>
            <li>
              <a href="/dashboard/tutorials"><i className="fas fa-video"></i> Tutorials</a>
            </li>
            <li>
              <a href="/dashboard/offers"><i className="fas fa-tags"></i> Offers</a>
            </li>
            <li>
              <a href="/dashboard/help_center"><i className="fas fa-question-circle"></i> Help Center</a>
            </li>
            <li>
              <a href="/dashboard/settings"><i className="fas fa-cog"></i> Settings</a>
            </li>
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
            <span>Hustle Street</span>
            <img src="https://i.pravatar.cc/100" alt="User" />
            {/* Sidebar toggle buttons */}
            <button
              id="toggleModeBtn"
              title="Toggle Light/Dark Mode"
              style={{ marginLeft: 'auto', marginRight: '10px' }}
            >
              <i className="fas fa-adjust"></i>
            </button>
            <button
              id="toggleMenuBtn"
              title="Toggle Menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>

        <section className="hustle-form">
          <h2>Post a Hustle Offer</h2>
          <form onSubmit={handleSubmit}>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Offer title" required />
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
            <select name="type" value={form.type} onChange={handleChange} required>
              <option value="">Select Type</option>
              <option value="cross-promotion">Cross-Promotion</option>
              <option value="partnership">Partnership</option>
              <option value="collab">Collaboration</option>
            </select>
            <button type="submit">Post Offer</button>
          </form>
        </section>

        <section className="filter-bar">
          <input type="text" placeholder="Search offers..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="cross-promotion">Cross-Promotion</option>
            <option value="partnership">Partnership</option>
            <option value="collab">Collab</option>
          </select>
        </section>

        <section className="my-offers">
          <h3>My Offers</h3>
          <div className="card-grid">
            {myOffers.map((offer) => (
              <motion.div key={offer.id} className="offer-card" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h4>{offer.title}</h4>
                <p><strong>Type:</strong> {offer.type}</p>
                <p>{offer.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="street-offers">
          <h3>Street Offers</h3>
          <div className="card-grid">
            {streetOffers.map((offer) => (
              <motion.div key={offer.id} className="offer-card" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h4>{offer.title}</h4>
                <p><strong>Type:</strong> {offer.type}</p>
                <p>{offer.description}</p>
                <div className="offer-actions">
                  <button onClick={() => openJoinModal(offer)}>Join Offer</button>
                  <a href="/dashboard/messages" className="message-btn">Message</a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <AnimatePresence>
          {showModal && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <h3>Join Offer: {selectedOffer?.title}</h3>
                <p>{selectedOffer?.description}</p>
                <button onClick={() => { toast.success('Request sent!'); closeModal(); }}>Send Join Request</button>
                <button onClick={closeModal} className="cancel">Cancel</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
