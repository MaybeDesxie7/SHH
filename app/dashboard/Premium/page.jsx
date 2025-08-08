"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PremiumPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stars, setStars] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Get authenticated user or redirect to login
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return router.push("/login");
      setUser(data.user);
    };
    getUser();
  }, [router]);

  // Fetch profile and stars, subscribe to stars updates
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar, is_premium")
        .eq("user_id", user.id)
        .single();
      if (!error) setProfile(data);
    };

    const fetchStars = async () => {
      const { data, error } = await supabase
        .from("stars")
        .select("stars_remaining")
        .eq("user_id", user.id)
        .single();
      if (!error && data) setStars(data.stars_remaining);
    };

    fetchProfile();
    fetchStars();

    const channel = supabase
      .channel("stars-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "stars",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setStars(payload.new.stars_remaining);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Buy stars checkout
  const handleBuyStars = async (bundle) => {
    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle, email: user.email }),
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      setModalMessage("Failed to start purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to premium checkout
  const handleSubscribePremium = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/create-premium-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      setModalMessage("Failed to start subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Redeem perks with stars, with loading and error handling
  const handleRedeem = async (perk, cost) => {
    if (stars < cost) {
      setModalMessage("Not enough stars to redeem this perk.");
      return;
    }
    setRedeemLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("stars")
        .update({ stars_remaining: stars - cost })
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      const { error: insertError } = await supabase.from("redemptions").insert({
        user_id: user.id,
        perk,
        cost,
      });
      if (insertError) throw insertError;

      setModalMessage(`Successfully redeemed: ${perk}`);
    } catch (error) {
      setModalMessage(`Error redeeming perk: ${error.message}`);
    } finally {
      setRedeemLoading(false);
    }
  };

  // Sidebar toggle on nav click for mobile
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Manage sidebar open state on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!user) return <p>Loading user...</p>;

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo">Glimo</div>
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
              <a href="/dashboard/offers" onClick={handleNavClick}>
                <i className="fas fa-tags"></i> Offers
              </a>
            </li>
            <li>
              <a href="/dashboard/help_center" onClick={handleNavClick}>
                <i className="fas fa-question-circle"></i> Help Center
              </a>
            </li>
            <li
              style={{
                background: "linear-gradient(90deg, #FFD700, #FFA500)",
                borderRadius: "8px",
                margin: "10px 0",
              }}
            >
              <a
                href="/dashboard/Premium"
                className="active"
                onClick={handleNavClick}
                style={{ color: "#fff", fontWeight: "bold" }}
              >
                <i className="fas fa-crown"></i> Go Premium
              </a>
            </li>
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

      <main className="main-content">
        <header>
          <div className="user-info">
            {profile && (
              <>
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 8 }}
                />
                <span>{profile.name}</span>
              </>
            )}
            <span className="stars-display" style={{ marginLeft: "auto", fontWeight: "bold" }}>
              ⭐ {stars} Stars
            </span>
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="toggle-sidebar"
              aria-label="Toggle sidebar"
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>

        <section className="premium-section">
          <h2>Why Go Premium?</h2>
          <div className="premium-perks">
            <div className="premium-card">
              <i className="fas fa-crown"></i>
              <h3>Double Rewards</h3>
            </div>
            <div className="premium-card">
              <i className="fas fa-sync"></i>
              <h3>5 Free Spins</h3>
            </div>
            <div className="premium-card">
              <i className="fas fa-bolt"></i>
              <h3>Profile Highlight</h3>
            </div>
            <div className="premium-card">
              <i className="fas fa-map-marker-alt"></i>
              <h3>Find Users Near Me</h3>
            </div>
            <div className="premium-card">
              <i className="fas fa-star"></i>
              <h3>25 Bonus Stars</h3>
            </div>
            {/* New perks added */}
            <div className="premium-card">
              <i className="fas fa-book"></i>
              <h3>1 Free Ebook</h3>
            </div>
            <div className="premium-card">
              <i className="fas fa-robot"></i>
              <h3>Star AI</h3>
            </div>
          </div>

          {profile?.is_premium ? (
            <p style={{ fontWeight: "bold", color: "gold", marginTop: 16 }}>
              You are a Premium member! Thank you for your support.
            </p>
          ) : (
            <button className="btn premium-btn" onClick={handleSubscribePremium} disabled={loading}>
              {loading ? "Loading..." : "Subscribe for $9.99/month"}
            </button>
          )}
        </section>

        <section className="buy-stars-section">
          <h2>Buy Stars</h2>
          <div className="stars-bundles">
            <div className="stars-card">
              <h3>50 Stars</h3>
              <p>$5</p>
              <button className="btn" onClick={() => handleBuyStars(50)} disabled={loading}>
                Buy Now
              </button>
            </div>
            <div className="stars-card">
              <h3>120 Stars</h3>
              <p>$10</p>
              <button className="btn" onClick={() => handleBuyStars(120)} disabled={loading}>
                Buy Now
              </button>
            </div>
            <div className="stars-card">
              <h3>300 Stars</h3>
              <p>$20</p>
              <button className="btn" onClick={() => handleBuyStars(300)} disabled={loading}>
                Buy Now
              </button>
            </div>
            <div className="stars-card">
              <h3>Star AI</h3>
              <p>$2.49/month</p>
              <button className="btn" onClick={() => handleBuyStars("star_ai")} disabled={loading}>
                Unlock
              </button>
            </div>
          </div>
        </section>

        <section className="stars-marketplace">
          <h2>Spend Your Stars</h2>
          <div className="marketplace-grid">
            <div className="marketplace-item">
              <h3>Profile Highlight</h3>
              <p>30 ⭐</p>
              <button
                className="btn"
                disabled={stars < 30 || redeemLoading}
                onClick={() => handleRedeem("Profile Highlight", 30)}
              >
                {redeemLoading ? "Processing..." : "Redeem"}
              </button>
            </div>
            <div className="marketplace-item">
              <h3>Offer Boost (1 week)</h3>
              <p>35 ⭐</p>
              <button
                className="btn"
                disabled={stars < 35 || redeemLoading}
                onClick={() => handleRedeem("Offer Boost - 1 Week", 35)}
              >
                {redeemLoading ? "Processing..." : "Redeem"}
              </button>
            </div>
            <div className="marketplace-item">
              <h3>Extra Spin</h3>
              <p>5 ⭐</p>
              <button
                className="btn"
                disabled={stars < 5 || redeemLoading}
                onClick={() => handleRedeem("Extra Spin", 5)}
              >
                {redeemLoading ? "Processing..." : "Redeem"}
              </button>
            </div>
            <div className="marketplace-item">
              <h3>AI Session</h3>
              <p>15 ⭐</p>
              <button
                className="btn"
                disabled={stars < 15 || redeemLoading}
                onClick={() => handleRedeem("AI Session", 15)}
              >
                {redeemLoading ? "Processing..." : "Redeem"}
              </button>
            </div>
          </div>
        </section>

        {modalMessage && (
          <div className="modal">
            <div className="modal-content">
              <p>{modalMessage}</p>
              <button onClick={() => setModalMessage("")}>Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
