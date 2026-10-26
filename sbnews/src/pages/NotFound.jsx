import React from 'react'
import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="container not-found">
      <span className="mono-tag">404</span>
      <h1>This story doesn't exist.</h1>
      <p>The page you're looking for was moved, deleted, or never published.</p>
      <Link to="/" className="cta-btn">Back to the front page</Link>
    </div>
  )
}
