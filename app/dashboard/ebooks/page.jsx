'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function EbooksPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ebooks, setEbooks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const itemsPerPage = 4;

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return router.push('/login');
      setUser(data.user);
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user) fetchEbooks();
  }, [user]);

  const fetchEbooks = async () => {
    const { data, error } = await supabase.from('ebooks').select('*');
    if (!error) setEbooks(data);
  };

  const filteredEbooks = ebooks.filter((book) =>
    filter === 'all' ? true : book.tags.includes(filter)
  );

  const sortedEbooks = [...filteredEbooks].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'popularity') return b.popularity - a.popularity;
    return 0;
  });

  const paginatedEbooks = sortedEbooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const topEbook = [...ebooks].sort((a, b) => b.rating - a.rating)[0];

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li><a href="/dashboard" onClick={handleNavClick}><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile" onClick={handleNavClick}><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/hustlestreet" onClick={handleNavClick}><i className="fas fa-briefcase"></i> Hustle Street</a></li>
            <li><a href="/dashboard/messages" onClick={handleNavClick}><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools" onClick={handleNavClick}><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks" className="active" onClick={handleNavClick}><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/tutorials" onClick={handleNavClick}><i className="fas fa-video"></i> Tutorials</a></li>
            <li><a href="/dashboard/offers" onClick={handleNavClick}><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/help_center" onClick={handleNavClick}><i className="fas fa-question-circle"></i> Help Center</a></li>
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
            <span>Ebooks</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
            <button id="toggleMenuBtn" title="Toggle Menu" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>

        <div className="ebook-filter">
          <label htmlFor="ebookFilter">Filter by category:</label>
          <select id="ebookFilter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="freelancing">Freelancing</option>
            <option value="marketing">Marketing</option>
            <option value="productivity">Productivity</option>
            <option value="ai">AI</option>
          </select>

          <label htmlFor="sortOptions">Sort by:</label>
          <select id="sortOptions" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Default</option>
            <option value="rating">Highest Rated</option>
            <option value="popularity">Most Popular</option>
          </select>

          <button onClick={() => alert(`We recommend: "${topEbook?.title}"`)}>
            <i className="fas fa-magic"></i> Suggest an Ebook
          </button>
        </div>

        <div className="ebooks-grid">
          {paginatedEbooks.map((book, i) => (
            <div className="ebook-card" key={i}>
              <h3>{book.title}</h3>
              <p>{book.preview}</p>
              <div className="ebook-tags">
                {book.tags.map((tag, idx) => (
                  <span className="ebook-tag" key={idx}>{tag}</span>
                ))}
              </div>
              <div className="rating">⭐ {book.rating}</div>
              <div className="popularity">🔥 {book.popularity}%</div>
              <a href={book.link} target="_blank" rel="noopener noreferrer">
                {book.is_paid ? 'Purchase' : 'Download'}
              </a>
            </div>
          ))}
        </div>

        <div className="ebook-filter" style={{ justifyContent: 'center' }}>
          {Array.from({ length: Math.ceil(sortedEbooks.length / itemsPerPage) }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
