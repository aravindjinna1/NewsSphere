import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { IoSearch, IoMenu, IoClose, IoSunny, IoMoon, IoChevronDown } from 'react-icons/io5'
import { CATEGORIES, COUNTRIES } from '../api/newsApi.js'
import { getCategoryColor } from '../utils/categoryColors.js'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNews } from '../context/NewsContext.jsx'
import Ticker from './Ticker.jsx'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const { country, setCountry } = useNews()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  // Keep the navbar search box in sync with the URL: if you land on
  // /search?q=... directly (a link, a refresh, the back button), show
  // that term in the box instead of leaving it blank/stale.
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search)
      setQuery(params.get('q') || '')
    } else {
      setQuery('')
    }
  }, [location.pathname, location.search])

  const submitSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setMenuOpen(false)
  }

  const clearSearch = () => {
    setQuery('')
    navigate('/')
    setMenuOpen(false)
  }

  // NavLink's className callback gets { isActive } from React Router and
  // automatically re-evaluates on every route change — no manual
  // useLocation matching needed.
  const navLinkClass = ({ isActive }) => (isActive ? 'active' : '')

  return (
    <header className="nav-wrap glass-panel">
      <div className="nav-top container">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="" />
          <span className="">SB<em>News</em></span>
        </Link>

        <form className="nav-search" onSubmit={submitSearch}>
          <IoSearch className="nav-search-icon" />
          <input
            type="text" className='input-box'
            placeholder="Search headlines, topics, people…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search news"
          />
          {query && (
            <button
              type="button"
              className="clear-search"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <IoClose />
            </button>
          )}
        </form>

        <div className="nav-actions">
          <div className="country-select-wrap">
            <select
              className="country-select mono-tag"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              aria-label="Select country"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
              ))}
            </select>
            <IoChevronDown className="country-select-chevron" />
          </div>

          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <IoSunny /> : <IoMoon />}
          </button>

          {isAuthenticated ? (
            <div className="nav-user">
              <NavLink
                to="/favorites"
                className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              >
                Favorites
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              >
                Settings
              </NavLink>
              <NavLink to="/profile" className="profile-link">
                {({ isActive }) => (
                  <>
                    {user.photo ? (
                      <span className={`avatar ${isActive ? 'active' : ''}`}>
                        <img src={user.photo} alt="" className="avatar-photo" />
                      </span>
                    ) : (
                      <span className={`avatar ${isActive ? 'active' : ''}`}>{user.avatar}</span>
                    )}
                    <span className="profile-link-label">Profile</span>
                  </>
                )}
              </NavLink>
              <button className="nav-logout-btn" onClick={logout}>Sign out</button>
            </div>
          ) : (
            <NavLink to="/login" className="cta-btn">Sign in</NavLink>
          )}

          <button className="icon-btn mobile-only" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <IoClose /> : <IoMenu />}
          </button>
        </div>
      </div>

      <nav className={`nav-categories container ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>
          <span className="cat-dot live-cat-dot" />Latest
        </NavLink>
        {CATEGORIES.map((cat) => (
          <NavLink
            key={cat}
            to={`/category/${cat}`}
            className={navLinkClass}
            style={{ '--cat-accent': getCategoryColor(cat) }}
            onClick={() => setMenuOpen(false)}
          >
            <span className="cat-dot" style={{ background: getCategoryColor(cat) }} />
            {cat}
          </NavLink>
        ))}
        <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>
          <span className="cat-dot" style={{ background: 'var(--violet)' }} />Trends
        </NavLink>

        {isAuthenticated && (
          <div className="nav-user-mobile">
            <NavLink to="/favorites" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              <span className="cat-dot" style={{ background: 'var(--pink)' }} />Favorites
            </NavLink>
            <NavLink to="/settings" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              <span className="cat-dot" style={{ background: 'var(--sky)' }} />Settings
            </NavLink>
            <NavLink to="/profile" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              <span className="cat-dot" style={{ background: 'var(--amber)' }} />Profile
            </NavLink>
            <button
              type="button"
              className="mobile-signout-btn"
              onClick={() => { logout(); setMenuOpen(false) }}
            >
              <span className="cat-dot" style={{ background: 'var(--live)' }} />Sign out
            </button>
          </div>
        )}
      </nav>

      <Ticker />
    </header>
  )
}
