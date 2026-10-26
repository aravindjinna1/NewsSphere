import React from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import './PaginationBar.css'

export default function PaginationBar({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="pagination-bar">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <IoChevronBack />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={p === page ? 'active' : ''}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <IoChevronForward />
      </button>
    </div>
  )
}
