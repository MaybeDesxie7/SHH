'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";
import {
  FaChartBar,
  FaCalendarAlt,
  FaMagic,
  FaUserPlus,
  FaStar,
  FaHistory,
  FaCrown,
  FaHandshake,
  FaTags
} from "react-icons/fa";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [messagesCount, setMessagesCount] = useState(0);
  const [hustlePalsCount, setHustlePalsCount] = useState(0); // replaced clientsCount
  const [starsRemaining, setStarsRemaining] = useState(0);
  const [aiAdvice, setAiAdvice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [starUsage, setStarUsage] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [offersFeed, setOffersFeed] = useState([]); // from HustleStreet for collapsible section

  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return router.push("/login");
      setUser(userData.user);

      const [{ data: profileData }, { data: starData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userData.user.id).single(),
        supabase.from("stars").select("*").eq("user_id", userData.user.id).single(),
      ]);

      setProfile(profileData);
      setStarsRemaining(starData?.stars_remaining || 0);

      // Count pending accepted partnership requests as Hustle Pals
      const { count: palsCount, error: palsError } = await supabase
  .from("partnership_requests")
  .select('*', { count: 'exact', head: true })
  .or(`sender_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`)
  .eq('status', 'accepted');

if (palsError) {
  console.error("Error fetching Hustle Pals:", palsError);
  setHustlePalsCount(0);
} else {
  setHustlePalsCount(palsCount || 0);
}


      const { count: msgCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver", userData.user.email);

      setMessagesCount(msgCount || 0);

      // Fetch latest offers for the collapsible section
      const { data: offersData, error: offersError } = await supabase
        .from("hustle_offers")
        .select("id,title")
        .order("created_at", { ascending: false })
        .limit(5);

      if (offersError) {
        console.error("Error fetching offers:", offersError);
        setOffersFeed([]);
      } else {
        setOffersFeed(offersData || []);
      }

      // Example star usage data
      setStarUsage([
        { name: "Posts", value: 5 },
        { name: "Boosts", value: 3 },
        { name: "Messages", value: 2 },
      ]);

      // Example engagements (you can replace with real data)
      setEngagements([
        "Jane joined your promo",
        "Alex responded to your offer",
      ]);
    };
    init();
  }, [router]);

  const generateOffer = () => {
    if (!customTitle && !customDescription) {
      toast.error("Fill in at least one field");
      return;
    }
    toast.success("Offer generated with flair ✨");
    setCustomTitle("🔥 Unlock Global Collab Potential");
    setCustomDescription("Join forces with like-minded hustlers and maximize your reach.");
  };

  const handleStarAIAdvice = () => {
    setAiAdvice("Thinking...");
    toast.loading("Star AI is thinking...");
    setTimeout(() => {
      toast.dismiss();
      toast.success("Advice ready!");
      setAiAdvice("Focus on collaborating via Hustle Street and schedule weekly engagement drives.");
    }, 1500);
  };

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  if (!user) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo">Glimo</div>
        <nav>
          <ul>
            <li><a href="/dashboard" className="active" onClick={handleNavClick}><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile" onClick={handleNavClick}><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/hustlestreet" onClick={handleNavClick}><i className="fas fa-briefcase"></i> Hustle Street</a></li>
            <li><a href="/dashboard/messages" onClick={handleNavClick}><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools" onClick={handleNavClick}><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks" onClick={handleNavClick}><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/HustleChallenges" onClick={handleNavClick}><i className="fas fa-trophy"></i> Challenges</a></li>
            <li><a href="/dashboard/offers" onClick={handleNavClick}><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/help_center" onClick={handleNavClick}><i className="fas fa-question-circle"></i> Help Center</a></li>

            {/* Premium Link - Highlighted */}
            <li style={{ background: "linear-gradient(90deg, #FFD700, #FFA500)", borderRadius: "8px", margin: "10px 0" }}>
              <a href="/dashboard/Premium" onClick={handleNavClick} style={{ color: "#fff", fontWeight: "bold" }}>
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
                style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px' }}
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
            <span>The Community is here for you, {profile?.name || user.user_metadata?.name || user.email}</span>
            <img src={profile?.avatar || "https://i.pravatar.cc/100"} alt="User" />
            <button id="toggleMenuBtn" title="Toggle Menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>

        {/* Overview Cards */}
        <section className="overview">
          <div className="stats-grid">
            <div className="card"><FaHandshake /><h3>Hustle Pals</h3><p>{hustlePalsCount}</p></div>
            <div className="card"><i className="fas fa-envelope"></i><h3>Messages</h3><p>{messagesCount}</p></div>
            <div className="card star-card"><FaStar /><h3>Stars</h3><p>{starsRemaining} ⭐</p></div>
          </div>
        </section>

        {/* ✅ Premium Upgrade Highlight with Animation */}
        <motion.section
          className="premium-highlight"
          style={{
            background: "linear-gradient(135deg, #FFD700, #FFA500)",
            borderRadius: "12px",
            padding: "20px",
            color: "#fff",
            margin: "20px 0",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h2
            style={{ fontSize: "24px", fontWeight: "bold" }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <FaCrown /> Upgrade to Premium
          </motion.h2>
          <p style={{ marginTop: "10px", fontSize: "16px" }}>Unlock exclusive perks, double rewards, and more!</p>
          <a href="/dashboard/Premium">
            <motion.button
              style={{
                background: "#fff",
                color: "#FFA500",
                fontWeight: "bold",
                padding: "12px 20px",
                borderRadius: "8px",
                marginTop: "15px",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(0,0,0,0.2)"
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              Go Premium Now
            </motion.button>
          </a>
        </motion.section>

        {/* Star AI Assistant */}
        <section className="star-ai-box">
          <h3><FaStar /> Star AI Assistant</h3>
          <p>{aiAdvice || "Click to get advice tailored to your hustle."}</p>
          <button onClick={handleStarAIAdvice}>Ask Star AI</button>
        </section><br />

        {/* Collapsible Sections */}
        <section className="collapsible">
          <details>
            <summary><FaTags /> Latest Offers</summary>
            <ul>
              {offersFeed.length > 0 ? (
                offersFeed.map((offer) => <li key={offer.id}>{offer.title}</li>)
              ) : (
                <li>No offers found.</li>
              )}
            </ul>
          </details>

          <details>
            <summary><FaChartBar /> Recent Hustle Engagements</summary>
            <ul>{engagements.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </details>
        </section>
      </main>
    </div>
  );
}
