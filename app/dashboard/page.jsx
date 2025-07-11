'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [servicesCount, setServicesCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/login');
      } else {
        setUser(userData.user);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, avatar')
          .eq('user_id', userData.user.id)
          .single();
        setProfile(profileData);

        const { count: svcCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userData.user.id);
        setServicesCount(svcCount || 0);

        const { count: msgCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver', userData.user.email);
        setMessagesCount(msgCount || 0);

        const { count: clCount } = await supabase
          .from('messages')
          .select('sender', { count: 'exact', head: true })
          .neq('sender', userData.user.email);
        setClientsCount(clCount || 0);
      }
    };

    init();

    const handleClickOutside = (e) => {
      const sidebar = document.getElementById('sidebar');
      const toggleBtn = document.getElementById('toggleMenuBtn');
      if (sidebar && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('show');
      }
    };

    document.addEventListener('click', handleClickOutside);

    document.getElementById("toggleModeBtn")?.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
    });

    document.getElementById("toggleMenuBtn")?.addEventListener("click", () => {
      document.getElementById("sidebar")?.classList.toggle("show");
    });

    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
      card.addEventListener('mouseenter', () => card.style.transform = 'scale(1.05)');
      card.addEventListener('mouseleave', () => card.style.transform = 'scale(1)');
    });

    document.getElementById("getAdviceBtn")?.addEventListener("click", () => {
      const box = document.getElementById("aiAdviceResponse");
      const text = document.getElementById("adviceText");
      if (box && text) {
        box.style.display = 'block';
        text.textContent = 'Thinking...';
        setTimeout(() => {
          text.textContent = 'Focus on high-demand services like AI automation, web development, or affiliate monetization.';
        }, 1500);
      }
    });

    const ctx = document.getElementById("activityChart")?.getContext("2d");
    if (ctx) {
      import('chart.js/auto').then(() => {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
              label: "Activity",
              data: [12, 19, 3, 5, 2, 3, 7],
              borderColor: "limegreen",
              backgroundColor: "rgba(50, 205, 50, 0.1)",
              fill: true,
              tension: 0.4
            }]
          },
          options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
      });
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [router]);

  if (!user) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <aside className="sidebar" id="sidebar">
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li><a href="/dashboard" className="active"><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile"><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/services"><i className="fas fa-briefcase"></i> My Services</a></li>
            <li><a href="/dashboard/messages"><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools"><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks"><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/tutorials"><i className="fas fa-video"></i> Tutorials</a></li>
            <li><a href="/dashboard/offers"><i className="fas fa-tags"></i> Offers</a></li>
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
            <button id="toggleModeBtn" title="Toggle Light/Dark Mode"><i className="fas fa-adjust"></i></button>
            <button id="toggleMenuBtn" title="Toggle Menu"><i className="fas fa-bars"></i></button>
          </div>
        </header>

        <section className="overview">
          <div className="stats-grid">
            <div className="card"><i className="fas fa-users"></i><h3>Clients</h3><p>{clientsCount}</p></div>
            <div className="card"><i className="fas fa-cogs"></i><h3>Services</h3><p>{servicesCount}</p></div>
            <div className="card"><i className="fas fa-dollar-sign"></i><h3>Earnings</h3><p>$0.00</p></div>
            <div className="card"><i className="fas fa-calendar-day"></i><h3>Daily</h3><p>0%</p></div>
            <div className="card"><i className="fas fa-calendar-week"></i><h3>Weekly</h3><p>0%</p></div>
            <div className="card"><i className="fas fa-star"></i><h3>Rating</h3><p>0 ★</p></div>
          </div>

          <div className="quick-actions">
            <h3><i className="fas fa-rocket"></i> Quick Actions</h3>
            <div className="quick-links">
              <button onClick={() => window.location.href = '/dashboard/services'}><i className="fas fa-plus"></i> Add Service</button>
              <button onClick={() => window.location.href = '/dashboard/tutorials'}><i className="fas fa-video"></i> View Tutorials</button>
              <button onClick={() => window.location.href = '/dashboard/tools'}><i className="fas fa-briefcase"></i> Start Hustle</button>
              <button id="getAdviceBtn"><i className="fas fa-robot"></i> Get Advice</button>
            </div>
            <div id="aiAdviceResponse" className="advice-box" style={{ display: 'none' }}>
              <p><strong>GPT Agent says:</strong> <span id="adviceText">Thinking...</span></p>
            </div>
          </div>

          <h3>User Feedback</h3>
          <ul id="feedbacks"></ul>
        </section>

        <section className="tools">
          <h2><i className="fas fa-chart-line"></i> Activity Overview</h2>
          <canvas id="activityChart" height="100"></canvas>
        </section>

        <section className="tools">
          <h2><i className="fas fa-tools"></i> Quick Tools</h2>
          <div className="tool-grid">
            <div className="tool-card"><i className="fas fa-calculator"></i><p>Profit Calculator</p></div>
            <div className="tool-card"><i className="fas fa-brain"></i><p>Idea Generator</p></div>
            <div className="tool-card"><i className="fas fa-calendar-check"></i><p>Planner</p></div>
          </div>
        </section>
      </main>
    </div>
  );
}
