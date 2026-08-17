'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import './perfil.css'

export const dynamic = 'force-dynamic'

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [ratings, setRatings] = useState<any[]>([])
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('[Perfil] Loading user data...')

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.log('[Perfil] No user found, redirecting to login')
          router.push('/login')
          return
        }

        console.log('[Perfil] User found:', user.email)
        setUser(user)

        // Get user profile
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id' as any, user.id as any)
          .single()

        console.log('[Perfil] Profile loaded:', profileData ? 'Found' : 'Not found')
        setProfile(profileData)

        // Get user ratings with ETF info
        const { data: ratingsData } = await supabase
          .from('user_ratings')
          .select(`
            *,
            etfs (
              isin,
              name,
              manager_id
            )
          `)
          .eq('user_id' as any, user.id as any)
          .order('created_at', { ascending: false })

        console.log('[Perfil] Ratings loaded:', ratingsData?.length || 0)
        setRatings(ratingsData || [])

        // Get user watchlist
        const { data: watchlistData } = await supabase
          .from('user_watchlists')
          .select(`
            *,
            etfs (
              isin,
              name,
              ter,
              return_1y,
              average_rating
            )
          `)
          .eq('user_id' as any, user.id as any)
          .order('added_at', { ascending: false })

        console.log('[Perfil] Watchlist loaded:', watchlistData?.length || 0)
        setWatchlist(watchlistData || [])

        setLoading(false)
      } catch (err) {
        console.error('[Perfil] Error loading data:', err)
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="perfil-container">
          <div className="perfil-loading">
            <div className="spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Header />
      <div className="perfil-container">
      <div className="perfil-header">
        <div className="perfil-header-content">
          <div className="perfil-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || 'Usuario'} />
            ) : (
              <div className="perfil-avatar-placeholder">
                {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="perfil-info">
            <h1>{profile?.full_name || profile?.username || 'Usuario'}</h1>
            <p>{user.email}</p>
            <div className="perfil-stats">
              <div className="stat">
                <span className="stat-value">{ratings?.length || 0}</span>
                <span className="stat-label">Valoraciones</span>
              </div>
              <div className="stat">
                <span className="stat-value">{watchlist?.length || 0}</span>
                <span className="stat-label">ETFs Seguidos</span>
              </div>
            </div>
          </div>
          <form action={handleSignOut}>
            <button type="submit" className="btn-signout">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>

      <div className="perfil-content">
        <section className="perfil-section">
          <h2>Mis Valoraciones</h2>
          {ratings && ratings.length > 0 ? (
            <div className="ratings-grid">
              {ratings.map((rating: any) => (
                <div key={rating.id} className="rating-card">
                  <div className="rating-card-header">
                    <Link href={`/etfs/${rating.etfs?.isin}`} className="rating-etf-name">
                      {rating.etfs?.name}
                    </Link>
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < rating.rating ? 'star-filled' : 'star-empty'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {rating.review_title && (
                    <h3 className="rating-title">{rating.review_title}</h3>
                  )}
                  {rating.review_text && (
                    <p className="rating-text">{rating.review_text}</p>
                  )}
                  <div className="rating-date">
                    {new Date(rating.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Aún no has valorado ningún ETF</p>
              <Link href="/etfs" className="btn-primary">
                Explorar ETFs
              </Link>
            </div>
          )}
        </section>

        <section className="perfil-section">
          <h2>Mis ETFs Seguidos</h2>
          {watchlist && watchlist.length > 0 ? (
            <div className="watchlist-grid">
              {watchlist.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/etfs/${item.etfs?.isin}`}
                  className="watchlist-card"
                >
                  <h3>{item.etfs?.name}</h3>
                  <div className="watchlist-stats">
                    <div className="watchlist-stat">
                      <span className="label">TER:</span>
                      <span className="value">
                        {item.etfs?.ter ? `${(item.etfs.ter * 100).toFixed(2)}%` : '-'}
                      </span>
                    </div>
                    <div className="watchlist-stat">
                      <span className="label">Retorno 1Y:</span>
                      <span className={`value ${(item.etfs?.return_1y || 0) >= 0 ? 'positive' : 'negative'}`}>
                        {item.etfs?.return_1y ? `${item.etfs.return_1y.toFixed(2)}%` : '-'}
                      </span>
                    </div>
                    {item.etfs?.average_rating && (
                      <div className="watchlist-stat">
                        <span className="label">Rating:</span>
                        <span className="value">
                          ★ {item.etfs.average_rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  {item.notes && (
                    <p className="watchlist-notes">{item.notes}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Aún no sigues ningún ETF</p>
              <Link href="/etfs" className="btn-primary">
                Explorar ETFs
              </Link>
            </div>
          )}
        </section>
      </div>
      </div>
    </>
  )
}
