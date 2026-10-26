import React from 'react'
import { Link } from 'react-router-dom'
import { useNews } from '../context/NewsContext.jsx'
import NewsCard from '../components/NewsCard.jsx'
import SkeletonCard from '../components/SkeletonCard.jsx'
import CategoryPreview from '../components/CategoryPreview.jsx'
import { CATEGORIES, COUNTRIES } from '../api/newsApi.js'
import { getCategoryColor } from '../utils/categoryColors.js'
import './Home.css'

export default function Home() {
  const { headlines, loading, error, country } = useNews()
  const countryLabel = COUNTRIES.find((c) => c.code === country)?.label || country
  const [hero, ...rest] = headlines

  return (
    <div className="home-page">
      <section className="container hero-section">
        <div className="color-blobs" />
        <div className="hero-heading">
          <span className="mono-tag">Latest &middot; {countryLabel}</span>
          <h1>What's <span className="gradient-text">moving the world</span> right now.</h1>
        </div>

        {error && <p className="error-banner">{error}</p>}

        <div className="hero-grid">
          {loading ? (
            <>
              <SkeletonCard featured />
              <div className="hero-side">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </>
          ) : (
            <>
              <NewsCard article={hero} featured />
              <div className="hero-side">
                {rest.slice(0, 2).map((a, i) => <NewsCard key={i} article={a} />)}
              </div>
            </>
          )}
        </div>

        <div className="headline-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : rest.slice(2, 8).map((a, i) => <NewsCard key={i} article={a} />)}
        </div>
      </section>

      {CATEGORIES.filter((c) => c !== 'general').slice(0, 3).map((cat) => (
        <CategoryPreview key={cat} category={cat} />
      ))}

      <section className="container explore-more">
        <h2>Browse every category</h2>
        <div className="explore-pills">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/category/${cat}`}
              className="explore-pill"
              style={{ '--pill-accent': getCategoryColor(cat) }}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
