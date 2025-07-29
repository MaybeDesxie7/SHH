"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // ✅ Fetch offers
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

  // ✅ Detect screen size
  useEffect(() => {
    const updateMedia = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  // ✅ Sidebar behavior
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // ✅ Countdown logic
  const getCountdown = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff < 0) return "⛔ Deal expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return `⏳ ${days}d ${hrs}h ${mins}m ${secs}s left`;
  };

  // ✅ Close sidebar on navigation (mobile only)
  function handleNavClick() {
    if (!isDesktop) setSidebarOpen(false);
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li>
              <a href="/dashboard" onClick={handleNavClick}>
                <i className="fas fa-home"></i> Dashboard
              </a>
            </li>
            <li>
              <a href="/dashboard/profile" onClick={handleNavClick}>
                <i className="fas fa-user"></i> Profile
              </a>
            </li>
            <li>
              <a href="/dashboard/hustlestreet" onClick={handleNavClick}>
                <i className="fas fa-briefcase"></i> Hustle Street
              </a>
            </li>
            <li>
              <a href="/dashboard/messages" onClick={handleNavClick}>
                <i className="fas fa-envelope"></i> Messages
              </a>
            </li>
            <li>
              <a href="/dashboard/tools" onClick={handleNavClick}>
                <i className="fas fa-toolbox"></i> Tools
              </a>
            </li>
            <li>
              <a href="/dashboard/ebooks" onClick={handleNavClick}>
                <i className="fas fa-book"></i> Ebooks
              </a>
            </li>
            <li>
              <a href="/dashboard/HustleChallenges" onClick={handleNavClick}>
                <i className="fas fa-trophy"></i> Challenges
              </a>
            </li>
            <li>
              <a
                href="/dashboard/offers"
                className="active"
                onClick={handleNavClick}
              >
                <i className="fas fa-tags"></i> Offers
              </a>
            </li>
            <li>
              <a href="/dashboard/help_center" onClick={handleNavClick}>
                <i className="fas fa-question-circle"></i> Help Center
              </a>
            </li>

            {/* ✅ Animated Premium Button */}
            <motion.li
              style={{
                background: "linear-gradient(90deg, #FFD700, #FFA500)",
                borderRadius: "8px",
                margin: "10px 0",
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [1, 0.9, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <a
                href="/dashboard/Premium"
                onClick={handleNavClick}
                style={{ color: "#fff", fontWeight: "bold" }}
              >
                <i className="fas fa-crown"></i> Go Premium
              </a>
            </motion.li>

            <li>
              <a href="/dashboard/settings" onClick={handleNavClick}>
                <i className="fas fa-cog"></i> Settings
              </a>
            </li>
            <li>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff4d4d",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "8px 16px",
                }}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div className="user-info">
            <span>Deals & Offers</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button id="toggleModeBtn">
              <i className="fas fa-adjust" />
            </button>
            <button
              id="toggleMenuBtn"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
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
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noreferrer"
                  className="redeem-btn"
                >
                  Redeem
                </a>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
