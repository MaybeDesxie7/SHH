"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [language, setLanguage] = useState("en");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateMedia = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

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
    alert(
      "Password change functionality should be implemented with Supabase Functions or secure backend"
    );
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm(
      "⚠️ Are you sure you want to delete your account? This cannot be undone."
    );
    if (confirmDelete) {
      alert(
        "To fully implement this, use Supabase admin delete function via secure API route"
      );
    }
  };

  // Close sidebar on mobile navigation
  function handleNavClick() {
    if (!isDesktop) setSidebarOpen(false);
  }

  return (
    <div className="dashboard">
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
              <a href="/dashboard/offers" onClick={handleNavClick}>
                <i className="fas fa-tags"></i> Offers
              </a>
            </li>
            <li>
              <a href="/dashboard/help_center" onClick={handleNavClick}>
                <i className="fas fa-question-circle"></i> Help Center
              </a>
            </li>

            {/* Premium Link - Highlighted */}
            <li
              style={{
                background: "linear-gradient(90deg, #FFD700, #FFA500)",
                borderRadius: "8px",
                margin: "10px 0",
              }}
            >
              <a
                href="/dashboard/Premium"
                onClick={handleNavClick}
                style={{ color: "#fff", fontWeight: "bold" }}
              >
                <i className="fas fa-crown"></i> Go Premium
              </a>
            </li>

            <li>
              <a href="/dashboard/settings" className="active" onClick={handleNavClick}>
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
            <span>Settings</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button onClick={() => setDarkMode(!darkMode)}>
              <i className="fas fa-adjust"></i>
            </button>
            <button
              id="toggleMenuBtn"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <i className="fas fa-bars" />
            </button>
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
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
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
          <button className="save-btn" onClick={handlePasswordChange}>
            Change Password
          </button>

          <h2>Two-Factor Authentication</h2>
          <div className="setting-item">
            <p>
              For enhanced security, enable 2FA in your Supabase Auth settings
              using OTP via email or phone number.
            </p>
          </div>

          <h2>Danger Zone</h2>
          <button className="delete-btn" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </section>
      </main>
    </div>
  );
}
