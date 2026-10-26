import React, { createContext, useContext, useEffect, useState } from 'react'
import { fetchTopHeadlines } from '../api/newsApi'

const NewsContext = createContext()

export const NewsProvider = ({ children }) => {
  const [country, setCountry] = useState(() => localStorage.getItem('sbnews-country') || 'us')
  const [headlines, setHeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    localStorage.setItem('sbnews-country', country)
    let active = true
    setLoading(true)
    fetchTopHeadlines({ country, pageSize: 20 }).then((res) => {
      if (!active) return
      setHeadlines(res.articles)
      setError(res.error)
      setLoading(false)
    })
    return () => { active = false }
  }, [country])

  return (
    <NewsContext.Provider value={{ country, setCountry, headlines, loading, error }}>
      {children}
    </NewsContext.Provider>
  )
}

export const useNews = () => useContext(NewsContext)
