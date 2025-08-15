"use client";

import { useEffect, useMemo, useState } from "react";
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

  // ---- Helpers
  const requireAuth = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      router.push("/login");
      return null;
    }
    return data.user;
  };

  // ---- Boot
  useEffect(() => {
    (async () => {
      const u = await requireAuth();
      if (!u) return;
      setUser(u);

      // Ensure stars row exists (idempotent)
      const { data: starRow, error: starErr } = await supabase
        .from("stars")
        .select("stars_remaining")
        .eq("user_id", u.id)
        .single();

      if (starErr) {
        // If no row yet, create one
        const { error: insertErr } = await supabase
          .from("stars")
          .insert({ user_id: u.id, stars_purchased: 0, stars_remaining: 0 });
        if (insertErr) console.error("Failed to init stars row:", insertErr);
      } else {
        setStars(starRow?.stars_remaining || 0);
      }

      // Fetch profile
      const { data: pData, error: pErr } = await supabase
        .from("profiles")
        .select("name, avatar, is_premium")
        .eq("user_id", u.id)
        .single();

      if (pErr || !pData) {
        // Create minimal profile if none
        const { error: upErr } = await supabase
          .from("profiles")
          .upsert(
            {
              user_id: u.id,
              name: u.email?.split("@")[0] || "",
              email: u.email,
              avatar: "https://i.pravatar.cc/150?img=3",
            },
            { onConflict: "user_id" }
          );
        if (upErr) console.error("Failed to init profile:", upErr);
        setProfile({
          name: u.email?.split("@")[0] || "",
          avatar: "https://i.pravatar.cc/150?img=3",
          is_premium: false,
        });
      } else {
        setProfile(pData);
      }

      // Live subscribe to star updates
      const channel = supabase
        .channel("stars-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "stars",
            filter: `user_id=eq.${u.id}`,
          },
          (payload) => setStars(payload.new.stars_remaining)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Handlers
  const handleBuyStars = async (bundle) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          bundle, // 50 | 120 | 300 | "star_ai"
        }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
      setModalMessage("Failed to start purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribePremium = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-premium-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
      setModalMessage("Failed to start subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (perk, cost) => {
    if (!user) return;
    if (stars < cost) {
      setModalMessage("Not enough stars to redeem this perk.");
      return;
    }
    setRedeemLoading(true);
    try {
      // atomic decrement (let RLS enforce ownership)
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

      // Optional: write to user_perks for time-bound perks
      if (perk === "Profile Highlight") {
        await supabase.rpc("apply_perks_for_user", {
          p_user_id: user.id,
          p_add_stars: 0,
          p_free_spins: 0,
          p_add_premium_book: false,
          p_add_profile_boost: true,
        });
      } else if (perk === "Offer Boost - 1 Week") {
        // repurpose as a profile_boost (7 days)
        await supabase.rpc("grant_profile_boost_days", {
          p_user_id: user.id,
          p_days: 7,
        });
      }

      setModalMessage(`Successfully redeemed: ${perk}`);
    } catch (error) {
      console.error(error);
      setModalMessage(`Error redeeming perk: ${error.message}`);
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!user || !profile) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo">Glimo</div>
        <nav>
          <ul>
            <li><a href="/dashboard" onClick={handleNavClick}><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile" onClick={handleNavClick}><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/hustlestreet" onClick={handleNavClick}><i className="fas fa-briefcase"></i> Hustle Street</a></li>
            <li><a href="/dashboard/messages" onClick={handleNavClick}><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools" onClick={handleNavClick}><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks" onClick={handleNavClick}><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/HustleChallenges" onClick={handleNavClick}><i className="fas fa-trophy"></i> Challenges</a></li>
            <li><a href="/dashboard/offers" onClick={handleNavClick}><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/help_center" onClick={handleNavClick}><i className="fas fa-question-circle"></i> Help Center</a></li>
            <li style={{ background: "linear-gradient(90deg, #FFD700, #FFA500)", borderRadius: "8px", margin: "10px 0" }}>
              <a href="/dashboard/premium" className="active" onClick={handleNavClick} style={{ color: "#fff", fontWeight: "bold" }}>
                <i className="fas fa-crown"></i> Go Premium
              </a>
            </li>
            <li><a href="/dashboard/settings" onClick={handleNavClick}><i className="fas fa-cog"></i> Settings</a></li>
            <li>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
                style={{ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", padding: "8px 16px" }}
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
            {profile?.avatar && (
              <img
                src={profile.avatar}
                alt={profile.name || "User"}
                style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 8 }}
              />
            )}
            <span>{profile?.name || user.email}</span>
            <span className="stars-display" style={{ marginLeft: "auto", fontWeight: "bold" }}>⭐ {stars} Stars</span>
            <button onClick={() => setSidebarOpen((prev) => !prev)} className="toggle-sidebar" aria-label="Toggle sidebar">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>

        <section className="premium-section">
          <h2>Why Go Premium?</h2>
          <div className="premium-perks">
            <div className="premium-card"><i className="fas fa-crown"></i><h3>Double Rewards</h3></div>
            <div className="premium-card"><i className="fas fa-sync"></i><h3>5 Free Spins</h3></div>
            <div className="premium-card"><i className="fas fa-bolt"></i><h3>Profile Highlight</h3></div>
            <div className="premium-card"><i className="fas fa-map-marker-alt"></i><h3>Find Users Near Me</h3></div>
            <div className="premium-card"><i className="fas fa-star"></i><h3>25 Bonus Stars</h3></div>
            <div className="premium-card"><i className="fas fa-book"></i><h3>1 Free Ebook</h3></div>
            <div className="premium-card"><i className="fas fa-robot"></i><h3>Star AI</h3></div>
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
            <div className="stars-card"><h3>50 Stars</h3><p>$5</p><button className="btn" onClick={() => handleBuyStars(50)} disabled={loading}>Buy Now</button></div>
            <div className="stars-card"><h3>120 Stars</h3><p>$10</p><button className="btn" onClick={() => handleBuyStars(120)} disabled={loading}>Buy Now</button></div>
            <div className="stars-card"><h3>300 Stars</h3><p>$20</p><button className="btn" onClick={() => handleBuyStars(300)} disabled={loading}>Buy Now</button></div>
            <div className="stars-card"><h3>Star AI</h3><p>$2.49/month</p><button className="btn" onClick={() => handleBuyStars("star_ai")} disabled={loading}>Unlock</button></div>
          </div>
        </section>

        <section className="stars-marketplace">
          <h2>Spend Your Stars</h2>
          <div className="marketplace-grid">
            <div className="marketplace-item">
              <h3>Profile Highlight</h3>
              <p>30 ⭐</p>
              <button className="btn" disabled={stars < 30 || redeemLoading} onClick={() => handleRedeem("Profile Highlight", 30)}>
                {redeemLoading ? "Processing..." : "Redeem"}
              </button>
            </div>
            <div className="marketplace-item">
              <h3>Offer Boost (1 week)</h3>
              <p>35 ⭐</p>
              <button className="btn" disabled={stars < 35 || redeemLoading} onClick={() => handleRedeem("Offer Boost - 1 Week", 35)}>
                {redeemLoading ? "Processing..." : "Redeem"}
              </button>
            </div>
            <div className="marketplace-item">
              <h3>Extra Spin</h3>
              <p>5 ⭐</p>
              <button className="btn" disabled={stars < 5 || redeemLoading} onClick={() => handleRedeem("Extra Spin", 5)}>
                {redeemLoading ? "Processing..." : "Redeem"}
              </button>
            </div>
            {/* Removed AI Session as requested */}
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
