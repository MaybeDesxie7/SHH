'use client';

import React, { useEffect, useState } from 'react';
import OfferCard from './OfferCard';
import TopUserCard from './TopUserCard';
import FloatingActionButton from './FloatingActionButton';
import TabsNavigator from './TabsNavigator';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FaCrown } from 'react-icons/fa';
import '@/styles/hustlestreet.css';

export default function HustleStreetPage() {
  const [activeTab, setActiveTab] = useState('offers');
  const [offersFeed, setOffersFeed] = useState([]);
  const [topUsersFeed, setTopUsersFeed] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const router = useRouter();

  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setCurrentUserId(data.user.id);
      if (error) console.error('Error fetching user:', error);
    };
    getUser();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hustle_offers')
      .select(`
        id,
        title,
        description,
        tag,
        stars_used,
        created_at,
        user_id,
        public_profiles (
          name,
          avatar
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers:', error);
      setOffersFeed([]);
    } else {
      setOffersFeed(data || []);
    }
    setLoading(false);
  };

  const fetchTopUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_top_users');
    if (error) {
      console.error('Error fetching top users:', error);
      setTopUsersFeed([]);
    } else {
      setTopUsersFeed(data || []);
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    if (!currentUserId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('partnership_requests')
      .select(`
        id,
        sender_id,
        receiver_id,
        status
      `)
      .eq('receiver_id', currentUserId)
      .eq('status', 'pending');

    if (error) {
      console.error('Failed to fetch requests:', error);
      setRequests([]);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const senderIds = data.map((req) => req.sender_id);
    const { data: senderProfiles, error: senderError } = await supabase
      .from('public_profiles')
      .select('user_id, name, avatar')
      .in('user_id', senderIds);

    if (senderError) {
      console.error('Error fetching sender profiles:', senderError);
      setRequests(data);
      setLoading(false);
      return;
    }

    const enrichedRequests = data.map((req) => {
      const profile = senderProfiles.find((p) => p.user_id === req.sender_id);
      return {
        ...req,
        sender: profile || null,
      };
    });

    setRequests(enrichedRequests);
    setLoading(false);
  };

  const handleAccept = async (id) => {
    const { error } = await supabase
      .from('partnership_requests')
      .update({ status: 'accepted' })
      .eq('id', id);
    if (!error) fetchRequests();
  };

  const handleReject = async (id) => {
    const { error } = await supabase
      .from('partnership_requests')
      .delete()
      .eq('id', id);
    if (!error) fetchRequests();
  };

  useEffect(() => {
    if (activeTab === 'offers') fetchOffers();
    else if (activeTab === 'top') fetchTopUsers();
    else if (activeTab === 'requests') fetchRequests();
  }, [activeTab, currentUserId]);

  useEffect(() => {
    const channel = supabase
      .channel('offers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hustle_offers' },
        () => {
          if (activeTab === 'offers') fetchOffers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const handlePostOffer = async (newOffer) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert('You must be logged in to post offers.');
      return;
    }

    const { error } = await supabase
      .from('hustle_offers')
      .insert([{ ...newOffer, user_id: user.id }]);

    if (error) {
      console.error('Failed to post offer:', error);
      alert(`Error posting offer: ${error.message}`);
      return;
    }

    if (activeTab === 'offers') fetchOffers();
    setShowModal(false);
  };

  function handleNavClick() {
    if (!isDesktop) setSidebarOpen(false);
  }

  return (
    <div className="dashboard hustle-street-page">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo">Glimo</div>
        <nav>
          <ul>
            <li><a href="/dashboard"onClick={handleNavClick}><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile" onClick={handleNavClick}><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/hustlestreet" className="active" onClick={handleNavClick}><i className="fas fa-briefcase"></i> Hustle Street</a></li>
            <li><a href="/dashboard/messages" onClick={handleNavClick}><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools" onClick={handleNavClick}><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks" onClick={handleNavClick}><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/hustlechallenges" onClick={handleNavClick}><i className="fas fa-trophy"></i> Challenges</a></li>
            <li><a href="/dashboard/offers" onClick={handleNavClick}><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/help_center" onClick={handleNavClick}><i className="fas fa-question-circle"></i> Help Center</a></li>
            <li style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', borderRadius: '8px', margin: '10px 0' }}>
              <a href="/dashboard/premium" onClick={handleNavClick} style={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaCrown /> Go Premium
              </a>
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
            <span>Deals & Offers</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button id="toggleModeBtn"><i className="fas fa-adjust" /></button>
            <button id="toggleMenuBtn" onClick={() => setSidebarOpen((prev) => !prev)}><i className="fas fa-bars" /></button>
          </div>
        </header>

        <TabsNavigator
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { key: 'offers', label: 'Offers Feed' },
            { key: 'top', label: 'Top Creators' },
            { key: 'requests', label: 'Hustle Requests' },
            { key: 'form', label: 'Post Offer' },
          ]}
        />

        <div className="feed-content">
          {loading ? (
            <p className="loading">Loading...</p>
          ) : activeTab === 'offers' ? (
            offersFeed.length > 0 ? (
              offersFeed.map((offer) => (
                <OfferCard
                  key={offer.id}
                  {...offer}
                  public_profiles={offer.public_profiles || { name: 'Unknown', avatar: null }}
                />
              ))
            ) : (
              <p>No offers found.</p>
            )
          ) : activeTab === 'top' ? (
            topUsersFeed.length > 0 ? (
              topUsersFeed.map((user) => (
                <TopUserCard key={user.user_id} {...user} />
              ))
            ) : (
              <p>No top users found.</p>
            )
          ) : activeTab === 'requests' ? (
            requests.length > 0 ? (
              requests.map((req) => (
                <div key={req.id} className="request-card">
                  <img src={req.sender?.avatar || '/default-avatar.png'} alt="avatar" className="avatar" />
                  <span>{req.sender?.name || 'Anonymous'}</span>
                  <div className="request-actions">
                    <button onClick={() => handleAccept(req.id)}>Accept</button>
                    <button onClick={() => handleReject(req.id)}>Reject</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending requests.</p>
            )
          ) : (
            <div className="form-placeholder">
              <p>Click the + button to post a new offer.</p>
            </div>
          )}
        </div>

        <FloatingActionButton onClick={() => setShowModal(true)} />

        {showModal && (
          <div className="modal-backdrop" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Post New Offer</h3>
              <form
                className="post-offer-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const title = formData.get('title');
                  const description = formData.get('description');
                  const tag = formData.get('tag');
                  const stars_used = parseInt(formData.get('stars_used'), 10) || 0;

                  if (!title || !description) {
                    alert('Title and description are required.');
                    return;
                  }

                  await handlePostOffer({ title, description, tag, stars_used });
                }}
              >
                <input type="text" name="title" placeholder="Offer title" required />
                <textarea name="description" placeholder="Describe your offer" required />
                <input type="text" name="tag" placeholder="Tag (e.g. design, promo, collab)" />
                <input type="number" name="stars_used" placeholder="Stars used" min="0" defaultValue="0" />
                <button type="submit">Post Offer</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
