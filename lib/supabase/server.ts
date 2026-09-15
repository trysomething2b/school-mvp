import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env"

function getSupabaseServiceRoleKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!value) {
    throw new Error("Missing required environment variable SUPABASE_SERVICE_ROLE_KEY")
  }
  return value
}

/** Cookie-aware anon client for Server Components, Route Handlers, and Server Actions. */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Called from a Server Component; middleware refreshes the session.
        }
      },
    },
  })
}

/** Service-role client. Server-only — never import from a "use client" file. */
export function createAdminClient() {
  return createSupabaseJsClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
