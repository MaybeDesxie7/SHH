"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function HustleChallengesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stars, setStars] = useState(0);
  const [challenges, setChallenges] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);

  const wheelRewards = [
    { label: "5 Stars", value: 5 },
    { label: "10 Stars", value: 10 },
    { label: "Premium Offer", value: "premium_offer" },
    { label: "Free AI Session", value: "ai_session" },
    { label: "Try Again", value: 0 },
    { label: "20 Stars", value: 20 },
    { label: "Profile Boost", value: "profile_boost" },
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return router.push("/login");
      setUser(data.user);
    };
    getUser();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchStars();
      fetchChallenges();
      subscribeToStarUpdates();
    }
  }, [user]);

  const fetchStars = async () => {
    const { data, error } = await supabase
      .from("stars")
      .select("stars_remaining")
      .eq("user_id", user.id)
      .single();
    if (!error && data) setStars(data.stars_remaining);
  };

  const subscribeToStarUpdates = () => {
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
    return () => supabase.removeChannel(channel);
  };

  const fetchChallenges = async () => {
    setChallenges([
      { id: 1, title: "Post 3 Offers", progress: 2, total: 3, reward: 10 },
      { id: 2, title: "Send 5 Messages", progress: 1, total: 5, reward: 5 },
      { id: 3, title: "Complete Profile", progress: 1, total: 1, reward: 3 },
    ]);
  };

  const handleSpin = async () => {
    if (stars < 5) {
      alert("Not enough stars! Earn or buy more.");
      return;
    }
    setIsSpinning(true);
    setSpinResult(null);

    await supabase
      .from("stars")
      .update({ stars_remaining: stars - 5 })
      .eq("user_id", user.id);

    setTimeout(async () => {
      const reward = wheelRewards[Math.floor(Math.random() * wheelRewards.length)];
      setSpinResult(reward.label);
      setIsSpinning(false);

      if (typeof reward.value === "number" && reward.value > 0) {
        await supabase
          .from("stars")
          .update({ stars_remaining: stars - 5 + reward.value })
          .eq("user_id", user.id);
      }
    }, 3000);
  };

  // ✅ Close sidebar when link clicked (on mobile)
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // ✅ Ensure sidebar is always open on desktop
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

  if (!user) return <p>Loading...</p>;

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
            <li><a href="/dashboard/HustleChallenges" className="active" onClick={handleNavClick}><i className="fas fa-trophy"></i>Challenges</a></li>
            <li><a href="/dashboard/offers" onClick={handleNavClick}><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/help_center" onClick={handleNavClick}><i className="fas fa-question-circle"></i> Help Center</a></li>

            {/* Premium Link - Highlighted */}
            <li style={{ background: "linear-gradient(90deg, #FFD700, #FFA500)", borderRadius: "8px", margin: "10px 0" }}>
              <a href="/dashboard/Premium" onClick={handleNavClick} style={{ color: "#fff", fontWeight: "bold" }}>
                <i className="fas fa-crown"></i> Go Premium
              </a>
            </li>

            <li><a href="/dashboard/settings" onClick={handleNavClick}><i className="fas fa-cog"></i> Settings</a></li>
            <li>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px' }}
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
            <span>Summoning the hustle codes...brace yourself 🏋️🔥</span>
            <span className="stars-display">⭐ {stars} Stars</span>
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="toggle-sidebar"
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>

        {/* Challenges Section */}
        <section className="challenges-section">
          <h2>Active Challenges</h2>
          <div className="challenges-list">
            {challenges.map((ch) => (
              <div key={ch.id} className="challenge-card">
                <h3>{ch.title}</h3>
                <p className="reward">Reward: {ch.reward} ⭐</p>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${(ch.progress / ch.total) * 100}%` }}
                  ></div>
                </div>
                <p className="progress-text">{ch.progress}/{ch.total} completed</p>
              </div>
            ))}
          </div>
        </section>

        {/* Spin Wheel Section */}
        <section className="spin-wheel-section">
          <h2>Spin the Wheel (5 ⭐ per spin)</h2>
          <motion.div
            className="spin-wheel"
            animate={{ rotate: isSpinning ? 1440 : 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          >
            {wheelRewards.map((reward, index) => (
              <div key={index} className="wheel-segment">
                {reward.label}
              </div>
            ))}
          </motion.div>
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="btn spin-btn"
          >
            {isSpinning ? "Spinning..." : "Spin Now"}
          </button>
          {spinResult && (
            <p className="spin-result">🎉 You won: {spinResult}!</p>
          )}
        </section>
      </main>
    </div>
  );
}
