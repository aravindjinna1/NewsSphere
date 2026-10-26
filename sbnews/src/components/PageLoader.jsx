import React from 'react'
import './PageLoader.css'

export default function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading page">
      <span className="pl-dot" />
      <span className="pl-dot" />
      <span className="pl-dot" />
    </div>
  )
}
