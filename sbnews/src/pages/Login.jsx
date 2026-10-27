import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../context/AuthContext.jsx'
import PasswordField from '../components/PasswordField.jsx'
import './Auth.css'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const destination = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try { if (await login(form)) navigate(destination) } finally { setBusy(false) }
  }
  const handleGoogle = async () => {
    setBusy(true)
    try { if (await loginWithGoogle()) navigate(destination) } finally { setBusy(false) }
  }

  return (
    <div className="container auth-page">
      <form className="auth-card glass-panel" onSubmit={handleSubmit}>
        <span className="mono-tag">Sign in</span>
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to follow the stories that matter to you.</p>
        <button className="google-btn" type="button" onClick={handleGoogle} disabled={busy}><FcGoogle aria-hidden="true" /> Continue with Google</button>
        <div className="auth-divider"><span>or continue with email</span></div>
        <label>Email</label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
        <label>Password</label>
        <PasswordField required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" autoComplete="current-password" />
        <button className="cta-btn full" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="auth-switch">New here? <Link to="/signup">Create an account</Link></p>
      </form>
    </div>
  )
}
