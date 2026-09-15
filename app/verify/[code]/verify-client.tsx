"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Status = "loading" | "error"

export function VerifyClient({ code, returnTo }: { code: string; returnTo: string }) {
  const [status, setStatus] = useState<Status>("loading")
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function login() {
      try {
        const response = await fetch("/api/auth/code-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            code,
            user_agent: window.navigator.userAgent,
            returnTo,
          }),
        })
        const data = (await response.json()) as { error?: string; redirectTo?: string }
        if (cancelled) return
        if (!response.ok) {
          setError(data.error || "Login failed")
          setStatus("error")
          return
        }
        const location = response.headers.get("Location")
        window.location.replace(location || data.redirectTo || returnTo || "/dashboard")
      } catch {
        if (cancelled) return
        setError("Network error. Try again.")
        setStatus("error")
      }
    }

    void login()
    return () => {
      cancelled = true
    }
  }, [code, returnTo])

  if (status === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-700">{error}</p>
        <Link href="/login" className="text-sm underline">
          Try again
        </Link>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      <p className="text-sm text-zinc-600">Logging you in…</p>
    </main>
  )
}
