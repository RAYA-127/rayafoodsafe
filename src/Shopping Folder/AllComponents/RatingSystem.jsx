// ============================================================
//  RayaFoods — RatingSystem.jsx
//  Drop this file into:  src/Shopping Folder/AllComponents/RatingSystem.jsx
//  Then import and use <RatingSystem foodName="Plain Dosa" />
//  on any food detail page.
// ============================================================

import React, { useState, useEffect } from 'react'
import './RatingSystem.css'

// ── StarPicker — clickable stars for giving a rating ─────────
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0)

  return (
    <div className='star-picker' role='group' aria-label='Select star rating'>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type='button'
          className={`star-btn ${star <= (hovered || value) ? 'filled' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

// ── StarDisplay — read-only stars ────────────────────────────
const StarDisplay = ({ value, size = 'sm' }) => (
  <span className={`star-display star-display--${size}`} aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= Math.round(value) ? 'filled' : 'empty'}>★</span>
    ))}
  </span>
)

// ── RatingBar — the bar graph row ────────────────────────────
const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className='rating-bar-row'>
      <span className='rating-bar-label'>{star}★</span>
      <div className='rating-bar-track'>
        <div className='rating-bar-fill' style={{ width: `${pct}%` }} />
      </div>
      <span className='rating-bar-count'>{count}</span>
    </div>
  )
}

// ── Main RatingSystem component ───────────────────────────────
const RatingSystem = ({ foodName = 'This item' }) => {
  // Load saved reviews from localStorage (persists across page refreshes)
  const storageKey = `raya_reviews_${foodName.replace(/\s+/g, '_')}`

  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [form, setForm] = useState({ name: '', rating: 0, comment: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Save to localStorage whenever reviews change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(reviews))
  }, [reviews, storageKey])

  // ── Computed stats ──────────────────────────────────────────
  const total = reviews.length
  const avgRating = total > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
    : 0

  const countByStar = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  // ── Submit handler ──────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.rating === 0) { setError('Please select a star rating.'); return }
    if (!form.name.trim())  { setError('Please enter your name.'); return }
    if (!form.comment.trim()) { setError('Please write a short review.'); return }

    const newReview = {
      id: Date.now(),
      name: form.name.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }

    setReviews((prev) => [newReview, ...prev])
    setForm({ name: '', rating: 0, comment: '' })
    setError('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className='rating-system'>

      {/* ── Summary ── */}
      <div className='rating-summary'>
        <div className='rating-score-box'>
          <span className='rating-big-num'>{avgRating}</span>
          <StarDisplay value={avgRating} size='md' />
          <span className='rating-total-count'>{total} review{total !== 1 ? 's' : ''}</span>
        </div>
        <div className='rating-bars'>
          {countByStar.map(({ star, count }) => (
            <RatingBar key={star} star={star} count={count} total={total} />
          ))}
        </div>
      </div>

      {/* ── Write a review form ── */}
      <div className='rating-form-section'>
        <h3 className='rating-section-title'>Rate {foodName}</h3>

        {submitted && (
          <div className='rating-success'>
            ✅ Thank you! Your review has been posted.
          </div>
        )}

        <form onSubmit={handleSubmit} className='rating-form' noValidate>
          <div className='form-row'>
            <label>Your name</label>
            <input
              type='text'
              placeholder='e.g. Ravi Kumar'
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className='form-row'>
            <label>Your rating</label>
            <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>

          <div className='form-row'>
            <label>Your review</label>
            <textarea
              rows={3}
              placeholder='Tell others what you liked about this dish...'
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>

          {error && <p className='rating-error'>{error}</p>}

          <button type='submit' className='submit-btn'>Post review</button>
        </form>
      </div>

      {/* ── Reviews list ── */}
      {reviews.length > 0 && (
        <div className='reviews-list'>
          <h3 className='rating-section-title'>Customer reviews</h3>
          {reviews.map((r) => (
            <div key={r.id} className='review-card'>
              <div className='review-header'>
                <div className='review-avatar'>{r.name.charAt(0).toUpperCase()}</div>
                <div>
                  <p className='review-name'>{r.name}</p>
                  <StarDisplay value={r.rating} size='sm' />
                </div>
                <span className='review-date'>{r.date}</span>
              </div>
              <p className='review-comment'>{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {reviews.length === 0 && (
        <div className='no-reviews'>
          <p>No reviews yet — be the first to rate {foodName}! 🍽️</p>
        </div>
      )}
    </div>
  )
}

export default RatingSystem
