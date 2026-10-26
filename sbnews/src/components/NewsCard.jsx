import React from 'react'
import { IoBookmark, IoBookmarkOutline } from 'react-icons/io5'
import { getCategoryColor } from '../utils/categoryColors.js'
import { useFavorites } from '../context/FavoritesContext.jsx'
import './NewsCard.css'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=60'

const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NewsCard({ article, featured = false, category = null }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  if (!article) return null
  const { title, description, urlToImage, url, source, publishedAt } = article
  const accent = getCategoryColor(category || article.category)
  const saved = isFavorite(article);

  const handleSaveClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(article)
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`news-card glass-panel ${featured ? 'featured' : ''}`}
      style={{ '--card-accent': accent }}
    >
      <div className="news-card-media">
        <img src={urlToImage || FALLBACK_IMG} alt="" loading="lazy" onError={(e) => { e.currentTarget.src = FALLBACK_IMG }} />
        {source?.name && <span className="news-card-source mono-tag">{source.name}</span>}
        <button
          type="button"
          className={`news-card-save ${saved ? 'active' : ''}`}
          onClick={handleSaveClick}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
          title={saved ? 'Remove from favorites' : 'Save to favorites'}
        >
          {saved ? <IoBookmark /> : <IoBookmarkOutline />}
        </button>
      </div>
      <div className="news-card-body">
        <h3>{title}</h3>
        {featured && description && <p className="news-card-desc">{description}</p>}
        <span className="news-card-time mono-tag">{timeAgo(publishedAt)}</span>
      </div>
    </a>
  )
}
