import React from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import './PaginationBar.css'

// newsdata.io paginates with an opaque "nextPage" token instead of page
// numbers, so we can only ever step forward (using that token) or back
// (by popping a stack of tokens we've already visited) — no jumping
// straight to page 6.
export default function CursorPager({ pageNumber, hasNext, hasPrev, onNext, onPrev }) {
  if (!hasNext && !hasPrev) return null

  return (
    <div className="pagination-bar">
      <button disabled={!hasPrev} onClick={onPrev} aria-label="Previous page">
        <IoChevronBack /> Prev
      </button>
      <button className="active" disabled>{pageNumber}</button>
      <button disabled={!hasNext} onClick={onNext} aria-label="Next page">
        Next <IoChevronForward />
      </button>
    </div>
  )
}
