import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PasswordField from '../components/PasswordField.jsx'
import './Auth.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    const ok = login(form)
    if (ok) navigate(location.state?.from?.pathname || '/')
  }

  return (
    <div className="container auth-page">
      <form className="auth-card glass-panel" onSubmit={handleSubmit}>
        <span className="mono-tag">Sign in</span>
        <h1>Welcome back</h1>
        <p className="auth-sub">This is a front-end demo account — it lives only in your browser.</p>

        <label>Email</label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />

        <label>Password</label>
        <PasswordField
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <button className="cta-btn full" type="submit">Sign in</button>

        <p className="auth-switch">New here? <Link to="/signup">Create an account</Link></p>
      </form>
    </div>
  )
}
