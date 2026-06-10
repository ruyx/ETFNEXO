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
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

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
