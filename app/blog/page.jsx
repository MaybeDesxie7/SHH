'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '@/styles/style.css';
import Link from 'next/link';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('blog_posts') // assume this is your Supabase table
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

  return (
    <div className="blog-container">
      <header className="blog-header">
        <h1>Glimo Blog</h1>
        <p>Latest updates, tips, and insights from the Glimo team.</p>
      </header>

      {loading ? (
        <p className="blog-loading">Loading the latest gems...</p>
      ) : (
        <div className="blog-posts">
          {posts.length === 0 ? (
            <p>No blog posts yet. Stay tuned!</p>
          ) : (
            posts.map((post) => (
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
      )}
    </div>
  );
}
