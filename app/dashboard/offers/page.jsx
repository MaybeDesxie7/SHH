"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);

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
      <aside className="sidebar" id="sidebar">
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li><Link href="/dashboard"><i className="fas fa-home" /> Dashboard</Link></li>
            <li><Link href="/dashboard/profile"><i className="fas fa-user" /> Profile</Link></li>
            <li><Link href="/dashboard/services"><i className="fas fa-briefcase" /> My Services</Link></li>
            <li><Link href="/dashboard/messages"><i className="fas fa-envelope" /> Messages</Link></li>
            <li><Link href="/dashboard/tools"><i className="fas fa-toolbox" /> Tools</Link></li>
            <li><Link href="/dashboard/ebooks"><i className="fas fa-book" /> Ebooks</Link></li>
            <li><Link href="/dashboard/tutorials"><i className="fas fa-video" /> Tutorials</Link></li>
            <li><Link href="/dashboard/offers" className="active"><i className="fas fa-tags" /> Offers</Link></li>
            <li><a href="/dashboard/help_center"><i className="fas fa-question-circle"></i> Help Center</a></li>
            <li><Link href="/dashboard/settings"><i className="fas fa-cog" /> Settings</Link></li>
            <li>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                style={{ color: "#ff4d4d", background: "none", border: "none", cursor: "pointer" }}
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
            <span>Deals & Offers</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button id="toggleModeBtn"><i className="fas fa-adjust" /></button>
            <button id="toggleMenuBtn"><i className="fas fa-bars" /></button>
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
