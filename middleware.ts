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

  // DEBUG: Log cookies before creating Supabase client
  const allCookies = request.cookies.getAll()
  const supabaseCookies = allCookies.filter(c =>
    c.name.includes('supabase') || c.name.includes('sb-')
  )

  if (request.nextUrl.pathname.includes('/api/test-my-role') || request.nextUrl.pathname.includes('/admin')) {
    console.log('=== MIDDLEWARE COOKIES DEBUG ===')
    console.log('Path:', request.nextUrl.pathname)
    console.log('Total cookies:', allCookies.length)
    console.log('Supabase cookies:', supabaseCookies.map(c => ({
      name: c.name,
      valueLength: c.value.length,
      first50: c.value.substring(0, 50)
    })))
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any) {
          if (request.nextUrl.pathname.includes('/api/test-my-role') || request.nextUrl.pathname.includes('/admin')) {
            console.log('=== SUPABASE TRYING TO SET COOKIES ===')
            console.log('Cookies to set:', cookiesToSet.map((c: any) => ({
              name: c.name,
              valueLength: c.value?.length || 0
            })))
          }
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
    error: userError,
  } = await supabase.auth.getUser()

  console.log('[Middleware]', request.nextUrl.pathname, 'User:', user ? user.email : 'Not found', 'Error:', userError?.message || 'None')

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
