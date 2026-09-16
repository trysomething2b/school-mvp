"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
// NOTE: no formatCardCode import here on purpose — codes are typed as-is
import { safeReturnTo } from "@/lib/auth/return-to"

type Tab = "code" | "email"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = useMemo(
    () => safeReturnTo(searchParams.get("returnTo")),
    [searchParams],
  )

  const [tab, setTab] = useState<Tab>("code")
  const [code, setCode] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(url: string, payload: Record<string, unknown>) {
    setPending(true)
    setError("")
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...payload,
          user_agent: window.navigator.userAgent,
          returnTo,
        }),
      })
      const data = (await response.json()) as { error?: string; redirectTo?: string }
      if (!response.ok) {
        setError(data.error || "Login failed")
        return
      }
      const location = response.headers.get("Location")
      router.replace(location || data.redirectTo || returnTo)
      router.refresh()
    } catch {
      setError("Network error. Try again.")
    } finally {
      setPending(false)
    }
  }

  function onCodeSubmit(event: FormEvent) {
    event.preventDefault()
    void submit("/api/auth/code-login", { code })
  }

  function onEmailSubmit(event: FormEvent) {
    event.preventDefault()
    void submit("/api/auth/email-login", { email, password })
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-center text-sm text-zinc-500">School staff and admin</p>

        <div className="mt-6 grid grid-cols-2 rounded-lg bg-zinc-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setTab("code")}
            className={`rounded-md px-3 py-2 ${tab === "code" ? "bg-white shadow-sm" : "text-zinc-500"}`}
          >
            Card code
          </button>
          <button
            type="button"
            onClick={() => setTab("email")}
            className={`rounded-md px-3 py-2 ${tab === "email" ? "bg-white shadow-sm" : "text-zinc-500"}`}
          >
            Email
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        {tab === "code" ? (
          <form className="mt-6 space-y-4" onSubmit={onCodeSubmit}>
            <label className="block text-sm font-medium">
              Card code
              <input
                autoComplete="off"
                autoCapitalize="characters"
                inputMode="text"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="CCS-0001"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5 font-mono uppercase tracking-wider outline-none focus:border-zinc-900"
              />
            </label>
            <button
              type="submit"
              disabled={pending || code.length < 7}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {pending ? "Logging in…" : "Log in"}
            </button>
            <p className="text-xs leading-5 text-zinc-500">
              Your card code is printed on your school card. If you received a QR or NFC
              card, scan/tap it to log in automatically.
            </p>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onEmailSubmit}>
            <label className="block text-sm font-medium">
              Email
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none focus:border-zinc-900"
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none focus:border-zinc-900"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {pending ? "Logging in…" : "Log in"}
            </button>
            <button
              type="button"
              className="w-full text-center text-xs text-zinc-500 underline"
              onClick={() => console.info("Forgot password is not available in M2")}
            >
              Forgot password
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
