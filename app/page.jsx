'use client';

import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { supabase } from '@/lib/supabase';
import '@/styles/style.css';
import Head from 'next/head';

export default function HomePage() {
  const [navVisible, setNavVisible] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]); // <-- blog data

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/style.css';
    document.head.appendChild(link);

    AOS.init({ duration: 1200, once: true, easing: 'ease-in-out' });

    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    const track = document.querySelector('.testimonial-track');
    if (track) {
      track.addEventListener('mouseover', () => {
        track.style.animationPlayState = 'paused';
      });
      track.addEventListener('mouseout', () => {
        track.style.animationPlayState = 'running';
      });
    }

    const fetchBlogPosts = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, snippet, cover_image')
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error) setBlogPosts(data);
    };

    fetchBlogPosts();

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const stars = parseInt(form.stars.value);
    const comment = form.comment.value;

    setReviews(prev => [...prev, { id: Date.now(), name, stars, comment }]);
    setReviewSubmitted(true);
    form.reset();
  };

  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();
    if (!subscriberEmail) return;

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email: subscriberEmail }]);

    if (error) {
      setSubscribeMessage('Something went wrong or this email is already subscribed.');
    } else {
      setSubscribeMessage(`Thanks for subscribing, ${subscriberEmail}! 🎉`);
      setSubscriberEmail('');
    }
  };

  return (
    <>
      <Head>
        <title>Glimo | All-in-One Hustle Platform for Modern Entrepreneurs</title>
        <meta name="description" content="Glimo empowers digital hustlers with trending online income ideas, AI tools, and growth strategies to make money online in 2025." />
        <meta name="keywords" content="Glimo, online hustle, make money online, digital tools, side hustle 2025, passive income, AI hustle, freelance, entrepreneurship, online business, Glimo tools" />
      </Head>

      <header id="header">
        <div className="logo">
          <img src="/logo.png" alt="Glimo Logo" className="logo-image" />
        </div>

        <nav id="nav-bar">
          <ul className={`nav-links ${navVisible ? 'show' : ''}`}>
            <li><a href="#home">Home</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
          <div className="menu-toggle" id="menu-toggle" onClick={() => setNavVisible(!navVisible)}>
            <i className="fas fa-bars"></i>
          </div>
        </nav>
      </header>

      <section id="home">
        <video autoPlay muted loop className="background-video">
          <source src="/money.mp4" type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>

        <div className="hero-content" data-aos="fade-up">
          <h1>Welcome to Glimo</h1>
          <p>Your all-in-one platform to make money online with modern tools, trending ideas, and powerful resources.</p>
          <div className="auth-buttons">
            <a href="/login" className="btn login-btn">Login</a>
            <a href="/signup" className="btn signup-btn">Sign Up</a>
          </div>
        </div>
      </section>

      <section id="hustles">
        <h2 data-aos="fade-up">🚀 Trending Side Hustles</h2>
        <p data-aos="fade-up" data-aos-delay="100">Explore top-performing online income streams to start today.</p>
        <div className="hustle-grid" data-aos="zoom-in" data-aos-delay="200">
          {[
            ['fas fa-bullhorn', 'Affiliate Marketing'],
            ['fas fa-pen-nib', 'Freelancing'],
            ['fas fa-poll', 'Online Surveys'],
            ['fas fa-store', 'Dropshipping'],
            ['fas fa-blog', 'Blogging'],
            ['fas fa-tshirt', 'Print on Demand'],
            ['fas fa-robot', 'YouTube Automation'],
            ['fas fa-file-alt', 'Digital Products'],
            ['fas fa-share-alt', 'Social Media Management'],
            ['fas fa-chart-line', 'Digital Marketing'],
            ['fas fa-code', 'Developing'],
          ].map(([icon, text], idx) => (
            <div className="hustle-card" key={idx}>
              <i className={icon}></i>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="tools">
        <h2 data-aos="fade-down">Popular Tools</h2>
        <div className="tools-grid" data-aos="fade-right">
          {[
            ['fa-solid fa-pen-nib', 'Canva'],
            ['fa-brands fa-upwork', 'Upwork'],
            ['fa-solid fa-video', 'Pictory'],
            ['fa-solid fa-lightbulb', 'Notion'],
            ['fa-brands fa-google', 'Google Docs'],
            ['fa-brands fa-youtube', 'YouTube Studio'],
            ['fa-solid fa-comments', 'ChatGPT'],
            ['fa-solid fa-chart-line', 'Semrush'],
            ['fa-solid fa-laptop-code', 'CodePen'],
          ].map(([icon, text, link], idx) => (
            <div className="tool-card" key={idx}>
              <i className={icon}></i>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="blog">
        <h2 data-aos="fade-up">📝 Latest Blog Posts</h2>
        <p data-aos="fade-up" data-aos-delay="100">Stay informed with tips and guides from the digital world.</p>
        <div className="blog-grid" data-aos="fade-left" data-aos-delay="200">
          {blogPosts.map((post) => (
            <article className="blog-post" key={post.id}>
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="blog-thumbnail" />
              )}
              <h3>{post.title}</h3>
              <p>{post.snippet}</p>
              <a href={`/blog/${post.slug}`} className="read-more">Read More <i className="fas fa-arrow-right"></i></a>
            </article>
          ))}
        </div>
      </section>

      <section id="testimonials">
        <h2 data-aos="fade-up">💬 What Hustlers Are Saying</h2>
        <div className="testimonial-wrapper" data-aos="fade-up" data-aos-delay="100">
          <div className="testimonial-track">
            {reviews.map((review) => (
              <div className="review-box" key={review.id}>
                <p className="stars">
                  {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                </p>
                <p>"{review.comment}"</p>
                <p><strong>- {review.name}</strong></p>
              </div>
            ))}
          </div>
        </div>

        <div className="leave-review" data-aos="fade-up">
          <h3>Leave a Review</h3>
          <form onSubmit={handleReviewSubmit}>
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="number" name="stars" placeholder="Rating (1-5)" min="1" max="5" required />
            <textarea name="comment" placeholder="Write your review..." required></textarea>
            <button type="submit">Submit Review</button>
          </form>
          {reviewSubmitted && (
            <p id="reviewMessage">Thanks for your review! 🎉</p>
          )}
        </div>
      </section>

      <footer id="footer" data-aos="fade-up">
        <div className="footer-container">
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-of-use">Terms of Use</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Join the Hustlers</h4>
            <p>Subscribe to our newsletter for weekly tips & tools.</p>
            <form className="subscribe-form" onSubmit={handleSubscribeSubmit}>
              <input
                type="email"
                placeholder="Your Email"
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </form>
            {subscribeMessage && (
              <p id="subscribeMessage">{subscribeMessage}</p>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Glimo. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}
