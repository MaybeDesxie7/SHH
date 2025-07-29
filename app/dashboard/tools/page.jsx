"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ToolsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tools, setTools] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const toolsPerPage = 10;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // ✅ Detect screen size and manage sidebar
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setSidebarOpen(isDesktop); // Always open on desktop
  }, [isDesktop]);

  // ✅ Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return router.push("/login");
      setUser(data.user);
    };
    fetchUser();
  }, [router]);

  // ✅ Fetch tools when user is set
  useEffect(() => {
    if (user) fetchTools();
  }, [user]);

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from("tools")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setTools(data);
  };

  // ✅ Filtering logic
  const filteredTools = tools.filter((tool) => {
    const matchesFilter = filter === "all" || tool.category === filter;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ✅ Pagination
  const indexOfLastTool = currentPage * toolsPerPage;
  const indexOfFirstTool = indexOfLastTool - toolsPerPage;
  const currentTools = filteredTools.slice(indexOfFirstTool, indexOfLastTool);
  const totalPages = Math.ceil(filteredTools.length / toolsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ✅ Close sidebar on nav click (mobile)
  function handleNavClick() {
    if (!isDesktop) setSidebarOpen(false);
  }

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      {/* Sidebar */}
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
              <a
                href="/dashboard/tools"
                className="active"
                onClick={handleNavClick}
              >
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

            {/* ✅ Animated Premium link */}
            <motion.li
              style={{
                background: "linear-gradient(90deg, #FFD700, #FFA500)",
                borderRadius: "8px",
                margin: "10px 0",
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [1, 0.9, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <a
                href="/dashboard/Premium"
                onClick={handleNavClick}
                style={{ color: "#fff", fontWeight: "bold" }}
              >
                <i className="fas fa-crown"></i> Go Premium
              </a>
            </motion.li>

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

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div className="user-info">
            <span>Tools</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button id="toggleModeBtn" title="Toggle Light/Dark Mode">
              <i className="fas fa-adjust"></i>
            </button>
            <button
              id="toggleMenuBtn"
              title="Toggle Menu"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>

        {/* Search & Filter */}
        <div className="tool-filter">
          <input
            type="text"
            placeholder="Search tools by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <label htmlFor="toolFilter">Filter by type:</label>
          <select
            id="toolFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="marketing">Marketing</option>
            <option value="design">Design</option>
            <option value="productivity">Productivity</option>
            <option value="ai">AI</option>
          </select>
        </div>

        {/* Tools List */}
        <div className="tools-container">
          {currentTools.map((tool, index) => (
            <div key={index} className="tool-card">
              <h3>{tool.name}</h3>
              <p>{tool.description}</p>
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="visit-btn"
              >
                Visit Tool
              </a>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          {[...Array(totalPages).keys()].map((number) => (
            <button
              key={number + 1}
              onClick={() => paginate(number + 1)}
              className={currentPage === number + 1 ? "active" : ""}
            >
              {number + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
