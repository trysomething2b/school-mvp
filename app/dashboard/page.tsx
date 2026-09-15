import { Suspense } from "react"
import Link from "next/link"
import { headers } from "next/headers"
import { displayRole } from "@/lib/auth/roles"
import { createClient } from "@/lib/supabase/server"
import { ErrorToast } from "./error-toast"
import { LogoutButton } from "./logout-button"

export default async function DashboardPage() {
  const headerStore = await headers()
  const headerRole = headerStore.get("x-app-role")
  const headerSchool = headerStore.get("x-app-school")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, role, school_id")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null }

  const name =
    (typeof profile?.full_name === "string" && profile.full_name) ||
    user?.email ||
    "there"
  const role = headerRole || (typeof profile?.role === "string" ? profile.role : "")
  const schoolId =
    headerSchool || (typeof profile?.school_id === "string" ? profile.school_id : "")

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Suspense fallback={null}>
        <ErrorToast />
      </Suspense>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">Welcome</p>
          <h1 className="text-2xl font-semibold">{name}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            role={displayRole(role)}
            {schoolId ? ` · school=${schoolId}` : null}
          </p>
        </div>
        <LogoutButton />
      </header>
      <p className="mt-8">
        <Link href="/login-events" className="text-sm underline">
          Login events
        </Link>
      </p>
    </main>
  )
}
