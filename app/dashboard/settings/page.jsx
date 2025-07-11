"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [language, setLanguage] = useState("en");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill out all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    alert("Password change functionality should be implemented with Supabase Functions or secure backend");
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm("⚠️ Are you sure you want to delete your account? This cannot be undone.");
    if (confirmDelete) {
      alert("To fully implement this, use Supabase admin delete function via secure API route");
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar" id="sidebar">
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li><Link href="/dashboard"><i className="fas fa-home"></i> Dashboard</Link></li>
            <li><Link href="/dashboard/profile"><i className="fas fa-user"></i> Profile</Link></li>
            <li><Link href="/dashboard/services"><i className="fas fa-briefcase"></i> My Services</Link></li>
            <li><Link href="/dashboard/messages"><i className="fas fa-envelope"></i> Messages</Link></li>
            <li><Link href="/dashboard/tools"><i className="fas fa-toolbox"></i> Tools</Link></li>
            <li><Link href="/dashboard/ebooks"><i className="fas fa-book"></i> Ebooks</Link></li>
            <li><Link href="/dashboard/tutorials"><i className="fas fa-video"></i> Tutorials</Link></li>
            <li><Link href="/dashboard/offers"><i className="fas fa-tags"></i> Offers</Link></li>
            <li><Link href="/dashboard/settings" className="active"><i className="fas fa-cog"></i> Settings</Link></li>
            <li><button onClick={handleLogout} style={{ color: '#ff4d4d', border: 'none', background: 'none' }}><i className="fas fa-sign-out-alt"></i> Logout</button></li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header>
          <div className="user-info">
            <span>Settings</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button onClick={() => setDarkMode(!darkMode)}><i className="fas fa-adjust"></i></button>
          </div>
        </header>

        <section className="settings-section">
          <h2>User Preferences</h2>

          <div className="setting-item">
            <label>Email Notifications</label>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
          </div>

          <div className="setting-item">
            <label>Preferred Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="es">Spanish</option>
            </select>
          </div>

          <h2>Change Password</h2>

          <div className="setting-item">
            <input
              type="password"
              value={currentPassword}
              placeholder="Current Password"
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="setting-item">
            <input
              type="password"
              value={newPassword}
              placeholder="New Password"
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="setting-item">
            <input
              type="password"
              value={confirmPassword}
              placeholder="Confirm New Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="save-btn" onClick={handlePasswordChange}>Change Password</button>

          <h2>Two-Factor Authentication</h2>
          <div className="setting-item">
            <p>For enhanced security, enable 2FA in your Supabase Auth settings using OTP via email or phone number.</p>
          </div>

          <h2>Danger Zone</h2>
          <button className="delete-btn" onClick={handleDeleteAccount}>Delete Account</button>
        </section>
      </main>
    </div>
  );
}
