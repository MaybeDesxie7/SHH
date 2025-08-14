'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FaCrown, FaStar, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import OfferCard from '@/app/dashboard/hustlestreet/OfferCard'; // uses the updated OfferCard above
import '@/styles/hustlestreet.css';

/**
 * HustleStreet Page
 * Tabs:
 *  - Offers Feed
 *  - Top Creators
 *  - Hustle Requests (incoming)
 *  - Post Offer (opens modal)
 *  - My Offers
 *
 * Requests:
 *  - Offer feed cards now include "🤝 Request Partnership" and "💬 Reach Out"
 *  - Cards show optional user rating (from public_profiles.rating if present)
 *  - Post Offer modal layout fixed to avoid overlapping and ensure clean mobile UX
 */

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
   PostOfferModal (create & edit)
   - Layout is constrained, scrollable, and non-overlapping on mobile
   ------------------------- */
function PostOfferModal({
  open,
  onClose,
  onSubmit,
  initial = null,
  starsRemaining,
  isPosting,
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
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={initial ? 'Edit Offer' : 'Post New Offer'}
      style={{ zIndex: 1001 }}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          width: 'min(92vw, 520px)',
          overflow: 'hidden',
          padding: '1.25rem',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h3 style={{ margin: 0 }}>{initial ? 'Edit Offer' : 'Post New Offer'}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: '1px solid #333',
              color: '#fff',
              borderRadius: 8,
              padding: '4px 10px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            color: '#cfcfcf',
          }}
        >
          <FaStar style={{ color: '#FFD700' }} />
          Stars remaining: {Number.isFinite(starsRemaining) ? starsRemaining : '—'}
          <span style={{ marginLeft: 8, color: '#aaa' }}>(Posting costs 15 ⭐)</span>
        </div>

        <form
          className="post-offer-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!title.trim() || !description.trim()) {
              alert('Title and description are required.');
              return;
            }
            await onSubmit({
              title: title.trim(),
              description: description.trim(),
              tag: tag?.trim() || null,
            });
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            overflowY: 'auto',
            paddingRight: 2,
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
  const [activeTab, setActiveTab] = useState('offers'); // 'offers' | 'top' | 'requests' | 'form' | 'my'
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

  // Sidebar default state
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

  // ✅ Corrected Fetchers

const fetchOffers = async () => {
  setLoading(true);

  const { data: offers, error: offersError } = await supabase
    .from("hustle_offers")
    .select("id, title, description, tag, stars_used, created_at, user_id")
    .order("created_at", { ascending: false });

  if (offersError) {
    console.error("Error fetching offers:", offersError);
    setOffersFeed([]);
    setLoading(false);
    return;
  }

  if (!offers || offers.length === 0) {
    setOffersFeed([]);
    setLoading(false);
    return;
  }

  const userIds = offers.map((offer) => offer.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from("public_profiles")
    .select("user_id, name, avatar")
    .in("user_id", userIds);

  if (profilesError) {
    console.error("Error fetching offer profiles:", profilesError);
    setOffersFeed(offers);
    setLoading(false);
    return;
  }

  const enrichedOffers = offers.map((offer) => ({
    ...offer,
    public_profiles: profiles.find((p) => p.user_id === offer.user_id) || null,
  }));

  setOffersFeed(enrichedOffers);
  setLoading(false);
};


const fetchTopUsers = async () => {
  setLoading(true);

  const { data, error } = await supabase.rpc("get_top_users");

  if (error) {
    console.error("Error fetching top users. Did you create get_top_users RPC?", error);
    setTopUsersFeed([]);
  } else {
    setTopUsersFeed(data || []);
  }

  setLoading(false);
};

const fetchRequests = async () => {
  if (!currentUserId) return;
  setLoading(true);

  // 1. Fetch pending requests for current user
  const { data: requests, error: requestsError } = await supabase
  .from("partnership_requests")
  .select("id, sender_id, receiver_id, status")
  .eq("receiver_id", currentUserId)
  .in("status", ["pending", "accepted"]); // ✅ fetch both

if (requestsError) {
  console.error("Failed to fetch requests:", requestsError);
  setRequests([]);
  setLoading(false);
  return;
}

if (!requests || requests.length === 0) {
  setRequests([]);
  setLoading(false);
  return;
}

// 2. Fetch sender profiles
const senderIds = requests.map((req) => req.sender_id);
const { data: senderProfiles, error: senderError } = await supabase
  .from("public_profiles")
  .select("user_id, name, avatar")
  .in("user_id", senderIds);

if (senderError) {
  console.error("Error fetching sender profiles:", senderError);
  setRequests(requests);
  setLoading(false);
  return;
}

// 3. Merge requests with sender profile
const enrichedRequests = requests.map((req) => {
  const profile = senderProfiles.find((p) => p.user_id === req.sender_id);
  return {
    ...req,
    sender: profile || null,
    isPartner: req.status === "accepted", // ✅ flag accepted ones
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
    .from("hustle_offers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching my offers:", error);
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
    .from("stars")
    .select("stars_remaining")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Unable to fetch stars:", error);
    setStarsRemaining(null);
    return;
  }

  setStarsRemaining(data?.stars_remaining ?? 0);
};

  // Load on tab change
  useEffect(() => {
    if (activeTab === 'offers') fetchOffers();
    else if (activeTab === 'top') fetchTopUsers();
    else if (activeTab === 'requests') fetchRequests();
    else if (activeTab === 'my') fetchMyOffers();
  }, [activeTab, currentUserId]);

  // realtime subscription to offers (refreshes offers and my offers)
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
     Actions
     ------------------------- */

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

    // Deduct 15 stars
    const { error: updateError } = await supabase
      .from('stars')
      .update({ stars_remaining: starData.stars_remaining - 15 })
      .eq('user_id', user.id);

    if (updateError) {
      alert('Failed to deduct stars.');
      setIsPosting(false);
      return;
    }

    // Insert the offer
    const { error } = await supabase.from('hustle_offers').insert([
      { ...newOffer, user_id: user.id, stars_used: 15 },
    ]);

    if (error) {
      console.error('Failed to post offer:', error);
      alert(`Error posting offer: ${error.message}`);
      // best-effort revert of stars if you have a helper RPC:
      // await supabase.rpc('update_star_balance', { p_user_id: user.id, p_stars: 15 }).catch(() => {});
      setIsPosting(false);
      return;
    }

    if (activeTab === 'offers') fetchOffers();
    if (activeTab === 'my') fetchMyOffers();
    await fetchStarsRemaining();

    setShowModal(false);
    setIsPosting(false);
  };

  const handleSaveEdit = async (payload) => {
    if (!editingOffer) return;
    setIsPosting(true);
    const { error } = await supabase
      .from('hustle_offers')
      .update({
        title: payload.title,
        description: payload.description,
        tag: payload.tag,
      })
      .eq('id', editingOffer.id);

    if (error) {
      console.error('Edit failed', error);
      alert('Failed to save changes.');
      setIsPosting(false);
      return;
    }

    await fetchMyOffers();
    await fetchOffers();
    setEditingOffer(null);
    setShowModal(false);
    setIsPosting(false);
  };

  const handleDeleteOffer = async (id) => {
    const confirmDelete = confirm('Delete this offer? This action cannot be undone.');
    if (!confirmDelete) return;

    const { error } = await supabase.from('hustle_offers').delete().eq('id', id);
    if (error) {
      console.error('Delete failed', error);
      alert('Failed to delete offer.');
      return;
    }

    setMyOffers((prev) => prev.filter((o) => o.id !== id));
    setOffersFeed((prev) => prev.filter((o) => o.id !== id));
  };

  const openPostModal = async () => {
    await fetchStarsRemaining();
    setEditingOffer(null);
    setShowModal(true);
  };

  const openEditModal = async (offer) => {
    await fetchStarsRemaining();
    setEditingOffer(offer);
    setShowModal(true);
  };

  function handleNavClick() {
    if (!isDesktop) setSidebarOpen(false);
  }

  // Accept / Reject partnership requests
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

  /* -------------------------
     Render
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
            <li
              style={{
                background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                borderRadius: '8px',
                margin: '10px 0',
              }}
            >
              <a
                href="/dashboard/Premium"
                onClick={handleNavClick}
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FaCrown /> Go Premium
              </a>
            </li>
            <li>
              <a href="/dashboard/settings" onClick={handleNavClick}>
                <i className="fas fa-cog" /> Settings
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
          <button
            className={`tab-button ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            Offers Feed
          </button>
          <button
            className={`tab-button ${activeTab === 'top' ? 'active' : ''}`}
            onClick={() => setActiveTab('top')}
          >
            Top Creators
          </button>
          <button
            className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Hustle Requests
          </button>
          <button
            className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('form');
              openPostModal();
            }}
          >
            Post Offer
          </button>
          <button
            className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Offers
          </button>
        </div>

        <div className="feed-content" style={{ paddingBottom: '4.5rem' }}>
          {loading ? (
            <p className="loading">Loading...</p>
          ) : activeTab === 'offers' ? (
            offersFeed.length > 0 ? (
              offersFeed.map((offer) => <OfferCard key={offer.id} {...offer} />)
            ) : (
              <p>No offers found.</p>
            )
          ) : activeTab === 'top' ? (
            topUsersFeed.length > 0 ? (
              topUsersFeed.map((user) => (
                <div className="top-user-card" key={user.user_id}>
                  <img
                    className="top-user-avatar"
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.name || 'avatar'}
                  />
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
                  <img
                    src={req.sender?.avatar || '/default-avatar.png'}
                    alt="avatar"
                    className="hustle-request-avatar"
                  />
                  <div className="hustle-request-info">
                    <h4>{req.sender?.name || 'Anonymous'}</h4>
                    <p>Wants to collaborate with you.</p>
                  </div>
                  <div className="hustle-request-actions">
                    <button className="accept-btn" onClick={() => handleAccept(req.id)}>
                      Accept
                    </button>
                    <button className="reject-btn" onClick={() => handleReject(req.id)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending requests.</p>
            )
          ) : activeTab === 'form' ? (
            <div className="form-placeholder">
              <p>Click the ★ button (bottom-right) to post a new offer.</p>
            </div>
          ) : activeTab === 'my' ? (
            myOffers.length > 0 ? (
              myOffers.map((o) => (
                <MyOfferCard
                  key={o.id}
                  offer={o}
                  onEdit={(offer) => openEditModal(offer)}
                  onDelete={handleDeleteOffer}
                />
              ))
            ) : (
              <p>No offers yet. Click Post Offer to create one.</p>
            )
          ) : null}
        </div>

        {/* Floating Action Button */}
        <button className="fab" title="Post Offer" onClick={openPostModal} aria-label="Post Offer">
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
        />
      </main>
    </div>
  );
}
