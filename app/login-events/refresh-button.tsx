"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function RefreshButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true)
        router.refresh()
        window.setTimeout(() => setPending(false), 400)
      }}
      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50"
    >
      {pending ? "Refreshing…" : "Refresh"}
    </button>
  )
}
