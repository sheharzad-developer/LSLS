import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const isAuthPage = path === "/login" || path === "/signup"
    const isApiAuth = path.startsWith("/api/auth")

    // Allow access to login and signup pages and API auth routes
    if (isAuthPage || isApiAuth) {
      // If user is already logged in and tries to access auth pages, redirect to their dashboard
      if (isAuthPage && token) {
        return NextResponse.redirect(
          new URL(`/${token.role?.toLowerCase() || "admin"}`, req.url)
        )
      }
      return NextResponse.next()
    }

    // If no token and not on auth page, redirect to login
    if (!token) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", path)
      return NextResponse.redirect(loginUrl)
    }

    const role = token.role?.toLowerCase()

    // Role-based route protection
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/${role}`, req.url))
    }

    if (path.startsWith("/teacher") && role !== "teacher") {
      return NextResponse.redirect(new URL(`/${role}`, req.url))
    }

    if (path.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL(`/${role}`, req.url))
    }

    if (path.startsWith("/parent") && role !== "parent") {
      return NextResponse.redirect(new URL(`/${role}`, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login and signup pages without token
        if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup") {
          return true
        }
        // Require token for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (e.g., .png, .jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
}

