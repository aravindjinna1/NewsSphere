import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CATEGORIES } from '../api/newsApi.js'
import './Footer.css'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    toast.success("Subscribed! You'll get top stories in your inbox.")
    setEmail('')
  }

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand-text footer-brand">SB<em>News</em></div>
          <p className="footer-tagline">Signal in the noise — live headlines, sorted by what matters.</p>
          <p className="footer-subscribe-label">Get our daily email newsletter of top stories:</p>
          <form className="footer-subscribe" onSubmit={handleSubscribe}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
            />
            <button className="cta-btn" type="submit">Subscribe</button>
          </form>
        </div>

        <div>
          <h4 className="mono-tag">Categories</h4>
          <ul>
            {CATEGORIES.map((cat) => (
              <li key={cat}><Link to={`/category/${cat}`}>{cat}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mono-tag">Product</h4>
          <ul>
            <li><Link to="/dashboard">Trends dashboard</Link></li>
            <li><Link to="/search">Search</Link></li>
            <li><Link to="/favorites">Your favorites</Link></li>
            <li><Link to="/profile">Your profile</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>SB News — built with React + Vite. Headlines via NewsAPI.</p>
        <p>&copy; {new Date().getFullYear()} SB News. All rights reserved.</p>
      </div>
    </footer>
  )
}
