'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Bookmark, Star, FileText, GraduationCap, Video, Users, Megaphone, Sparkles, LogOut, ChevronDown } from 'lucide-react'
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
        <ChevronDown
          className={`user-nav-chevron ${isOpen ? 'user-nav-chevron-open' : ''}`}
          size={16}
        />
      </button>

      {isOpen && (
        <div className="user-nav-dropdown">
          <div className="user-nav-dropdown-header">
            <div className="user-nav-dropdown-name">{displayName}</div>
            <div className="user-nav-dropdown-email">{user.email}</div>
          </div>

          <div className="user-nav-dropdown-divider"></div>

          <nav className="user-nav-dropdown-nav">
            {/* Two-column grid layout */}
            <div className="user-nav-dropdown-grid">
              {/* Column 1: Personal */}
              <div className="user-nav-dropdown-column">
                <div className="user-nav-dropdown-section-title">Personal</div>
                <Link
                  href="/perfil"
                  className="user-nav-dropdown-link"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={18} strokeWidth={2} />
                  <span>Mi Perfil</span>
                </Link>

                <Link
                  href="/perfil#watchlist"
                  className="user-nav-dropdown-link"
                  onClick={() => setIsOpen(false)}
                >
                  <Bookmark size={18} strokeWidth={2} />
                  <span>Mis ETFs</span>
                </Link>

                <Link
                  href="/perfil#ratings"
                  className="user-nav-dropdown-link"
                  onClick={() => setIsOpen(false)}
                >
                  <Star size={18} strokeWidth={2} />
                  <span>Mis Valoraciones</span>
                </Link>
              </div>

              {/* Column 2: Redacción (admin/redactor) */}
              {(profile?.role === 'admin' || profile?.role === 'redactor') && (
                <div className="user-nav-dropdown-column">
                  <div className="user-nav-dropdown-section-title">Redacción</div>
                  <Link
                    href="/admin/noticias"
                    className="user-nav-dropdown-link"
                    onClick={() => setIsOpen(false)}
                  >
                    <FileText size={18} strokeWidth={2} />
                    <span>Noticias</span>
                  </Link>

                  <Link
                    href="/admin/academia"
                    className="user-nav-dropdown-link"
                    onClick={() => setIsOpen(false)}
                  >
                    <GraduationCap size={18} strokeWidth={2} />
                    <span>Academia</span>
                  </Link>

                  <Link
                    href="/admin/entrevistas"
                    className="user-nav-dropdown-link"
                    onClick={() => setIsOpen(false)}
                  >
                    <Video size={18} strokeWidth={2} />
                    <span>Entrevistas</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Admin section (full width) */}
            {profile?.role === 'admin' && (
              <>
                <div className="user-nav-dropdown-divider" style={{ margin: '8px 0' }}></div>
                <div className="user-nav-dropdown-section-title" style={{ padding: '0 16px' }}>Administración</div>
                <div className="user-nav-dropdown-grid">
                  <div className="user-nav-dropdown-column">
                    <Link
                      href="/admin/usuarios"
                      className="user-nav-dropdown-link"
                      onClick={() => setIsOpen(false)}
                    >
                      <Users size={18} strokeWidth={2} />
                      <span>Usuarios</span>
                    </Link>

                    <Link
                      href="/admin/ads"
                      className="user-nav-dropdown-link"
                      onClick={() => setIsOpen(false)}
                    >
                      <Megaphone size={18} strokeWidth={2} />
                      <span>Publicidad</span>
                    </Link>
                  </div>

                  <div className="user-nav-dropdown-column">
                    <Link
                      href="/admin/agentes"
                      className="user-nav-dropdown-link"
                      onClick={() => setIsOpen(false)}
                    >
                      <Sparkles size={18} strokeWidth={2} />
                      <span>Agentes IA</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </nav>

          <div className="user-nav-dropdown-divider"></div>

          <button
            className="user-nav-dropdown-signout"
            onClick={handleSignOut}
          >
            <LogOut size={18} strokeWidth={2} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  )
}
