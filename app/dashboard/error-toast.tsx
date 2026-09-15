"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function ErrorToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const message = searchParams.get("error")
  const [visible, setVisible] = useState(Boolean(message))

  useEffect(() => {
    setVisible(Boolean(message))
    if (!message) return
    const timer = window.setTimeout(() => {
      setVisible(false)
      router.replace("/dashboard")
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [message, router])

  if (!visible || !message) return null

  return (
    <div
      role="status"
      className="fixed right-4 top-4 z-50 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg"
    >
      {message}
    </div>
  )
}
