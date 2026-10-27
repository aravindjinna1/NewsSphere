import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchNews } from '../api/newsApi.js'
import NewsCard from '../components/NewsCard.jsx'
import SkeletonCard from '../components/SkeletonCard.jsx'
import CursorPager from '../components/CursorPager.jsx'
import './SearchPage.css'

const PAGE_SIZE = 10

export default function SearchPage() {
  const [params] = useSearchParams()
  // The navbar's search box is the only search input now — this page just
  // reacts to whatever "q" is in the URL, live, every time it changes.
  const query = (params.get('q') || '').trim()

  const [articles, setArticles] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [nextPage, setNextPage] = useState(null)
  const [tokenStack, setTokenStack] = useState([null])
  const pageIndex = tokenStack.length - 1

  // reset back to page 1 whenever the search term itself changes
  useEffect(() => { setTokenStack([null]) }, [query])

  useEffect(() => {
    if (!query) { setArticles([]); setTotalResults(0); setNextPage(null); return }
    let active = true
    setLoading(true)
    const pageToken = tokenStack[pageIndex]
    searchNews({ query, pageToken }).then((res) => {
      if (!active) return
      setArticles(res.articles)
      setTotalResults(res.totalResults)
      setNextPage(res.nextPage)
      setError(res.error)
      setLoading(false)
    })

    
    return () => { active = false }
  }, [query, tokenStack]) // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = () => { if (nextPage) setTokenStack((s) => [...s, nextPage]) }
  const goPrev = () => { if (pageIndex > 0) setTokenStack((s) => s.slice(0, -1)) }

  return (
    <div className="container search-page">
      <div className="search-page-head">
        <h1>Search the wire</h1>

        {query && (
          <div className="search-meta">
            <span className="mono-tag">{totalResults.toLocaleString()} results for “{query}”</span>
          </div>
        )}
      </div>

      {error && <p className="error-banner">{error}</p>}

      {!query && (
        <p className="empty-state">Use the search bar at the top to look up live headlines from around the world.</p>
      )}

      {query && !loading && articles.length === 0 && !error && (
        <p className="empty-state">No results for “{query}”. Try a different term.</p>
      )}

      <div className="category-grid">
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
          : articles.map((a, i) => <NewsCard key={i} article={a} />)}
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
