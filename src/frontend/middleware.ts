import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Allow access to home page, auth pages, and API routes
    if (
      pathname === "/" ||
      pathname.startsWith("/auth/") ||
      pathname.startsWith("/api/auth/") ||
      pathname.startsWith("/_next/") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next()
    }

    // Check if guest mode is enabled via cookie
    const guestMode = request.cookies.get("guest-mode")?.value === "true"

    // Only check authentication for protected routes if guest mode is not enabled
    if (!guestMode) {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
      })

      // Redirect to sign in if no token and trying to access protected routes
      if (!token) {
        const signInUrl = new URL("/auth/signin", request.url)
        signInUrl.searchParams.set("callbackUrl", request.url)
        return NextResponse.redirect(signInUrl)
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // Allow the request to continue if there's an error
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
