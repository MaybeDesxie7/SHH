'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FaCrown, FaStar, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import '@/styles/hustlestreet.css';

/**
 * HustleStreet Page (refactored)
 * - Tabs: Offers Feed | Top Creators | Hustle Requests | Post Offer | My Offers
 * - My Offers supports edit & delete
 * - Posting costs 15 stars (checked + deducted on submit)
 * - Modal shows remaining stars for clarity
 */

/* -------------------------
   Small presentational components
   (kept inside file so you don't need extra files)
   ------------------------- */

function OfferCard({ offer }) {
  return (
    <div className="offer-card">
      <div className="offer-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            className="offer-avatar"
            src={offer.public_profiles?.avatar || '/default-avatar.png'}
            alt={offer.public_profiles?.name || 'avatar'}
          />
          <div className="offer-meta">
            <p className="offer-name">{offer.public_profiles?.name || 'Unknown'}</p>
            <p className="offer-time">{new Date(offer.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {offer.tag && <span className="offer-tag">{offer.tag}</span>}
          <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
            <FaStar style={{ marginRight: 6, color: '#FFD700' }} />
            {offer.stars_used || 0}
          </div>
        </div>
      </div>

      <div className="offer-body">
        <h4 className="offer-title">{offer.title}</h4>
        <p className="offer-description">{offer.description}</p>
      </div>

      <div className="offer-footer">
        <button className="reach-out-button">Reach Out</button>
      </div>
    </div>
  );
}

function MyOfferCard({ offer, onEdit, onDelete }) {
  return (
    <div className="offer-card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h4 style={{ margin: 0 }}>{offer.title}</h4>
          <p style={{ margin: '6px 0', color: '#ddd' }}>{offer.description}</p>
          {offer.tag && <span className="offer-tag">{offer.tag}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onEdit(offer)}
            title="Edit"
            style={{
              background: 'transparent',
              border: '1px solid #333',
              padding: '8px',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(offer.id)}
            title="Delete"
            style={{
              background: '#f44336',
              border: 'none',
              padding: '8px',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   PostOfferModal (used for create & edit)
   ------------------------- */
function PostOfferModal({
  open,
  onClose,
  onSubmit,
  initial = null,
  starsRemaining,
  isPosting,
  showStarsRemaining = true,
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [tag, setTag] = useState(initial?.tag || '');

  useEffect(() => {
    setTitle(initial?.title || '');
    setDescription(initial?.description || '');
    setTag(initial?.tag || '');
  }, [initial]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{initial ? 'Edit Offer' : 'Post New Offer'}</h3>

        {showStarsRemaining && (
          <p className="stars-info" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaStar style={{ color: '#FFD700' }} />
            Stars remaining: {starsRemaining ?? '—'}
            <span style={{ marginLeft: 8, color: '#aaa', fontSize: 12 }}>
              (Posting costs 15 ⭐)
            </span>
          </p>
        )}

        <form
          className="post-offer-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!title.trim() || !description.trim()) {
              alert('Title and description are required.');
              return;
            }
            await onSubmit({ title: title.trim(), description: description.trim(), tag: tag?.trim() || null });
          }}
        >
          <input
            type="text"
            name="title"
            placeholder="Offer title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            name="description"
            placeholder="Describe your offer"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
          />
          <input
            type="text"
            name="tag"
            placeholder="Tag (e.g. design, promo, collab)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />

          <button type="submit" disabled={isPosting}>
            {isPosting ? (
              <>
                <FaSave style={{ marginRight: 8 }} /> Saving...
              </>
            ) : (
              <>
                {initial ? 'Save Changes' : 'Post Offer (15 '}<FaStar style={{ color: '#FFD700', marginLeft: 6 }} />)
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* -------------------------
   HustleStreetPage
   ------------------------- */
export default function HustleStreetPage() {
  const [activeTab, setActiveTab] = useState('offers'); // offers | top | requests | form | my
  const [offersFeed, setOffersFeed] = useState([]);
  const [topUsersFeed, setTopUsersFeed] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [myOffers, setMyOffers] = useState([]);
  const [editingOffer, setEditingOffer] = useState(null);

  const [starsRemaining, setStarsRemaining] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  const router = useRouter();
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;

  // Set sidebar initial
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // Get current user id on mount
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setCurrentUserId(data.user.id);
      if (error) console.error('Error fetching user:', error);
    };
    getUser();
  }, []);

  /* -------------------------
     Fetchers
     ------------------------- */

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
        public_profiles ( name, avatar )
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
      .select(`id, sender_id, receiver_id, status`)
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

  const fetchMyOffers = async () => {
    const userResp = await supabase.auth.getUser();
    const user = userResp?.data?.user;
    if (!user) {
      setMyOffers([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('hustle_offers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my offers:', error);
      setMyOffers([]);
    } else {
      setMyOffers(data || []);
    }
    setLoading(false);
  };

  const fetchStarsRemaining = async () => {
    const userResp = await supabase.auth.getUser();
    const user = userResp?.data?.user;
    if (!user) {
      setStarsRemaining(null);
      return;
    }

    const { data, error } = await supabase
      .from('stars')
      .select('stars_remaining')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Unable to fetch stars:', error);
      setStarsRemaining(null);
      return;
    }
    setStarsRemaining(data?.stars_remaining ?? 0);
  };

  // Load the correct feed on tab change
  useEffect(() => {
    if (activeTab === 'offers') fetchOffers();
    else if (activeTab === 'top') fetchTopUsers();
    else if (activeTab === 'requests') fetchRequests();
    else if (activeTab === 'my') fetchMyOffers();
  }, [activeTab, currentUserId]);

  // real-time subscription to offers table
  useEffect(() => {
    const channel = supabase
      .channel('offers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hustle_offers' },
        () => {
          if (activeTab === 'offers') fetchOffers();
          if (activeTab === 'my') fetchMyOffers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  /* -------------------------
     Actions: Post, Edit, Delete
     ------------------------- */

  // Create new offer (deduct 15 stars)
  const handlePostOffer = async (newOffer) => {
    setIsPosting(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    if (userError || !user) {
      alert('You must be logged in to post offers.');
      setIsPosting(false);
      return;
    }

    // Check stars
    const { data: starData, error: starError } = await supabase
      .from('stars')
      .select('stars_remaining')
      .eq('user_id', user.id)
      .single();

    if (starError || !starData) {
      alert('Unable to check your star balance.');
      setIsPosting(false);
      return;
    }

    if (starData.stars_remaining < 15) {
      alert('You need at least 15 stars to post an offer.');
      setIsPosting(false);
      return;
    }

    // Deduct 15 stars (we do this client-side via update to stars table)
    const { error: updateError } = await supabase
      .from('stars')
      .update({ stars_remaining: starData.stars_remaining - 15 })
      .eq('user_id', user.id);

    if (updateError) {
      alert('Failed to deduct stars.');
      setIsPosting(false);
      return;
    }

    // Insert the offer with stars_used = 15
    const { error } = await supabase.from('hustle_offers').insert([
      { ...newOffer, user_id: user.id, stars_used: 15 },
    ]);

    if (error) {
      console.error('Failed to post offer:', error);
      alert(`Error posting offer: ${error.message}`);
      // revert stars deduction (best-effort)
      await supabase.rpc('update_star_balance', { p_user_id: user.id, p_stars: 15 }).catch(() => {});
      setIsPosting(false);
      return;
    }

    // refresh relevant feeds & star balance
    if (activeTab === 'offers') fetchOffers();
    if (activeTab === 'my') fetchMyOffers();
    await fetchStarsRemaining();

    setShowModal(false);
    setIsPosting(false);
  };

  // Edit an existing offer (only owner should be allowed by RLS)
  const handleSaveEdit = async (payload) => {
    if (!editingOffer) return;
    setIsPosting(true);
    const { error } = await supabase
      .from('hustle_offers')
      .update({ title: payload.title, description: payload.description, tag: payload.tag })
      .eq('id', editingOffer.id);

    if (error) {
      console.error('Edit failed', error);
      alert('Failed to save changes.');
      setIsPosting(false);
      return;
    }

    // refresh
    await fetchMyOffers();
    await fetchOffers();
    setEditingOffer(null);
    setShowModal(false);
    setIsPosting(false);
  };

  // Delete an offer
  const handleDeleteOffer = async (id) => {
    const confirmDelete = confirm('Delete this offer? This action cannot be undone.');
    if (!confirmDelete) return;

    const { error } = await supabase.from('hustle_offers').delete().eq('id', id);
    if (error) {
      console.error('Delete failed', error);
      alert('Failed to delete offer.');
      return;
    }

    // refresh
    setMyOffers((prev) => prev.filter((o) => o.id !== id));
    setOffersFeed((prev) => prev.filter((o) => o.id !== id));
  };

  /* -------------------------
     Modal openers / helpers
     ------------------------- */

  const openPostModal = async () => {
    await fetchStarsRemaining();
    setEditingOffer(null);
    setShowModal(true);
  };

  const openEditModal = async (offer) => {
    // load star balance as well just for visibility (not needed to edit)
    await fetchStarsRemaining();
    setEditingOffer(offer);
    setShowModal(true);
  };

  function handleNavClick() {
    if (!isDesktop) setSidebarOpen(false);
  }

  /* -------------------------
     Simple accept/reject for partnership_requests
     ------------------------- */
  const handleAccept = async (id) => {
    const { error } = await supabase.from('partnership_requests').update({ status: 'accepted' }).eq('id', id);
    if (!error) fetchRequests();
  };

  const handleReject = async (id) => {
    const { error } = await supabase.from('partnership_requests').delete().eq('id', id);
    if (!error) fetchRequests();
  };

  /* -------------------------
     JSX render
     ------------------------- */

  return (
    <div className="dashboard hustle-street-page">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo">Glimo</div>
        <nav>
          <ul>
            <li>
              <a href="/dashboard" onClick={handleNavClick}>
                <i className="fas fa-home" /> Dashboard
              </a>
            </li>
            <li>
              <a href="/dashboard/profile" onClick={handleNavClick}>
                <i className="fas fa-user" /> Profile
              </a>
            </li>
            <li>
              <a href="/dashboard/hustlestreet" className="active" onClick={handleNavClick}>
                <i className="fas fa-briefcase" /> Hustle Street
              </a>
            </li>
            <li>
              <a href="/dashboard/messages" onClick={handleNavClick}>
                <i className="fas fa-envelope" /> Messages
              </a>
            </li>
            <li>
              <a href="/dashboard/tools" onClick={handleNavClick}>
                <i className="fas fa-toolbox" /> Tools
              </a>
            </li>
            <li>
              <a href="/dashboard/ebooks" onClick={handleNavClick}>
                <i className="fas fa-book" /> Ebooks
              </a>
            </li>
            <li>
              <a href="/dashboard/HustleChallenges" onClick={handleNavClick}>
                <i className="fas fa-trophy" /> Challenges
              </a>
            </li>
            <li>
              <a href="/dashboard/offers" onClick={handleNavClick}>
                <i className="fas fa-tags" /> Offers
              </a>
            </li>
            <li>
              <a href="/dashboard/help_center" onClick={handleNavClick}>
                <i className="fas fa-question-circle" /> Help Center
              </a>
            </li>
            <li style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', borderRadius: '8px', margin: '10px 0' }}>
              <a href="/dashboard/premium" onClick={handleNavClick} style={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaCrown /> Go Premium
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
                <i className="fas fa-sign-out-alt" /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header>
          <div className="user-info">
            <span>Hustle Street</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button id="toggleModeBtn">
              <i className="fas fa-adjust" />
            </button>
            <button id="toggleMenuBtn" onClick={() => setSidebarOpen((prev) => !prev)}>
              <i className="fas fa-bars" />
            </button>
          </div>
        </header>

        <div className="tabs-navigator" role="tablist" aria-label="Hustle Street Tabs">
          <button className={`tab-button ${activeTab === 'offers' ? 'active' : ''}`} onClick={() => setActiveTab('offers')}>
            Offers Feed
          </button>
          <button className={`tab-button ${activeTab === 'top' ? 'active' : ''}`} onClick={() => setActiveTab('top')}>
            Top Creators
          </button>
          <button className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            Hustle Requests
          </button>
          <button className={`tab-button ${activeTab === 'form' ? 'active' : ''}`} onClick={() => { setActiveTab('form'); openPostModal(); }}>
            Post Offer
          </button>
          <button className={`tab-button ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>
            My Offers
          </button>
        </div>

        <div className="feed-content">
          {loading ? (
            <p className="loading">Loading...</p>

          ) : activeTab === 'offers' ? (
            offersFeed.length > 0 ? (
              offersFeed.map((offer) => <OfferCard key={offer.id} offer={offer} />)
            ) : (
              <p>No offers found.</p>
            )

          ) : activeTab === 'top' ? (
            topUsersFeed.length > 0 ? (
              topUsersFeed.map((user) => (
                <div className="top-user-card" key={user.user_id}>
                  <img className="top-user-avatar" src={user.avatar || '/default-avatar.png'} alt={user.name || 'avatar'} />
                  <div className="top-user-info">
                    <h4>{user.name}</h4>
                    <p>{user.votes ? `${user.votes} votes` : 'Top creator'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No top users found.</p>
            )

          ) : activeTab === 'requests' ? (
            requests.length > 0 ? (
              requests.map((req) => (
                <div key={req.id} className="hustle-request-card">
                  <img src={req.sender?.avatar || '/default-avatar.png'} alt="avatar" className="hustle-request-avatar" />
                  <div className="hustle-request-info">
                    <h4>{req.sender?.name || 'Anonymous'}</h4>
                    <p>Wants to collaborate with you.</p>
                  </div>
                  <div className="hustle-request-actions">
                    <button className="accept-btn" onClick={() => handleAccept(req.id)}>Accept</button>
                    <button className="reject-btn" onClick={() => handleReject(req.id)}>Reject</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending requests.</p>
            )

          ) : activeTab === 'form' ? (
            <div className="form-placeholder">
              <p>Click the + button (bottom-right) to post a new offer.</p>
            </div>

          ) : activeTab === 'my' ? (
            myOffers.length > 0 ? (
              myOffers.map((o) => <MyOfferCard key={o.id} offer={o} onEdit={(offer) => openEditModal(offer)} onDelete={handleDeleteOffer} />)
            ) : (
              <p>No offers yet. Click Post Offer to create one.</p>
            )
          ) : null}
        </div>

        {/* Floating Action Button */}
        <button className="fab" title="Post Offer" onClick={openPostModal}>
          <FaStar />
        </button>

        {/* Post/Edit Modal */}
        <PostOfferModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingOffer(null);
          }}
          onSubmit={editingOffer ? handleSaveEdit : handlePostOffer}
          initial={editingOffer}
          starsRemaining={starsRemaining}
          isPosting={isPosting}
          showStarsRemaining={true}
        />
      </main>
    </div>
  );
}
