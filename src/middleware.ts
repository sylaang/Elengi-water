// src/middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_ROUTES = [
  "/login",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/unauthorized",
  "/",
  "/register"
]

const ADMIN_ROUTES = ["/dashboard"]
const USER_ROUTES = ["/dashboard/user"]

export default auth(async (req: NextRequest) => {
  const { pathname } = req.nextUrl

  // 1. Autoriser les routes publiques
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  const session = await auth()
  const isAuthenticated = !!session?.user
  const isAdmin = session?.user?.role === 'ADMIN'

  // 2. Gestion des routes API protégées
  if (pathname.startsWith("/api") && !isAuthenticated) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    )
  }

  // 3. Redirection pour les utilisateurs non authentifiés
  if (!isAuthenticated) {
    const callbackUrl = encodeURIComponent(pathname)
    const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, req.url)
    return NextResponse.redirect(loginUrl)
  }

  // 4. Gestion des redirections basées sur les rôles
  if (pathname === '/dashboard') {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard/user', req.url))
    }
  }

  if (pathname === '/dashboard/user') {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // 5. Protection contre les attaques de redirection
  if (pathname.startsWith("/login") && isAuthenticated) {
    return NextResponse.redirect(new URL(isAdmin ? '/dashboard' : '/dashboard/user', req.url))
  }

  // 6. Autoriser l'accès aux routes protégées
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}