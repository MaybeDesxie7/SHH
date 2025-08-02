'use client';

import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '@/styles/style.css'; 

export default function HomePage() {
  const [navVisible, setNavVisible] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setReviewSubmitted(true);
    e.target.reset();
  };

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing!');
    e.target.reset();
  };

  return (
    <>
      <head>
        <title>Glimo | All-in-One Hustle Platform for Modern Entrepreneurs</title>
        <meta name="description" content="Glimo empowers digital hustlers with trending online income ideas, AI tools, and growth strategies to make money online in 2025." />
        <meta name="keywords" content="Glimo, online hustle, make money online, digital tools, side hustle 2025, passive income, AI hustle, freelance, entrepreneurship, online business, Glimo tools" />
      </head>

      <header id="header">
        <div className="logo">
          <img src="/logo.png" alt="Glimo Logo" className="logo-image" />
        </div>

        <nav id="nav-bar">
          <ul className={`nav-links ${navVisible ? 'show' : ''}`}>
            <li><a href="#home">Home</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="/dashboard/help_center">Help Center</a></li>
          </ul>
          <div className="menu-toggle" id="menu-toggle" onClick={() => setNavVisible(!navVisible)}>
            <i className="fas fa-bars"></i>
          </div>
        </nav>
      </header>

      <section id="home">
        <video autoPlay muted loop className="background-video">
          <source src="/videos/mixkit-a-bunch-of-dollar-bills-background-47517-hd-ready.mp4" type="video/mp4" />
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
            ['fa-brands fa-fiverr', 'Fiverr'],
            ['fa-solid fa-lightbulb', 'Notion'],
            ['fa-brands fa-google', 'Google Docs'],
            ['fa-brands fa-youtube', 'YouTube Studio'],
            ['fa-solid fa-comments', 'ChatGPT'],
            ['fa-solid fa-chart-line', 'Semrush'],
            ['fa-solid fa-laptop-code', 'CodePen'],
          ].map(([icon, text], idx) => (
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
          {[ 
            ['How to Start Affiliate Marketing in 2025', 'Learn step-by-step how to set up your affiliate empire from scratch using modern tools.'],
            ['Top Freelance Skills to Learn Now', 'These skills are in demand and can earn you clients globally with zero upfront cost.'],
            ['Best Tools for Content Creation', 'Use these powerful free and paid tools to supercharge your content game.'],
          ].map(([title, desc], idx) => (
            <article className="blog-post" key={idx}>
              <h3>{title}</h3>
              <p>{desc}</p>
              <a href="/blog" className="read-more">Read More <i className="fas fa-arrow-right"></i></a>
            </article>
          ))}
        </div>
      </section>

      <section id="testimonials">
        <h2 data-aos="fade-up">💬 What Hustlers Are Saying</h2>
        <div className="testimonial-wrapper" data-aos="fade-up" data-aos-delay="100">
          <div className="testimonial-track">
            {[ 
              'This hub changed my life! I started freelancing and doubled my income in 3 months.',
              'The tools here are gold. Everything from setup to earning was made simple!',
              'Great platform for discovering side hustles. Clean, motivating, and actionable.',
              'I never thought making money online could be this fun. Thanks to this site!',
            ].map((quote, idx) => (
              <div className="review-box" key={idx}>
                <p className="stars">★★★★★</p>
                <p>"{quote}"</p>
                <p><strong>- Hustler #{idx + 1}</strong></p>
              </div>
            ))}
          </div>
        </div>

        <div className="leave-review" data-aos="fade-up">
          <h3>Leave a Review</h3>
          <form onSubmit={handleReviewSubmit}>
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="text" name="stars" placeholder="Rating (1-5)" required />
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
            <h4>Explore</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#hustles">Courses</a></li>
              <li><a href="#tools">Tools</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a href="/dashboard/help_center">Help Center</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Use</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Join the Hustlers</h4>
            <p>Subscribe to our newsletter for weekly tips & tools.</p>
            <form className="subscribe-form" onSubmit={handleSubscribeSubmit}>
              <input type="email" placeholder="Your Email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Glimo. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}
