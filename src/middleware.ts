import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const isAuthPage = path === "/login" || path === "/signup"
    const isRootPage = path === "/"
    const isApiAuth = path.startsWith("/api/auth")

    // Allow access to root page, login and signup pages and API auth routes
    if (isRootPage || isAuthPage || isApiAuth) {
      // If user is already logged in and tries to access root or auth pages, redirect to their dashboard
      // But only if they have a valid role
      if ((isRootPage || isAuthPage) && token?.role) {
        const role = token.role.toLowerCase()
        // Prevent redirect loops by checking if we're already going to the right place
        if (path !== `/${role}`) {
          return NextResponse.redirect(
            new URL(`/${role}`, req.url)
          )
        }
      }
      return NextResponse.next()
    }

    // If no token and not on root/auth page, redirect to login
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
        // Allow access to root, login and signup pages without token
        if (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup") {
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

