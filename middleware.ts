import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env"

function isPublicPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/login") return true
  if (pathname === "/favicon.ico" || pathname === "/robots.txt") return true
  if (pathname.startsWith("/verify/")) return true
  if (pathname.startsWith("/api/auth/")) return true
  if (pathname.startsWith("/_next/")) return true
  return false
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie)
  })
}

/**
 * Auth gate. @supabase/ssr v0.12 does not export `createMiddleware`;
 * `createServerClient` is the supported middleware/proxy API.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
        Object.entries(cacheHeaders).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.search = `?returnTo=${encodeURIComponent(pathname + search)}`
    const redirect = NextResponse.redirect(loginUrl)
    copyCookies(supabaseResponse, redirect)
    return redirect
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, school_id")
      .eq("id", user.id)
      .maybeSingle()

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-app-role", typeof profile?.role === "string" ? profile.role : "")
    requestHeaders.set(
      "x-app-school",
      typeof profile?.school_id === "string" ? profile.school_id : "",
    )

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    })
    copyCookies(supabaseResponse, response)
    return response
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
