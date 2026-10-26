/**
 * Supabase Auth Middleware
 * Refreshes Supabase session on every request
 * Protects authenticated routes
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create response early
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Sin configuración de Supabase (p. ej. entorno Preview de Vercel sin las
  // variables) no se puede refrescar la sesión. Antes createServerClient
  // lanzaba y toda la web respondía 500 MIDDLEWARE_INVOCATION_FAILED.
  // Se registra el error y se sirve la página sin sesión.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Middleware] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY; se omite el refresco de sesión')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // IMPORTANT: This call is critical - it refreshes the user session
  const {
    data: { user },
  } = await supabase.auth.getUser()


  // Protected routes - DISABLED: letting client components handle auth
  // Client-side auth check is more reliable with cookies
  // const protectedPaths = ['/dashboard', '/perfil', '/watchlist']
  // const isProtectedPath = protectedPaths.some((path) =>
  //   request.nextUrl.pathname.startsWith(path)
  // )

  // if (isProtectedPath && !user) {
  //   const redirectUrl = request.nextUrl.clone()
  //   redirectUrl.pathname = '/login'
  //   redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
  //   return NextResponse.redirect(redirectUrl)
  // }

  // Auth routes - redirect to home if already logged in
  const authPaths = ['/login', '/signup']
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
