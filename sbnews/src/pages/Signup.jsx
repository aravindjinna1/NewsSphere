import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { COUNTRIES } from '../api/newsApi.js'
import { PASSWORD_HINT } from '../utils/passwordValidation.js'
import PasswordField from '../components/PasswordField.jsx'
import './Auth.css'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', country: 'us' })

  const handleSubmit = (e) => {
    e.preventDefault()
    const ok = signup(form)
    if (ok) navigate('/')
  }

  return (
    <div className="container auth-page">
      <form className="auth-card glass-panel" onSubmit={handleSubmit}>
        <span className="mono-tag">Create account</span>
        <h1>Join SB News</h1>
        <p className="auth-sub">Set a home country for your default headlines — you can change it anytime.</p>

        <label>Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ada Lovelace" />

        <label>Email</label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />

        <label>Password</label>
        <PasswordField
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <p className="auth-hint">{PASSWORD_HINT}</p>

        <label>Home country</label>
        <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.label}</option>)}
        </select>

        <button className="cta-btn full" type="submit">Create account</button>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  )
}
