import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useNews } from '../context/NewsContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { useSubscriptions } from '../context/SubscriptionsContext.jsx'
import { COUNTRIES, CATEGORIES } from '../api/newsApi.js'
import { IoSunny, IoMoon } from 'react-icons/io5'
import { validatePassword, PASSWORD_HINT } from '../utils/passwordValidation.js'
import PasswordField from '../components/PasswordField.jsx'
import pkg from '../../package.json'
import './Profile.css'
import './Auth.css'

export default function Settings() {
  const { user, logout, changePassword } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { country, setCountry } = useNews()
  const { settings, updateSettings } = useSettings()
  const { subscriptions, toggleSubscription } = useSubscriptions()
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    const passwordError = validatePassword(pwForm.next)
    if (passwordError) {
      toast.error(passwordError)
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error('New passwords do not match.')
      return
    }
    const ok = await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next })
    if (ok) setPwForm({ current: '', next: '', confirm: '' })
  }

  const handleCountryChange = (e) => {
    setCountry(e.target.value)
    toast.success('Settings saved.')
  }

  return (
    <div className="container profile-page">
      <h1>Settings</h1>
      <p className="profile-sub">Manage your account, appearance and preferences.</p>

      <div className="profile-grid">
        <section className="glass-panel profile-card">
          <h3>Account</h3>
          <p className="profile-hint">Signed in as {user?.email}.</p>

          {user?.provider === 'password' ? <form onSubmit={handlePasswordSubmit} className="profile-form">
            <label>Current password</label>
            <PasswordField
              required
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              autoComplete="current-password"
            />

            <label>New password</label>
            <PasswordField
              required
              minLength={8}
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
              autoComplete="new-password"
            />
            <p className="auth-hint">{PASSWORD_HINT}</p>

            <label>Confirm new password</label>
            <PasswordField
              required
              minLength={8}
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              autoComplete="new-password"
            />

            <button className="cta-btn" type="submit">Change password</button>
          </form> : <p className="profile-hint">Your account uses Google sign-in to manage your password.</p>}

          <button className="danger-btn" onClick={logout}>Logout</button>
        </section>

        <section className="glass-panel profile-card">
          <h3>Appearance</h3>
          <p className="profile-hint">Dark mode uses a glass finish; light mode uses a soft embossed finish.</p>
          <button className="theme-switch-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <IoMoon /> : <IoSunny />}
            Switch to {theme === 'dark' ? 'light' : 'dark'} mode
          </button>
        </section>

        <section className="glass-panel profile-card">
          <h3>Notifications</h3>
          <p>
            <label>
              <input
                type="checkbox"
                checked={settings.breakingNews}
                onChange={(e) => updateSettings({ breakingNews: e.target.checked })}
              />{' '}
              Breaking news notifications
            </label>
          </p>
          <p>
            <label>
              <input
                type="checkbox"
                checked={settings.dailyDigest}
                onChange={(e) => updateSettings({ dailyDigest: e.target.checked })}
              />{' '}
              Daily news digest
            </label>
          </p>
        </section>

        <section className="glass-panel profile-card">
          <h3>Preferences</h3>
          <p className="profile-hint">Default country</p>
          <select value={country} onChange={handleCountryChange}>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.label}</option>)}
          </select>

          <p className="profile-hint">Preferred category</p>
          <select
            value={settings.preferredCategory}
            onChange={(e) => updateSettings({ preferredCategory: e.target.value })}
          >
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </section>

        <section className="glass-panel profile-card">
          <h3>Subscriptions</h3>
          <p className="profile-hint">
            Categories you've subscribed to — tap a topic on its category page, or remove one here.
          </p>
          {subscriptions.length === 0 ? (
            <p className="profile-hint">You haven't subscribed to any topics yet.</p>
          ) : (
            <div className="subscription-chips">
              {subscriptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="subscription-chip"
                  onClick={() => toggleSubscription(cat)}
                  title={`Unsubscribe from ${cat}`}
                >
                  {cat} <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="glass-panel profile-card">
          <h3>About</h3>
          <p className="profile-hint">App version {pkg.version}</p>
          <details>
            <summary>Privacy Policy</summary>
            <p className="profile-hint">
               News Sphere is a front-end demo. Account, favorites and settings data stay in your
              browser's local storage and are never sent to a server.
            </p>
          </details>
          <details>
            <summary>Terms &amp; Conditions</summary>
            <p className="profile-hint">
              This demo is provided as-is for evaluation purposes, with headlines sourced from a
              third-party news API.
            </p>
          </details>
        </section>
      </div>
    </div>
  )
}
