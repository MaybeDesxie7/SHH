'use client';

import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import './admin.css'; // ✅ Corrected import

export default function AdminOverview() {
  const [liveUsers, setLiveUsers] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [aiInsight, setAiInsight] = useState('Fetching AI insight...');
  const [recentTools, setRecentTools] = useState([]);
  const [recentServices, setRecentServices] = useState([]);
  const [userGrowthChart, setUserGrowthChart] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: users, error: userError } = await supabase.from('profiles').select('*');
      const { data: services, error: serviceError } = await supabase.from('services').select('*');
      const { data: tools } = await supabase.from('tools').select('*');

      if (!userError && users) {
        setLiveUsers(users.length);
        const mockUserData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [{
            label: 'New Users',
            data: [50, 90, 150, 200, 300, 400, users.length],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            tension: 0.4,
          }]
        };
        setUserGrowthChart(mockUserData);
      }

      if (!serviceError && services) {
        const total = services.reduce((sum, s) => sum + (s.price || 0), 0);
        setEarnings(total);
        setRecentServices(services.slice(-5).map(s => s.title));
      }

      if (tools) {
        setRecentTools(tools.slice(-5).map(t => t.name));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const res = await fetch('/api/ai');
        const json = await res.json();
        if (json.insight) setAiInsight(json.insight);
      } catch (err) {
        setAiInsight('Unable to fetch AI insight. Using placeholder.');
      }
    };
    fetchAI();
  }, []);

  const handleExport = async () => {
    const { data: users } = await supabase.from('profiles').select('*');
    const csv = Papa.unparse(users);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'users_report.csv');
  };

  const earningsChart = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Earnings ($)',
      data: [120, 250, 400, 480, 600, 710, earnings || 980],
      backgroundColor: '#2196F3'
    }]
  };

  return (
    <div className="admin-dashboard">
      <h1 className="admin-heading">📊 Admin Overview</h1>

      <section className="admin-grid">
        <div className="admin-card">
          <h3>📈 User Growth</h3>
          {userGrowthChart && <Line data={userGrowthChart} />}
        </div>

        <div className="admin-card">
          <h3>💵 Earnings Overview</h3>
          <Bar data={earningsChart} />
        </div>

        <div className="admin-card">
          <h3>🟢 Live Users</h3>
          <p className="big-number">{liveUsers}</p>
        </div>

        <div className="admin-card">
          <h3>🧠 AI Insight</h3>
          <p>{aiInsight}</p>
        </div>

        <div className="admin-card">
          <h3>🛠️ Recent Tools</h3>
          <ul>
            {recentTools.length === 0 ? <li>No tools yet</li> : recentTools.map((tool, i) => <li key={i}>{tool}</li>)}
          </ul>
        </div>

        <div className="admin-card">
          <h3>📦 Recent Services</h3>
          <ul>
            {recentServices.length === 0 ? <li>No services yet</li> : recentServices.map((srv, i) => <li key={i}>{srv}</li>)}
          </ul>
        </div>

        <div className="admin-card">
          <h3>📬 Support Inbox</h3>
          <ul>
            <li>John D: “I can't access ebooks”</li>
            <li>Sue N: “Pricing question on tools”</li>
            <li>Mark Z: “Profile won’t upload”</li>
          </ul>
        </div>

        <div className="admin-card">
          <h3>🧾 Activity Logs</h3>
          <ul>
            <li>[+] Signup: alice@site.com</li>
            <li>[x] Deleted tool: OldSurveyTool</li>
            <li>[✓] Payment: $29.99</li>
          </ul>
        </div>

        <div className="admin-card">
          <h3>🛠️ Admin Actions</h3>
          <button className="admin-btn">Trigger Email Blast</button>
          <button className="admin-btn">Update AI Model</button>
          <button className="admin-btn" onClick={handleExport}>📤 Export Users CSV</button>
        </div>
      </section>
    </div>
  );
}
