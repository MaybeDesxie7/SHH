'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '@/styles/blog.css';
import Link from 'next/link';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data);
      }

      setLoading(false);
    }

    fetchPosts();
  }, []);

  const filteredPosts = posts
    .filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.snippet.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((post) =>
      filterType === 'All' ? true : post.type?.toLowerCase() === filterType.toLowerCase()
    );

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="blog-container dark-theme">
      <header className="blog-header">
        <h1>Glimo Blog</h1>
        <p>Latest updates, tips, and insights from the Glimo team.</p>

        <div className="blog-controls">
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={handleSearch}
          />

          <select value={filterType} onChange={handleFilterChange}>
            <option value="All">All</option>
            <option value="freelancing">Freelancing</option>
            <option value="social">Social Media</option>
            <option value="dropshipping">Dropshipping</option>
            <option value="marketing">Digital Marketing</option>
            <option value="dev">Developing</option>
          </select>
        </div>
      </header>

      {loading ? (
        <p className="blog-loading">Loading the latest gems...</p>
      ) : (
        <>
          <div className="blog-posts">
            {paginatedPosts.length === 0 ? (
              <p>No matching posts found.</p>
            ) : (
              paginatedPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                  <h2>{post.title}</h2>
                  <p className="blog-snippet">{post.snippet}</p>
                  <span className="blog-date">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </Link>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="blog-pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
