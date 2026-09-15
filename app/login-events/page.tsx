import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { parseDevice } from "@/lib/auth/device"
import { isAdminRole } from "@/lib/auth/roles"
import { createClient } from "@/lib/supabase/server"
import { RefreshButton } from "./refresh-button"

type LoginEventRow = {
  created_at: string
  method: string | null
  ip_address: string | null
  user_agent: string | null
  profiles: { full_name: string | null } | { full_name: string | null }[] | null
}

function profileName(profiles: LoginEventRow["profiles"]): string {
  if (!profiles) return "Unknown"
  if (Array.isArray(profiles)) return profiles[0]?.full_name || "Unknown"
  return profiles.full_name || "Unknown"
}

export default async function LoginEventsPage() {
  const headerStore = await headers()
  let role = headerStore.get("x-app-role")

  const supabase = await createClient()
  if (!isAdminRole(role)) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data: profile } = user
      ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
      : { data: null }
    role = typeof profile?.role === "string" ? profile.role : role
  }

  if (!isAdminRole(role)) {
    redirect("/dashboard?error=" + encodeURIComponent("Admin access required"))
  }
  const { data, error } = await supabase
    .from("login_events")
    .select("created_at, method, ip_address, user_agent, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100)

  const rows = (data || []) as LoginEventRow[]

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Login events</h1>
        <RefreshButton />
      </div>
      {error ? (
        <p className="mt-4 text-sm text-red-700">{error.message}</p>
      ) : null}
      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-3 py-2 font-medium">When</th>
              <th className="px-3 py-2 font-medium">Who</th>
              <th className="px-3 py-2 font-medium">Method</th>
              <th className="px-3 py-2 font-medium">IP</th>
              <th className="px-3 py-2 font-medium">Device</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-zinc-500" colSpan={5}>
                  No login events yet.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${row.created_at}-${index}`} className="border-t border-zinc-100">
                  <td className="whitespace-nowrap px-3 py-2">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{profileName(row.profiles)}</td>
                  <td className="px-3 py-2">{row.method || "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.ip_address || "—"}</td>
                  <td className="px-3 py-2">{parseDevice(row.user_agent)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
