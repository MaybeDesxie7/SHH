'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';

export default function OfferCard({
  id,
  title,
  description,
  tag,
  created_at,
  public_profiles,
  user_id,
}) {
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // "pending" | "accepted" | "rejected" | null
  const [avatarUrl, setAvatarUrl] = useState(public_profiles?.avatar || '/default-avatar.png');

  // Optional rating (if you later add `rating` to public_profiles view)
  const rating = useMemo(() => {
    // If your view exposes a numeric rating in [0..5], it will show.
    // If not present, nothing will render for rating.
    const r = Number(public_profiles?.rating);
    return Number.isFinite(r) ? Math.max(0, Math.min(5, r)) : null;
  }, [public_profiles?.rating]);

  // Ensure we always use latest avatar from the profile row (linked to updated profile picture)
  useEffect(() => {
    setAvatarUrl(public_profiles?.avatar || '/default-avatar.png');
  }, [public_profiles?.avatar]);

  // Pre-check if a partnership request already exists (to disable button / show state)
  useEffect(() => {
    let mounted = true;

    (async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data, error } = await supabase
        .from('partnership_requests')
        .select('status')
        .eq('sender_id', user.id)
        .eq('receiver_id', user_id)
        .maybeSingle();

      if (!mounted) return;
      if (!error && data) setRequestStatus(data.status || 'pending');
      else setRequestStatus(null);
    })();

    return () => {
      mounted = false;
    };
  }, [user_id]);

  const handleReachOut = () => {
    if (!user_id) return alert('User not available');
    // Navigates to your private chat view for the selected user.
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

    // Upsert to honor unique (sender_id, receiver_id) and keep it simple.
    const { error: upsertError } = await supabase
      .from('partnership_requests')
      .upsert([{ sender_id, receiver_id, status: 'pending' }], {
        onConflict: 'sender_id,receiver_id',
        ignoreDuplicates: false,
      });

    setRequesting(false);
    if (upsertError) {
      alert('Failed to send request: ' + upsertError.message);
      return;
    }
    setRequestStatus('pending');
    alert('Partnership request sent!');
  };

  return (
    <div className="offer-card" key={id}>
      <div className="offer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={avatarUrl}
            alt={public_profiles?.name || 'User'}
            className="offer-avatar"
          />
          <div className="offer-meta">
            <h4 className="offer-name">{public_profiles?.name || 'Anonymous'}</h4>
            <span className="offer-time">
              {created_at ? new Date(created_at).toLocaleString() : ''}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {typeof rating === 'number' && (
            <span aria-label="user-rating" title={`Rating: ${rating.toFixed(1)}/5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ fontSize: 14 }}>
                  {i < Math.round(rating) ? '⭐' : '☆'}
                </span>
              ))}
            </span>
          )}
          {tag && <span className="offer-tag">#{tag}</span>}
        </div>
      </div>

      <div className="offer-body">
        <h3 className="offer-title">{title}</h3>
        <p className="offer-description">{description}</p>
      </div>

      <div className="offer-footer" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
  <button
    className="reach-out-button"
    onClick={handleReachOut}
    title="Open private chat"
  >
    💬 Reach Out
  </button>

  {requestStatus === "accepted" ? (
    <span
      className="partner-label"
      style={{
        fontWeight: "bold",
        color: "#4caf50", // green tone
        fontStyle: "italic",
      }}
    >
      ✅ Partner
    </span>
  ) : (
    <button
      className="reach-out-button"
      onClick={handleRequestPartnership}
      disabled={requesting || requestStatus === "pending"}
      title="Send partnership request"
      style={{
        backgroundColor: requestStatus === "pending" ? "#9acd32" : "limegreen",
        opacity: requesting ? 0.8 : 1,
      }}
    >
      {requestStatus === "pending"
        ? "⏳ Pending"
        : requesting
        ? "⏳ Sending..."
        : "🤝 Request Partnership"}
    </button>
  )}
</div>

    </div>
  );
}
