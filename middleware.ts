import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Obtener token de la sesión
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Rutas de admin - requiere autenticación y rol admin
  if (pathname.startsWith('/admin')) {
    if (!token) {
      // No autenticado - redirigir a login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (token.role !== 'admin') {
      // Autenticado pero no es admin - redirigir a home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Rutas de autenticación - redirigir si ya está autenticado
  if (pathname.startsWith('/auth/login') && token) {
    // Si es admin, ir a admin, sino a home
    const redirectUrl = token.role === 'admin' ? '/admin' : '/'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
