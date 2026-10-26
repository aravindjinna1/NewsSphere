import React from 'react'
import './SkeletonCard.css'

export default function SkeletonCard({ featured = false }) {
  return (
    <div className={`skeleton-card glass-panel ${featured ? 'featured' : ''}`}>
      <div className="skeleton-media shimmer" />
      <div className="skeleton-body">
        <div className="skeleton-line shimmer" style={{ width: '90%' }} />
        <div className="skeleton-line shimmer" style={{ width: '70%' }} />
        <div className="skeleton-line shimmer short" style={{ width: '35%' }} />
      </div>
    </div>
  )
}
