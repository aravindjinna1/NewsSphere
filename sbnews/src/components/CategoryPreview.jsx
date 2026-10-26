import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchByCategory } from '../api/newsApi.js'
import { useNews } from '../context/NewsContext.jsx'
import { getCategoryColor } from '../utils/categoryColors.js'
import NewsCard from './NewsCard.jsx'
import SkeletonCard from './SkeletonCard.jsx'
import './CategoryPreview.css'

export default function CategoryPreview({ category }) {
  const { country } = useNews()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const accent = getCategoryColor(category)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchByCategory({ category, country, pageSize: 4 }).then((res) => {
      if (!active) return
      setArticles(res.articles)
      setLoading(false)
    })
    return () => { active = false }
  }, [category, country])

  return (
    <section className="container category-preview">
      <div className="category-preview-head">
        <h2><span className="category-dot" style={{ background: accent }} />{category}</h2>
        <Link to={`/category/${category}`} style={{ color: accent }}>View all &rarr;</Link>
      </div>
      <div className="category-preview-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : articles.slice(0, 4).map((a, i) => <NewsCard key={i} article={a} category={category} />)}
      </div>
    </section>
  )
}
