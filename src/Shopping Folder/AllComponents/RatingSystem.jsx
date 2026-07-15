// ============================================================
//  RayaFoods — RatingSystem.jsx (Firebase version)
//  Reviews saved to Firebase Firestore — visible to ALL users!
//  Place at: src/Shopping Folder/AllComponents/RatingSystem.jsx
//  Usage:    <RatingSystem foodName="Plain Dosa" />
// ============================================================

import React, { useState, useEffect } from 'react'
import './RatingSystem.css'
import { db } from '../../firebaseConfig'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'

// ── StarPicker ────────────────────────────────────────────────
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
        >★</button>
      ))}
    </div>
  )
}

// ── StarDisplay ───────────────────────────────────────────────
const StarDisplay = ({ value, size = 'sm' }) => (
  <span className={`star-display star-display--${size}`} aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= Math.round(value) ? 'filled' : 'empty'}>★</span>
    ))}
  </span>
)

// ── RatingBar ─────────────────────────────────────────────────
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

// ── Main RatingSystem ─────────────────────────────────────────
const RatingSystem = ({ foodName = 'This item' }) => {
  // Each food item gets its own Firestore collection
  // e.g. "reviews_Plain_Dosa", "reviews_Bonda" etc.
  const collectionName = `reviews_${foodName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`

  const [reviews,   setReviews]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [form,      setForm]      = useState({ name: '', rating: 0, comment: '' })
  const [submitted, setSubmitted] = useState(false)
  const [posting,   setPosting]   = useState(false)
  const [error,     setError]     = useState('')

  // ── Real-time listener — updates instantly when anyone posts ──
  useEffect(() => {
    const q = query(
      collection(db, collectionName),
      orderBy('createdAt', 'desc')  // newest first
    )

    // onSnapshot = live updates — all users see new reviews instantly
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Format date nicely
        date: doc.data().createdAt?.toDate
          ? doc.data().createdAt.toDate().toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })
          : 'Just now'
      }))
      setReviews(fetched)
      setLoading(false)
    }, (err) => {
      console.error("Firebase error:", err)
      setLoading(false)
    })

    return () => unsubscribe() // Cleanup listener on unmount
  }, [collectionName])

  // ── Computed stats ────────────────────────────────────────────
  const total     = reviews.length
  const avgRating = total > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
    : 0

  const countByStar = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length
  }))

  // ── Submit to Firebase ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.rating === 0)      { setError('Please select a star rating.'); return }
    if (!form.name.trim())      { setError('Please enter your name.'); return }
    if (!form.comment.trim())   { setError('Please write a short review.'); return }

    setPosting(true)
    setError('')

    try {
      // Save to Firestore — visible to ALL users immediately!
      await addDoc(collection(db, collectionName), {
        name:      form.name.trim(),
        rating:    form.rating,
        comment:   form.comment.trim(),
        foodName:  foodName,
        createdAt: serverTimestamp() // Firebase server time
      })

      setForm({ name: '', rating: 0, comment: '' })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      console.error("Failed to post review:", err)
      setError('Failed to post review. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className='rating-system'>

      {/* ── Summary ── */}
      <div className='rating-summary'>
        <div className='rating-score-box'>
          <span className='rating-big-num'>{loading ? '...' : avgRating}</span>
          <StarDisplay value={Number(avgRating)} size='md' />
          <span className='rating-total-count'>
            {loading ? 'Loading...' : `${total} review${total !== 1 ? 's' : ''}`}
          </span>
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
            ✅ Thank you! Your review is now live for everyone to see!
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

          <div className='form-row form-row--rating'>
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

          <button type='submit' className='submit-btn' disabled={posting}>
            {posting ? 'Posting...' : 'Post Review'}
          </button>
        </form>
      </div>

      {/* ── Reviews list ── */}
      {loading && (
        <div className='no-reviews'>
          <p>Loading reviews...</p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className='reviews-list'>
          <h3 className='rating-section-title'>
            Customer Reviews
            <span style={{ fontSize:'12px', color:'#888', fontWeight:'400', marginLeft:'8px' }}>
              (Live — updates for all users)
            </span>
          </h3>
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

      {!loading && reviews.length === 0 && (
        <div className='no-reviews'>
          <p>No reviews yet — be the first to rate {foodName}! 🍽️</p>
        </div>
      )}

    </div>
  )
}

export default RatingSystem
