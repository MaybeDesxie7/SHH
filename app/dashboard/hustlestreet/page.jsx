'use client';

import React, { useEffect, useState } from 'react';
import OfferCard from './OfferCard';
import TopUserCard from './TopUserCard';
import FloatingActionButton from './FloatingActionButton';
import TabsNavigator from './TabsNavigator';
import { supabase } from '@/lib/supabase';
import '@/styles/hustlestreet.css';

export default function HustleStreetPage() {
  const [activeTab, setActiveTab] = useState('offers');
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Fetch offers with join on profiles table (not public_profiles view)
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
        profiles (
          name,
          avatar
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers:', error);
      alert('Failed to load offers: ' + (error.message || JSON.stringify(error)));
      setFeed([]);
    } else {
      setFeed(data || []);
    }
    setLoading(false);
  };

  // Fetch top users via RPC
  const fetchTopUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_top_users');
    if (error) {
      console.error('Error fetching top users:', error);
      alert('Failed to load top users: ' + (error.message || JSON.stringify(error)));
      setFeed([]);
    } else {
      setFeed(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'offers') fetchOffers();
    else if (activeTab === 'top') fetchTopUsers();
  }, [activeTab]);

  // Real-time updates
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
      alert(`Error posting offer: ${error.message || JSON.stringify(error)}`);
      return;
    }

    if (activeTab === 'offers') fetchOffers();
    setShowModal(false);
  };

  return (
    <div className="hustle-street-page">
      <TabsNavigator
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { key: 'offers', label: 'Offers Feed' },
          { key: 'top', label: 'Top Creators' },
          { key: 'form', label: 'Post Offer' },
        ]}
      />

      <div className="feed-content">
        {loading ? (
          <p className="loading">Loading...</p>
        ) : activeTab === 'offers' ? (
          feed.length > 0 ? (
            feed.map((offer, index) => (
              <OfferCard
                key={offer.id ?? `offer-${index}`}
                id={offer.id}
                title={offer.title}
                description={offer.description}
                tag={offer.tag}
                created_at={offer.created_at}
                public_profiles={offer.profiles}
                user_id={offer.user_id} // ✅ This was missing
              />
            ))
          ) : (
            <p>No offers found.</p>
          )
        ) : activeTab === 'top' ? (
          feed.length > 0 ? (
            feed.map((user, index) => (
              <TopUserCard
                key={user.user_id ?? `user-${index}`}
                name={user.name}
                avatar={user.avatar}
                total_stars={user.total_stars}
                total_votes={user.total_votes}
                total_offers={user.total_offers}
              />
            ))
          ) : (
            <p>No top users found.</p>
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
              <input
                type="number"
                name="stars_used"
                placeholder="Stars used"
                min="0"
                defaultValue="0"
              />
              <button type="submit">Post Offer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
