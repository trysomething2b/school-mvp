import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const loginUrl = new URL("/login", request.url)
  const accept = request.headers.get("accept") || ""

  if (accept.includes("application/json")) {
    const response = NextResponse.json({ ok: true })
    response.headers.set("Location", loginUrl.pathname)
    return response
  }

  return NextResponse.redirect(loginUrl, 303)
}
