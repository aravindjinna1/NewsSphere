import React from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext.jsx'
import NewsCard from '../components/NewsCard.jsx'
import './Favorites.css'

export default function Favorites() {
  const { favorites } = useFavorites()

  return (
    <div className="container favorites-page">
      <div className="favorites-header">
        <span className="mono-tag">Your library</span>
        <h1>Favorites</h1>
        <p className="favorites-sub">
          {favorites.length
            ? `${favorites.length} saved ${favorites.length === 1 ? 'story' : 'stories'}.`
            : 'Stories you save show up here.'}
        </p>
      </div>

      {favorites.length === 0 ? (
        <p className="empty-state">
          No favorites yet. Tap the bookmark icon on any story to save it for later — try{' '}
          <Link to="/">the latest headlines</Link>.
        </p>
      ) : (
        <div className="favorites-grid">
          {favorites.map((a, i) => <NewsCard key={a.url || i} article={a} />)}
        </div>
      )}
    </div>
  )
}
