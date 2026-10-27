import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useFavorites } from '../context/FavoritesContext.jsx'
import './Profile.css'

const formatJoined = (isoDate) => {
  if (!isoDate) return '—'
  return new Date(isoDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { favorites } = useFavorites()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user.name,
    username: user.username || user.email?.split('@')[0] || '',
    photo: user.photo || ''
  })

  const startEditing = () => {
    setForm({ name: user.name, username: user.username || '', photo: user.photo || '' })
    setEditing(true)
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, photo: reader.result }))
    reader.readAsDataURL(file)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (await updateProfile({ name: form.name, username: form.username, photo: form.photo })) setEditing(false)
  }

  return (
    <div className="container profile-page">
      <h1>Profile</h1>
      <p className="profile-sub">Your account at a glance.</p>

      <div className="profile-grid">
        <section className="glass-panel profile-card">
          <div className="profile-avatar-row">
            {user.photo ? (
              <span className="avatar big">
                <img src={user.photo} alt="" className="avatar-photo" />
              </span>
            ) : (
              <span className="avatar big">{user.avatar}</span>
            )}
            <div>
              <strong>{user.name}</strong>
              <p className="mono-tag">@{user.username || user.email?.split('@')[0]}</p>
            </div>
          </div>

          {!editing ? (
            <>
              <p className="profile-hint">Email</p>
              <p>{user.email}</p>

              <p className="profile-hint">Joined</p>
              <p>{formatJoined(user.joinedAt)}</p>

              <p className="profile-hint">Favorite articles</p>
              <p>{favorites.length}</p>

              <button className="cta-btn" onClick={startEditing}>Edit Profile</button>
            </>
          ) : (
            <form onSubmit={saveEdit} className="profile-form">
              <label>Profile photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />

              <label>Full name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <label>Username</label>
              <input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />

              <label>Email</label>
              <input value={user.email} disabled />

              <button className="cta-btn" type="submit">Save changes</button>
              <button className="text-btn" type="button" onClick={() => setEditing(false)}>Cancel</button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
