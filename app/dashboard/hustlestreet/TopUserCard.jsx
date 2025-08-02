'use client';

export default function TopUserCard({ name, avatar, total_stars, total_votes, total_offers }) {
  return (
    <div className="top-user-card">
      <img
        src={avatar || '/default-avatar.png'}
        alt={name || 'Top User'}
        className="top-user-avatar"
      />
      <div className="top-user-info">
        <h4>{name || 'Unnamed'}</h4>
        <p>
          ⭐ {total_stars ?? 0} | 👍 {total_votes ?? 0} | 📦 {total_offers ?? 0}
        </p>
      </div>
    </div>
  );
}
