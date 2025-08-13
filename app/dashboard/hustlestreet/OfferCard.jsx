'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function OfferCard({ offer }) {
  const { id, title, description, tag, created_at, public_profiles, user_id } = offer;
  const { name, avatar } = public_profiles || {};
  const router = useRouter();

  const [requesting, setRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [stars, setStars] = useState(0);

  // Get current user's star balance
  useEffect(() => {
    const fetchStars = async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('stars')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      if (!error && profile) setStars(profile.stars);
    };
    fetchStars();
  }, []);

  // Get request status for this offer's owner
  useEffect(() => {
    const checkRequest = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('partnership_requests')
        .select('status')
        .eq('sender_id', user.id)
        .eq('receiver_id', user_id)
        .maybeSingle();

      if (!error && data) setRequestStatus(data.status);
    };
    if (user_id) checkRequest();
  }, [user_id]);

  // Reach Out button → PrivateChatView
  const handleReachOut = () => {
    if (!user_id) return alert('User not available');
    router.push(`/dashboard/messages?user=${user_id}`);
  };

  // Request Partnership button
  const handleRequestPartnership = async () => {
    if (!user_id) return alert('User not available');
    setRequesting(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setRequesting(false);
      return alert('Failed to get current user');
    }

    const sender_id = user.id;
    const receiver_id = user_id;

    // Upsert partnership request
    const { error: upsertError } = await supabase
      .from('partnership_requests')
      .upsert([{ sender_id, receiver_id, status: 'pending' }], {
        onConflict: 'sender_id,receiver_id',
      });

    setRequesting(false);
    if (upsertError) {
      alert('Failed to send request: ' + upsertError.message);
    } else {
      setRequestStatus('pending');
      alert('Partnership request sent!');
    }
  };

  return (
    <div className="offer-card">
      <div className="offer-header">
        <img
          src={avatar || '/default-avatar.png'}
          alt={name || 'User'}
          className="offer-avatar"
        />
        <div className="offer-meta">
          <h4 className="offer-name">{name || 'Anonymous'}</h4>
          <span className="offer-time">
            {created_at ? new Date(created_at).toLocaleString() : ''}
          </span>
        </div>
        {tag && <span className="offer-tag">#{tag}</span>}
      </div>

      <div className="offer-body">
        <h3 className="offer-title">{title}</h3>
        <p className="offer-description">{description}</p>
      </div>

      <div className="offer-footer">
        <span className="stars-remaining">⭐ {stars} Stars Remaining</span>
        <div className="button-group">
          <button className="reach-out-button" onClick={handleReachOut}>
            💬 Reach Out
          </button>
          <button
            className="partnership-button"
            onClick={handleRequestPartnership}
            disabled={requesting || requestStatus === 'pending'}
          >
            {requestStatus === 'pending'
              ? '⏳ Pending'
              : requesting
              ? 'Sending...'
              : '🤝 Request Partnership'}
          </button>
        </div>
      </div>
    </div>
  );
}
