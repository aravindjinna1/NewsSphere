import React from 'react'
import { useNews } from '../context/NewsContext.jsx'
import './Ticker.css'

export default function Ticker() {
  const { headlines, loading } = useNews()

  const items = headlines.slice(0, 10).filter((a) => a.title)

  if (loading || items.length === 0) return null

  const track = [...items, ...items] // duplicate for seamless loop

  return (
    <div className="ticker">
      <span className="ticker-label mono-tag"><span className="live-dot" />Live</span>
      <div className="ticker-track-wrap">
        <div className="ticker-track">
          {track.map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ticker-item"
            >
              {a.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

