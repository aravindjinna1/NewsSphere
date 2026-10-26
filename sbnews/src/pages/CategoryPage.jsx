import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchByCategory, COUNTRIES } from '../api/newsApi.js'
import { useNews } from '../context/NewsContext.jsx'
import { useSubscriptions } from '../context/SubscriptionsContext.jsx'
import NewsCard from '../components/NewsCard.jsx'
import SkeletonCard from '../components/SkeletonCard.jsx'
import CursorPager from '../components/CursorPager.jsx'
import './CategoryPage.css'

const PAGE_SIZE = 10

export default function CategoryPage() {
  const { id } = useParams()
  const { country } = useNews()
  const { isSubscribed, toggleSubscription } = useSubscriptions()
  const subscribed = isSubscribed(id)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nextPage, setNextPage] = useState(null)
  // stack of tokens we've visited, so "Prev" can step back without
  // newsdata.io supporting arbitrary page jumps
  const [tokenStack, setTokenStack] = useState([null])
  const pageIndex = tokenStack.length - 1

  // reset to page 1 whenever the category or country changes
  useEffect(() => { setTokenStack([null]) }, [id, country])

  useEffect(() => {
    let active = true
    setLoading(true)
    const pageToken = tokenStack[pageIndex]
    fetchByCategory({ category: id, country, pageToken }).then((res) => {
      if (!active) return
      setArticles(res.articles)
      setNextPage(res.nextPage)
      setError(res.error)
      setLoading(false)
    })
    return () => { active = false }
  }, [id, country, tokenStack]) // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = () => { if (nextPage) setTokenStack((s) => [...s, nextPage]) }
  const goPrev = () => { if (pageIndex > 0) setTokenStack((s) => s.slice(0, -1)) }

  const countryLabel = COUNTRIES.find((c) => c.code === country)?.label || country

  return (
    <div className="container category-page">
      <div className="category-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link><span>/</span><span className="mono-tag">{id}</span>
        </div>
        <div className="category-title-row">
          <h1>{id}</h1>
          <button
            type="button"
            className={`subscribe-btn ${subscribed ? 'active' : ''}`}
            onClick={() => toggleSubscription(id)}
          >
            {subscribed ? '✓ Subscribed' : '+ Subscribe'}
          </button>
        </div>
        <p className="category-sub">
          Top {id} stories in {countryLabel}
          {subscribed ? ' — you\u2019re following this topic.' : '. Subscribe to follow this topic.'}
        </p>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {!loading && articles.length === 0 && !error && (
        <p className="empty-state">No stories found for this category right now. Try another category or country.</p>
      )}

      <div className="category-grid">
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
          : articles.map((a, i) => <NewsCard key={i} article={a} category={id} />)}
      </div>

      <CursorPager
        pageNumber={pageIndex + 1}
        hasNext={!!nextPage}
        hasPrev={pageIndex > 0}
        onNext={goNext}
        onPrev={goPrev}
      />
    </div>
  )
}
