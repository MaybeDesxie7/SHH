"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  FaChartBar,
  FaCalendarAlt,
  FaMagic,
  FaUserPlus,
  FaStar,
  FaHistory,
} from "react-icons/fa";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [messagesCount, setMessagesCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [starsRemaining, setStarsRemaining] = useState(0);
  const [aiAdvice, setAiAdvice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [starUsage, setStarUsage] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [growth, setGrowth] = useState([]);
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

      const { count: msgCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver", userData.user.email);

      const { count: clCount } = await supabase
        .from("messages")
        .select("sender", { count: "exact", head: true })
        .neq("sender", userData.user.email);

      setMessagesCount(msgCount || 0);
      setClientsCount(clCount || 0);

      setStarUsage([
        { name: "Posts", value: 5 },
        { name: "Boosts", value: 3 },
        { name: "Messages", value: 2 },
      ]);
      setEngagements(["Jane joined your promo", "Alex responded to your offer"]);
      setSchedule(["Cross-promo with Zara - Jul 25", "Collab launch - Jul 27"]);
      setGrowth([
        { date: "Jul 1", count: 100 },
        { date: "Jul 15", count: 140 },
        { date: "Jul 23", count: 180 },
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

  if (!user) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li><a href="/dashboard" className="active"><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile"><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/hustlestreet"><i className="fas fa-briefcase"></i> Hustle Street</a></li>
            <li><a href="/dashboard/messages"><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools"><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks"><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/tutorials"><i className="fas fa-video"></i> Tutorials</a></li>
            <li><a href="/dashboard/offers"><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/help_center"><i className="fas fa-question-circle"></i> Help Center</a></li>
            <li><a href="/dashboard/settings"><i className="fas fa-cog"></i> Settings</a></li>
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
            <span>Welcome back, {profile?.name || user.user_metadata?.name || user.email}</span>
            <img src={profile?.avatar || "https://i.pravatar.cc/100"} alt="User Profile" />
            <button id="toggleModeBtn" title="Toggle Light/Dark Mode">
              <i className="fas fa-adjust"></i>
            </button>
            <button id="toggleMenuBtn" title="Toggle Menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>

        <section className="overview">
          <div className="stats-grid">
            <div className="card"><i className="fas fa-users"></i><h3>Clients</h3><p>{clientsCount}</p></div>
            <div className="card"><i className="fas fa-envelope"></i><h3>Messages</h3><p>{messagesCount}</p></div>
            <div className="card star-card"><i className="fas fa-star"></i><h3>Stars</h3><p>{starsRemaining} ⭐</p></div>
          </div>
        </section>

        <section className="star-ai-box">
          <h3><FaStar /> Star AI Assistant</h3>
          <p>{aiAdvice || "Click to get advice tailored to your hustle."}</p>
          <button onClick={handleStarAIAdvice}>Ask Star AI</button>
        </section><br />

        <section className="collapsible">
          <details>
            <summary><FaHistory /> Star Usage History</summary>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={starUsage} dataKey="value" nameKey="name" outerRadius={80}>
                  {starUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658"][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </details>

          <details>
            <summary><FaChartBar /> Recent Hustle Engagements</summary>
            <ul>{engagements.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </details>

          <details>
            <summary><FaCalendarAlt /> Freelancer Schedule</summary>
            <ul>{schedule.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </details>

          <details>
            <summary><FaMagic /> Custom Offer Generator</summary>
            <div>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Title"
              />
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Description"
              />
              <button onClick={generateOffer}>Generate Offer</button>
              {customTitle && <p><strong>{customTitle}</strong></p>}
              {customDescription && <p>{customDescription}</p>}
            </div>
          </details>

          <details>
            <summary><FaUserPlus /> Follower/Contact Growth</summary>
            <ul>
              {growth.map((g, i) => <li key={i}>{g.date}: {g.count} followers</li>)}
            </ul>
          </details>
        </section>
      </main>
    </div>
  );
}
