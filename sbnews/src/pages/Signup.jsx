import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../context/AuthContext.jsx'
import { COUNTRIES } from '../api/newsApi.js'
import { PASSWORD_HINT } from '../utils/passwordValidation.js'
import PasswordField from '../components/PasswordField.jsx'
import './Auth.css'

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', country: 'us' })
  const [busy, setBusy] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try { if (await signup(form)) navigate('/') } finally { setBusy(false) }
  }
  const handleGoogle = async () => {
    setBusy(true)
    try { if (await loginWithGoogle()) navigate('/') } finally { setBusy(false) }
  }

  return (
    <div className="container auth-page">
      <form className="auth-card glass-panel" onSubmit={handleSubmit}>
        <span className="mono-tag">Create account</span>
        <h1>Join News Sphere</h1>
        <p className="auth-sub">Create your account and make your news feed your own.</p>
        <button className="google-btn" type="button" onClick={handleGoogle} disabled={busy}><FcGoogle aria-hidden="true" /> Sign up with Google</button>
        <div className="auth-divider"><span>or sign up with email</span></div>
        <label>Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ada Lovelace" autoComplete="name" />
        <label>Email</label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
        <label>Password</label>
        <PasswordField required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" autoComplete="new-password" />
        <p className="auth-hint">{PASSWORD_HINT}</p>
        <label>Home country</label>
        <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.label}</option>)}
        </select>
        <button className="cta-btn full" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  )
}
