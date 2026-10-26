import React, { createContext, useContext, useState } from 'react'
import { toast } from 'react-toastify'
import { validatePassword } from '../utils/passwordValidation.js'

const AuthContext = createContext()

// NOTE: This is a front-end-only demo auth flow (no backend / no server
// verification). It persists a small user table in localStorage so the
// Login / Signup / Profile / Settings pages have something real to work
// against. Swap this out for a real auth API when one is available.

const readUsers = () => JSON.parse(localStorage.getItem('sbnews-users') || '[]')
const writeUsers = (users) => localStorage.setItem('sbnews-users', JSON.stringify(users))

// Derives a simple @username from the display name (falling back to the
// email) since the signup form only collects a name — keeps the existing
// signup UI untouched while still giving Profile a username to show/edit.
const deriveUsername = (name, email) => {
  const base = (name || email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '')
  return base || 'user'
}

// Only the fields that are safe to keep in the active session / shown in
// the UI — never persists the password into `sbnews-session`.
const publicFields = (u) => ({
  name: u.name,
  email: u.email,
  country: u.country,
  avatar: u.avatar,
  username: u.username || deriveUsername(u.name, u.email),
  photo: u.photo || null,
  joinedAt: u.joinedAt || null
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sbnews-session')
    return saved ? JSON.parse(saved) : null
  })

  const persistSession = (u) => {
    setUser(u)
    if (u) localStorage.setItem('sbnews-session', JSON.stringify(u))
    else localStorage.removeItem('sbnews-session')
  }

  const signup = ({ name, email, password, country }) => {
    const passwordError = validatePassword(password)
    if (passwordError) {
      toast.error(passwordError)
      return false
    }
    const users = readUsers()
    if (users.some((u) => u.email === email)) {
      toast.error('An account with that email already exists.')
      return false
    }
    const newUser = {
      name,
      email,
      password,
      country: country || 'us',
      avatar: name?.[0]?.toUpperCase() || 'U',
      username: deriveUsername(name, email),
      photo: null,
      joinedAt: new Date().toISOString()
    }
    writeUsers([...users, newUser])
    persistSession(publicFields(newUser))
    toast.success('Account created successfully!')
    return true
  }

  const login = ({ email, password }) => {
    const users = readUsers()
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) {
      toast.error('Invalid email or password.')
      return false
    }
    persistSession(publicFields(found))
    toast.success('Welcome back!')
    return true
  }

  const logout = () => {
    persistSession(null)
    toast.info('Logged out successfully.')
  }

  // updates can include name, username, photo (avatar image as a data URL)
  const updateProfile = (updates) => {
    const users = readUsers()
    const idx = users.findIndex((u) => u.email === user.email)
    const merged = { ...user, ...updates }
    if (idx > -1) {
      users[idx] = { ...users[idx], ...updates }
      writeUsers(users)
    }
    persistSession(merged)
    toast.success('Profile updated successfully.')
  }

  const changePassword = ({ currentPassword, newPassword }) => {
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      toast.error(passwordError)
      return false
    }
    const users = readUsers()
    const idx = users.findIndex((u) => u.email === user?.email)
    if (idx === -1 || users[idx].password !== currentPassword) {
      toast.error('Current password is incorrect.')
      return false
    }
    users[idx] = { ...users[idx], password: newPassword }
    writeUsers(users)
    toast.success('Password updated successfully.')
    return true
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateProfile, changePassword, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
