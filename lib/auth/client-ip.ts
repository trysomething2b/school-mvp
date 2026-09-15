export function readClientIp(request: Request, fallback?: string | null): string | null {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp
  return fallback ?? null
}

export function readUserAgent(request: Request, fallback?: string | null): string | null {
  return fallback || request.headers.get("user-agent") || null
}
