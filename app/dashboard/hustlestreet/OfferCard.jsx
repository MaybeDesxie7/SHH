'use client';

import { useRouter } from 'next/navigation';

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

  const handleReachOut = () => {
    if (!user_id) return alert('User not available');
    router.push(`/dashboard/messages?user=${user_id}`);
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
      </div>
    </div>
  );
}
