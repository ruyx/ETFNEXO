'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import './UserNav.css'

export default function UserNav() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      try {
        console.log('[UserNav] Getting user...')
        const { data: { user }, error } = await supabase.auth.getUser()
        console.log('[UserNav] User result:', { user: user ? 'Found' : 'Not found', email: user?.email, error })

        setUser(user)

        if (user) {
          console.log('[UserNav] Fetching profile for user:', user.id)
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          console.log('[UserNav] Profile result:', profile ? 'Found' : 'Not found')
          setProfile(profile)
        }

        setLoading(false)
      } catch (err) {
        console.error('[UserNav] Error:', err)
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="user-nav-skeleton">
        <div className="skeleton-circle"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="user-nav-auth-buttons">
        <Link href="/login" className="btn-login">
          Iniciar Sesión
        </Link>
        <Link href="/signup" className="btn-signup">
          Registrarse
        </Link>
      </div>
    )
  }

  const displayName = profile?.full_name || profile?.username || user.email?.split('@')[0] || 'Usuario'
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <div className="user-nav" ref={dropdownRef}>
      <button
        className="user-nav-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={displayName} className="user-nav-avatar" />
        ) : (
          <div className="user-nav-avatar-placeholder">
            {initials}
          </div>
        )}
        <svg
          className={`user-nav-chevron ${isOpen ? 'user-nav-chevron-open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="user-nav-dropdown">
          <div className="user-nav-dropdown-header">
            <div className="user-nav-dropdown-name">{displayName}</div>
            <div className="user-nav-dropdown-email">{user.email}</div>
          </div>

          <div className="user-nav-dropdown-divider"></div>

          <nav className="user-nav-dropdown-nav">
            <Link
              href="/perfil"
              className="user-nav-dropdown-link"
              onClick={() => setIsOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z"
                  fill="currentColor"
                />
              </svg>
              Mi Perfil
            </Link>

            <Link
              href="/perfil#watchlist"
              className="user-nav-dropdown-link"
              onClick={() => setIsOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L10.12 5.5L15 6.25L11.5 9.75L12.25 15L8 12.5L3.75 15L4.5 9.75L1 6.25L5.88 5.5L8 1Z"
                  fill="currentColor"
                />
              </svg>
              Mis ETFs
            </Link>

            <Link
              href="/perfil#ratings"
              className="user-nav-dropdown-link"
              onClick={() => setIsOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14 6H10L8 0L6 6H2L5.5 9.5L4 16L8 12.5L12 16L10.5 9.5L14 6Z"
                  fill="currentColor"
                />
              </svg>
              Mis Valoraciones
            </Link>

            {/* Redactar artículos - Solo para admin y redactor */}
            {(profile?.role === 'admin' || profile?.role === 'redactor') && (
              <>
                <Link
                  href="/admin/noticias"
                  className="user-nav-dropdown-link"
                  onClick={() => setIsOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M14 2H8.5L7.5 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V4C16 2.9 15.1 2 14 2ZM4 12V10H12V12H4ZM12 8H4V6H12V8Z"
                      fill="currentColor"
                    />
                  </svg>
                  Redactar Noticias
                </Link>

                <Link
                  href="/admin/academia"
                  className="user-nav-dropdown-link"
                  onClick={() => setIsOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 0L0 3V6C0 10.55 3.84 14.74 9 16C14.16 14.74 18 10.55 18 6V3L8 0ZM8 8H16C16 11.53 13.61 14.83 10 15.92V9H8V2.18L14 4.3V6H8V8Z"
                      fill="currentColor"
                    />
                  </svg>
                  Redactar Academia
                </Link>
              </>
            )}

            {/* Gestión de Usuarios - Solo para admin */}
            {profile?.role === 'admin' && (
              <>
                <Link
                  href="/admin/usuarios"
                  className="user-nav-dropdown-link"
                  onClick={() => setIsOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M10.5 8C11.88 8 12.99 6.88 12.99 5.5C12.99 4.12 11.88 3 10.5 3C9.12 3 8 4.12 8 5.5C8 6.88 9.12 8 10.5 8ZM5.5 8C6.88 8 7.99 6.88 7.99 5.5C7.99 4.12 6.88 3 5.5 3C4.12 3 3 4.12 3 5.5C3 6.88 4.12 8 5.5 8ZM5.5 10C3.67 10 0 10.92 0 12.75V14C0 14.55 0.45 15 1 15H10C10.55 15 11 14.55 11 14V12.75C11 10.92 7.33 10 5.5 10ZM10.5 10C10.29 10 10.05 10.01 9.79 10.04C10.56 10.63 11 11.38 11 12.75V14C11 14.35 10.93 14.69 10.82 15H15C15.55 15 16 14.55 16 14V12.75C16 10.92 12.33 10 10.5 10Z"
                      fill="currentColor"
                    />
                  </svg>
                  Gestión de Usuarios
                </Link>

                <Link
                  href="/admin/agentes"
                  className="user-nav-dropdown-link"
                  onClick={() => setIsOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M12 1H4C2.9 1 2 1.9 2 3V13C2 14.1 2.9 15 4 15H12C13.1 15 14 14.1 14 13V3C14 1.9 13.1 1 12 1ZM8 3.5C8.83 3.5 9.5 4.17 9.5 5C9.5 5.83 8.83 6.5 8 6.5C7.17 6.5 6.5 5.83 6.5 5C6.5 4.17 7.17 3.5 8 3.5ZM11 12H5V11.5C5 10.17 7.67 9.5 9 9.5H7C8.33 9.5 11 10.17 11 11.5V12ZM13 0H3C2.45 0 2 0.45 2 1H14C14 0.45 13.55 0 13 0ZM13 15C13.55 15 14 14.55 14 14H2C2 14.55 2.45 15 3 15H13Z"
                      fill="currentColor"
                    />
                  </svg>
                  Gestión de Agentes IA
                </Link>

                <Link
                  href="/admin/ads"
                  className="user-nav-dropdown-link"
                  onClick={() => setIsOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13 1H3L1 5V13C1 14.1 1.9 15 3 15H13C14.1 15 15 14.1 15 13V5L13 1ZM8 13L4 9H7V6H9V9H12L8 13ZM3.17 3L3.92 1.5H12.08L12.83 3H3.17Z"
                      fill="currentColor"
                    />
                  </svg>
                  Gestión de Publicidad
                </Link>
              </>
            )}
          </nav>

          <div className="user-nav-dropdown-divider"></div>

          <button
            className="user-nav-dropdown-signout"
            onClick={handleSignOut}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 14H2V2H6V0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H6V14ZM12.59 7L10.29 4.71L11.71 3.29L16 7.58L11.71 11.87L10.29 10.46L12.59 8.16H5V7H12.59Z"
                fill="currentColor"
              />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}
