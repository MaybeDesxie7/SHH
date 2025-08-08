"use client";

import React from "react";

export default function TopUserCard({
  name,
  avatar,
  total_stars,
  total_votes,
  total_offers,
  boosted = false, // new prop to indicate profile boost
}) {
  return (
    <div className={`top-user-card ${boosted ? "boosted" : ""}`}>
      <img
        src={avatar || "/default-avatar.png"}
        alt={name || "Top User"}
        className="top-user-avatar"
      />
      <div className="top-user-info">
        <h4>{name || "Unnamed"}</h4>
        <p>
          ⭐ {total_stars ?? 0} | 👍 {total_votes ?? 0} | 📦 {total_offers ?? 0}
        </p>
      </div>

      {boosted && (
        <div className="boost-badge" title="Profile Boost Active! ⚡">
          ⚡ Boosted
        </div>
      )}

      <style jsx>{`
        .top-user-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #1a1a1a;
          border-radius: 8px;
          color: #fff;
          position: relative;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
          transition: box-shadow 0.3s ease;
        }

        .top-user-card.boosted {
          border: 2px solid gold;
          box-shadow: 0 0 15px 4px gold;
          background: linear-gradient(90deg, #fff8dc, #fffacd);
          color: #000;
        }

        .top-user-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #444;
        }

        .top-user-info h4 {
          margin: 0 0 0.25rem;
          font-weight: 600;
        }

        .top-user-info p {
          margin: 0;
          font-size: 0.9rem;
          color: inherit;
        }

        .boost-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: gold;
          color: black;
          padding: 0.15rem 0.5rem;
          font-weight: bold;
          border-radius: 12px;
          font-size: 0.8rem;
          user-select: none;
        }
      `}</style>
    </div>
  );
}
