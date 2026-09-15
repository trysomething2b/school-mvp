function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`)
  }
  return value
}

/** Strip accidental PostgREST suffix from a project URL. */
export function getSupabaseUrl(): string {
  return requiredEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/rest\/v1\/?$/, "")
}

export function getSupabaseAnonKey(): string {
  return requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
}
