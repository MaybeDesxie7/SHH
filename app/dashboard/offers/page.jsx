'use client';

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      const { data, error } = await supabase.from("offers").select("*");
      if (error) {
        console.error("Failed to fetch offers:", error.message);
      } else {
        setOffers(data);
      }
    };

    fetchOffers();
  }, []);

  const getCountdown = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff < 0) return "⛔ Deal expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return `⏳ ${days}d ${hrs}h ${mins}m ${secs}s left`;
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`} id="sidebar">
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li><a href="/dashboard"><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile"><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/hustlestreet"><i className="fas fa-briefcase"></i>Hustle Street</a></li>
            <li><a href="/dashboard/messages"><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools"><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks"><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/tutorials"><i className="fas fa-video"></i> Tutorials</a></li>
            <li><a href="/dashboard/offers" className="active"><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/help_center"><i className="fas fa-question-circle"></i> Help Center</a></li>
            <li><a href="/dashboard/settings"><i className="fas fa-cog"></i> Settings</a></li>
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
                  padding: '8px 16px'
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
            <button id="toggleMenuBtn" onClick={() => setSidebarOpen(prev => !prev)}>
              <i className="fas fa-bars" />
            </button>
          </div>
        </header>

        <section className="offers-grid">
          {offers.length === 0 ? (
            <p>Loading offers...</p>
          ) : (
            offers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                <div className="countdown">{getCountdown(offer.deadline)}</div>
                <a href={offer.url} target="_blank" className="redeem-btn">Redeem</a>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
