'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import './ETFRating.css'

interface ETFRatingProps {
  etfId: string
  etfIsin: string
  initialAverageRating?: number | null
  initialRatingCount?: number
}

interface UserRating {
  id: string
  rating: number
  review_title: string | null
  review_text: string | null
  created_at: string
}

export default function ETFRating({
  etfId,
  etfIsin,
  initialAverageRating,
  initialRatingCount = 0,
}: ETFRatingProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userRating, setUserRating] = useState<UserRating | null>(null)
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [averageRating, setAverageRating] = useState(initialAverageRating || null)
  const [ratingCount, setRatingCount] = useState(initialRatingCount)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Check if user has rated this ETF
        const { data: rating } = await supabase
          .from('user_ratings')
          .select('*')
          .eq('user_id', user.id)
          .eq('etf_id', etfId)
          .single() as { data: any }

        if (rating) {
          setUserRating(rating)
          setSelectedRating(rating.rating)
          setReviewTitle(rating.review_title || '')
          setReviewText(rating.review_text || '')
        }

        // Check if ETF is in watchlist
        const { data: watchlist } = await supabase
          .from('user_watchlists')
          .select('id')
          .eq('user_id', user.id)
          .eq('etf_id', etfId)
          .single() as { data: any }

        setIsWatchlisted(!!watchlist)
      }
    }

    getUser()
  }, [etfId])

  const handleStarClick = (rating: number) => {
    if (!user) {
      router.push(`/login?redirectTo=/etfs/${etfIsin}`)
      return
    }

    setSelectedRating(rating)
    setShowReviewForm(true)
  }

  const handleSubmitRating = async () => {
    if (!user || selectedRating === 0) return

    setLoading(true)

    const ratingData = {
      user_id: user.id,
      etf_id: etfId,
      rating: selectedRating,
      review_title: reviewTitle.trim() || null,
      review_text: reviewText.trim() || null,
    }

    let error

    if (userRating) {
      // Update existing rating
      const result = await (supabase
        .from('user_ratings') as any)
        .update(ratingData)
        .eq('id', userRating.id)
      error = result.error
    } else {
      // Insert new rating
      const result = await (supabase.from('user_ratings') as any).insert([ratingData])
      error = result.error
    }

    if (!error) {
      // Refresh rating data
      const { data: newRating } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('user_id', user.id)
        .eq('etf_id', etfId)
        .single() as { data: any }

      setUserRating(newRating)
      setShowReviewForm(false)

      // Refresh average rating
      const { data: summary } = await supabase
        .from('etf_ratings_summary')
        .select('average_rating, total_ratings')
        .eq('etf_id', etfId)
        .single() as { data: any }

      if (summary) {
        setAverageRating(summary.average_rating)
        setRatingCount(summary.total_ratings)
      }

      router.refresh()
    }

    setLoading(false)
  }

  const handleToggleWatchlist = async () => {
    if (!user) {
      router.push(`/login?redirectTo=/etfs/${etfIsin}`)
      return
    }

    setLoading(true)

    if (isWatchlisted) {
      const { error } = await (supabase
        .from('user_watchlists') as any)
        .delete()
        .eq('user_id', user.id)
        .eq('etf_id', etfId)

      if (!error) {
        setIsWatchlisted(false)
      }
    } else {
      const { error } = await (supabase
        .from('user_watchlists') as any)
        .insert([{ user_id: user.id, etf_id: etfId }])

      if (!error) {
        setIsWatchlisted(true)
      }
    }

    setLoading(false)
  }

  return (
    <div className="etf-rating">
      <div className="etf-rating-header">
        <div className="etf-rating-summary">
          <div className="etf-rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star ${star <= (hoveredStar || selectedRating) ? 'star-filled' : 'star-empty'}`}
                onMouseEnter={() => !userRating && setHoveredStar(star)}
                onMouseLeave={() => !userRating && setHoveredStar(0)}
                onClick={() => !userRating && handleStarClick(star)}
                disabled={!!userRating || loading}
              >
                ★
              </button>
            ))}
          </div>
          <div className="etf-rating-info">
            {averageRating !== null && (
              <span className="etf-rating-average">
                {averageRating.toFixed(1)} / 5.0
              </span>
            )}
            <span className="etf-rating-count">
              {ratingCount} {ratingCount === 1 ? 'valoración' : 'valoraciones'}
            </span>
          </div>
        </div>

        <button
          className={`btn-watchlist ${isWatchlisted ? 'watchlisted' : ''}`}
          onClick={handleToggleWatchlist}
          disabled={loading}
        >
          {isWatchlisted ? '★ En Mi Lista' : '☆ Seguir'}
        </button>
      </div>

      {showReviewForm && (
        <div className="etf-review-form">
          <h3>Tu Valoración</h3>
          <div className="form-group">
            <label>Título (opcional)</label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Ej: Excelente ETF para diversificación"
              maxLength={200}
            />
          </div>
          <div className="form-group">
            <label>Reseña (opcional)</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Comparte tu experiencia con este ETF..."
              rows={4}
              maxLength={1000}
            />
          </div>
          <div className="form-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowReviewForm(false)}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmitRating}
              disabled={loading || selectedRating === 0}
            >
              {loading ? 'Guardando...' : userRating ? 'Actualizar' : 'Enviar Valoración'}
            </button>
          </div>
        </div>
      )}

      {userRating && (
        <div className="etf-user-rating">
          <div className="user-rating-header">
            <span>Tu valoración</span>
            <button
              className="btn-edit"
              onClick={() => setShowReviewForm(true)}
              disabled={loading}
            >
              Editar
            </button>
          </div>
          {userRating.review_title && <h4>{userRating.review_title}</h4>}
          {userRating.review_text && <p>{userRating.review_text}</p>}
          <span className="user-rating-date">
            {new Date(userRating.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  )
}
