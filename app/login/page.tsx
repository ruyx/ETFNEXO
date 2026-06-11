'use client'

import { useState, Suspense, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginAction } from './actions'
import './login.css'

function LoginForm() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const handleLogin = async (formData: FormData) => {
    setError('')
    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success && result?.session) {
        // Set session on client to establish cookies
        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        })

        if (sessionError) {
          setError('Error al establecer la sesión')
          console.error('[Login] Session error:', sessionError)
          return
        }

        // Now redirect - cookies are set on client side
        window.location.href = redirectTo
      }
    })
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Accede a ETF Nexo para gestionar tus ETFs favoritos</p>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form action={handleLogin} className="login-form">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              disabled={isPending}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isPending}
          >
            {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="divider">
          <span>o continúa con</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn-google"
          disabled={isPending}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
            <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        <div className="login-footer">
          <p>
            ¿No tienes cuenta?{' '}
            <Link href="/signup">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Cargando...</h1>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
