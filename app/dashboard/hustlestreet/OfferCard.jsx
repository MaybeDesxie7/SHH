'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function OfferCard({
  id,
  title,
  description,
  tag,
  created_at,
  public_profiles,
  user_id,
}) {
  const { name, avatar } = public_profiles || {};
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);

  const handleReachOut = () => {
    if (!user_id) return alert('User not available');
    router.push(`/dashboard/messages?user=${user_id}`);
  };

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

    // Check if a request already exists
    const { data: existingRequest, error: fetchError } = await supabase
      .from('partnership_requests')
      .select('*')
      .eq('sender_id', sender_id)
      .eq('receiver_id', receiver_id)
      .maybeSingle();

    if (fetchError) {
      setRequesting(false);
      return alert('Error checking existing request: ' + fetchError.message);
    }

    if (existingRequest) {
      // Update status if exists
      const { error: updateError } = await supabase
        .from('partnership_requests')
        .update({ status: 'pending' })
        .eq('id', existingRequest.id);

      setRequesting(false);
      if (updateError) {
        alert('Failed to update request: ' + updateError.message);
      } else {
        alert('Partnership request updated to pending!');
      }
    } else {
      // Insert new request
      const { error: insertError } = await supabase
        .from('partnership_requests')
        .insert([
          {
            sender_id,
            receiver_id,
            status: 'pending',
          },
        ]);

      setRequesting(false);
      if (insertError) {
        alert('Failed to send request: ' + insertError.message);
      } else {
        alert('Partnership request sent!');
      }
    }
  };

  return (
    <div className="offer-card" key={id}>
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
        <button className="reach-out-button" onClick={handleReachOut}>
          💬 Reach Out
        </button>
        <button
          className="reach-out-button"
          onClick={handleRequestPartnership}
          disabled={requesting}
        >
          {requesting ? '⏳ Sending...' : '🤝 Request Partnership'}
        </button>
      </div>
    </div>
  );
}
