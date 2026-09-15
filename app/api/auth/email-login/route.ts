/**
 * Email + password login.
 *
 * curl -X POST http://localhost:3000/api/auth/email-login \
 *   -H 'Content-Type: application/json' \
 *   -d '{"email":"admin@ccs.edu.hk","password":"<CCS-PWD>"}'
 */
import { NextResponse } from "next/server"
import { readClientIp, readUserAgent } from "@/lib/auth/client-ip"
import { safeReturnTo } from "@/lib/auth/return-to"
import { createAdminClient, createClient } from "@/lib/supabase/server"

type EmailLoginBody = {
  email?: unknown
  password?: unknown
  ip?: unknown
  user_agent?: unknown
  returnTo?: unknown
}

export async function POST(request: Request) {
  let body: EmailLoginBody = {}
  try {
    body = (await request.json()) as EmailLoginBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.trim() : ""
  const password = typeof body.password === "string" ? body.password : ""
  const returnTo = safeReturnTo(
    typeof body.returnTo === "string"
      ? body.returnTo
      : new URL(request.url).searchParams.get("returnTo"),
  )
  const ip = readClientIp(request, typeof body.ip === "string" ? body.ip : null)
  const userAgent = readUserAgent(
    request,
    typeof body.user_agent === "string" ? body.user_agent : null,
  )

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient()
  const { data: signInData, error: signInError } =
    await supabaseAdmin.auth.signInWithPassword({ email, password })

  if (signInError || !signInData.session) {
    return NextResponse.json(
      { error: signInError?.message || "Invalid email or password" },
      { status: 401 },
    )
  }

  const session = signInData.session

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", session.user.id)
    .maybeSingle()

  if (profile?.id) {
    const { error: auditError } = await supabaseAdmin.from("login_events").insert({
      profile_id: profile.id,
      method: "email",
      ip_address: ip,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    })
    if (auditError) {
      console.info("[email-login] audit error", auditError.message)
    }
  }

  const cookieClient = await createClient()
  const { error: setSessionError } = await cookieClient.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })

  if (setSessionError) {
    return NextResponse.json({ error: "Unable to store session" }, { status: 500 })
  }

  const response = NextResponse.json({
    ok: true,
    redirectTo: returnTo,
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: { id: session.user.id, email: session.user.email },
    },
  })
  response.headers.set("Location", returnTo)
  return response
}
