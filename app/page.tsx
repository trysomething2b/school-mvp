"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth/session-provider"

export default function HomePage() {
  const { user } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.replace("/dashboard")
      return
    }
    router.replace("/login?returnTo=" + encodeURIComponent("/"))
  }, [router, user])

  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-sm text-zinc-500">
      Redirecting…
    </main>
  )
}
