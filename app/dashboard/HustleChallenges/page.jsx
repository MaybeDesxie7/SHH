"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FaCrown } from "react-icons/fa"; // <-- Added this import

export default function HustleChallengesPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [stars, setStars] = useState(0);
  const [challenges, setChallenges] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [freeSpins, setFreeSpins] = useState(0);
  const [premium, setPremium] = useState(false);

  const wheelRewards = [
    { label: "5 Stars ⭐", value: 5, weight: 20 },
    { label: "10 Stars ⭐⭐", value: 10, weight: 15 },
    { label: "Premium Offer 🎁", value: "premium_offer", weight: 6 },
    { label: "Free AI Session 🧠", value: "ai_session", weight: 7 },
    { label: "Try Again 🚫", value: 0, weight: 35 },
    { label: "20 Stars ⭐⭐⭐", value: 20, weight: 8 },
    { label: "Profile Boost ⚡", value: "profile_boost", weight: 5 },
  ];

  useEffect(() => {
    async function fetchUserData() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login");
        return;
      }
      const user = data.user;
      setUser(user);

      // Fetch stars
      const { data: starData, error: starError } = await supabase
        .from("stars")
        .select("stars_remaining")
        .eq("user_id", user.id)
        .single();
      if (!starError && starData) setStars(starData.stars_remaining);

      // Fetch profile (to check premium)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("user_id", user.id)
        .single();
      if (!profileError && profileData) setPremium(profileData.is_premium);

      // Fetch or create user spins
      const { data: spinsData, error: spinsError } = await supabase
        .from("user_spins")
        .select("free_spins_remaining, last_spin_date")
        .eq("user_id", user.id)
        .single();

      const today = new Date().toISOString().slice(0, 10);

      if (!spinsError && spinsData) {
        if (spinsData.last_spin_date !== today) {
          // Reset spins for the new day
          const spinsToSet = profileData?.is_premium ? 5 : 2;
          await supabase
            .from("user_spins")
            .update({ free_spins_remaining: spinsToSet, last_spin_date: today })
            .eq("user_id", user.id);
          setFreeSpins(spinsToSet);
        } else {
          setFreeSpins(spinsData.free_spins_remaining);
        }
      } else {
        // Insert spins record if none exists
        const spinsToSet = profileData?.is_premium ? 5 : 2;
        await supabase.from("user_spins").insert({
          user_id: user.id,
          free_spins_remaining: spinsToSet,
          last_spin_date: today,
        });
        setFreeSpins(spinsToSet);
      }
    }
    fetchUserData();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchChallenges();
      subscribeToChallengeUpdates();
      subscribeToStarUpdates();
      subscribeToSpinUpdates();
    }
  }, [user]);

  const fetchChallenges = async () => {
    const { data, error } = await supabase
      .from("user_challenges")
      .select(`
        id,
        progress,
        completed,
        challenge_id,
        challenges (
          title,
          reward,
          total_steps
        )
      `)
      .eq("user_id", user.id);

    if (!error && data) {
      setChallenges(
        data.map((uc) => ({
          id: uc.id,
          title: uc.challenges.title,
          progress: uc.progress,
          total: uc.challenges.total_steps,
          reward: uc.challenges.reward,
        }))
      );
    }
  };

  const subscribeToChallengeUpdates = () => {
    const channel = supabase
      .channel("user-challenges-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_challenges",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchChallenges()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
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
        (payload) => setStars(payload.new.stars_remaining)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  };

  const subscribeToSpinUpdates = () => {
    const channel = supabase
      .channel("user-spins-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_spins",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => setFreeSpins(payload.new.free_spins_remaining)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  };

  const weightedRandom = () => {
    const totalWeight = wheelRewards.reduce((acc, reward) => acc + reward.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const reward of wheelRewards) {
      if (rand < reward.weight) return reward;
      rand -= reward.weight;
    }
    return wheelRewards[0];
  };

  const handleSpin = async () => {
    if (isSpinning) return;

    if (freeSpins <= 0 && stars < 5) {
      alert("Not enough stars or free spins! Earn or buy more.");
      return;
    }

    setIsSpinning(true);
    setSpinResult(null);

    if (freeSpins > 0) {
      const newFreeSpins = freeSpins - 1;
      setFreeSpins(newFreeSpins);
      await supabase
        .from("user_spins")
        .update({ free_spins_remaining: newFreeSpins })
        .eq("user_id", user.id);
    } else {
      const newStars = stars - 5;
      setStars(newStars);
      await supabase
        .from("stars")
        .update({ stars_remaining: newStars })
        .eq("user_id", user.id);
    }

    setTimeout(async () => {
      const reward = weightedRandom();
      setSpinResult(reward.label);
      setIsSpinning(false);

      // Immediate reward handling
      if (typeof reward.value === "number" && reward.value > 0) {
        // Add stars reward
        const updatedStars = stars - (freeSpins > 0 ? 0 : 5) + reward.value;
        setStars(updatedStars);
        await supabase
          .from("stars")
          .update({ stars_remaining: updatedStars })
          .eq("user_id", user.id);
      } else if (reward.value === "premium_offer") {
        alert("You won a Premium Offer! You get a premium book, 25 stars, and 5 free spins.");
        // Call the SQL function to apply all perks at once (assumes function is created)
        await supabase.rpc("apply_perks_for_user", {
          p_user_id: user.id,
          p_add_stars: 25,
          p_free_spins: 5,
          p_add_premium_book: true,
          p_add_profile_boost: false,
        });
        // Refresh stars and spins after applying perks
        const { data: starData } = await supabase
          .from("stars")
          .select("stars_remaining")
          .eq("user_id", user.id)
          .single();
        if (starData) setStars(starData.stars_remaining);
        const { data: spinsData } = await supabase
          .from("user_spins")
          .select("free_spins_remaining")
          .eq("user_id", user.id)
          .single();
        if (spinsData) setFreeSpins(spinsData.free_spins_remaining);
      } else if (reward.value === "ai_session") {
        alert("You won a Free AI Session! Contact support to redeem.");
        // TODO: Add AI session backend logic if needed
      } else if (reward.value === "profile_boost") {
        alert("Your profile is boosted for 24 hours!");
        // Call SQL function or update user_perks for profile_boost
        await supabase.rpc("apply_perks_for_user", {
          p_user_id: user.id,
          p_add_stars: 0,
          p_free_spins: 0,
          p_add_premium_book: false,
          p_add_profile_boost: true,
        });
      }
    }, 3000);
  };

  const handleNavClick = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
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

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo">Glimo</div>
        <nav>
          <ul>
            <li>
              <a href="/dashboard/profile" onClick={handleNavClick}>
                <i className="fas fa-user" /> Profile
              </a>
            </li>
            <li>
              <a href="/dashboard/hustlestreet" onClick={handleNavClick}>
                <i className="fas fa-briefcase" /> Hustle Street
              </a>
            </li>
            <li>
              <a href="/dashboard/messages" onClick={handleNavClick}>
                <i className="fas fa-envelope" /> Messages
              </a>
            </li>
            <li>
              <a href="/dashboard/tools" onClick={handleNavClick}>
                <i className="fas fa-toolbox" /> Tools
              </a>
            </li>
            <li>
              <a href="/dashboard/ebooks" onClick={handleNavClick}>
                <i className="fas fa-book" /> Ebooks
              </a>
            </li>
            <li>
              <a href="/dashboard/HustleChallenges" className="active" onClick={handleNavClick}>
                <i className="fas fa-trophy" /> Challenges
              </a>
            </li>
            <li>
              <a href="/dashboard/offers" onClick={handleNavClick}>
                <i className="fas fa-tags" /> Offers
              </a>
            </li>
            <li>
              <a href="/dashboard/help_center" onClick={handleNavClick}>
                <i className="fas fa-question-circle" /> Help Center
              </a>
            </li>
            <li style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', borderRadius: '8px', margin: '10px 0' }}>
              <a href="/dashboard/premium" onClick={handleNavClick} style={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaCrown /> Go Premium
              </a>
            </li>
            <li><a href="/dashboard/settings" onClick={handleNavClick}><i className="fas fa-cog"></i> Settings</a></li>
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
                  padding: '8px 16px',
                }}
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
            <span>Summoning the hustle codes...brace yourself 🏋️🔥</span>
            <span className="stars-display">⭐ {stars} Stars</span>
            <span className="free-spins-display" style={{ marginLeft: "10px", fontWeight: "bold" }}>
              🎰 Free Spins: {freeSpins}
            </span>
            <button onClick={() => setSidebarOpen((prev) => !prev)} className="toggle-sidebar">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>

        <section className="challenges-section">
          <h2>Active Challenges</h2>
          <div className="challenges-list">
            {challenges.map((ch) => (
              <div key={ch.id} className="challenge-card">
                <h3>{ch.title}</h3>
                <p className="reward">Reward: {ch.reward} ⭐</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${(ch.progress / ch.total) * 100}%` }}></div>
                </div>
                <p className="progress-text">{ch.progress}/{ch.total} completed</p>
              </div>
            ))}
          </div>
        </section>

        <section className="spin-wheel-section">
          <h2>Spin the Wheel (5 ⭐ per spin, free spins auto applied)</h2>
          <motion.div
            className="spin-wheel"
            animate={{ rotate: isSpinning ? 1440 : 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          >
            {wheelRewards.map((reward, index) => (
              <div key={index} className="wheel-segment">{reward.label}</div>
            ))}
          </motion.div>
          <button onClick={handleSpin} disabled={isSpinning} className="btn spin-btn">
            {isSpinning ? "Spinning..." : "Spin Now"}
          </button>
          {spinResult && <p className="spin-result">🎉 You won: {spinResult}!</p>}
        </section>
      </main>
    </div>
  );
}
