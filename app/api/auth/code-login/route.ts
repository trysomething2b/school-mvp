/**
 * Card-code login.
 *
 * curl -X POST http://localhost:3000/api/auth/code-login \
 *   -H 'Content-Type: application/json' \
 *   -d '{"code":"KD-7391","ip":"127.0.0.1","user_agent":"curl/8.0","_debug_log":true}'
 *
 * curl -X POST http://localhost:3000/api/auth/code-login \
 *   -H 'Content-Type: application/json' \
 *   -d '{"code":"BAD-CODE","user_agent":"curl/8.0"}'
 */
import { NextResponse } from "next/server"
import { readClientIp, readUserAgent } from "@/lib/auth/client-ip"
import { formatCardCode } from "@/lib/auth/card-code"
import { safeReturnTo } from "@/lib/auth/return-to"
import { createAdminClient, createClient } from "@/lib/supabase/server"

type CodeLoginBody = {
  code?: unknown
  ip?: unknown
  user_agent?: unknown
  _debug_log?: unknown
  returnTo?: unknown
}

type ProfileRow = {
  id: string
  email: string | null
  sso_secret: string | null
  role: string | null
  school_id: string | null
  full_name: string | null
}

export async function POST(request: Request) {
  let body: CodeLoginBody = {}
  try {
    body = (await request.json()) as CodeLoginBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const debug = body._debug_log === true
  const code = typeof body.code === "string" ? formatCardCode(body.code.trim()) : ""
  const bodyIp = typeof body.ip === "string" ? body.ip : null
  const bodyUa = typeof body.user_agent === "string" ? body.user_agent : null
  const returnTo = safeReturnTo(
    typeof body.returnTo === "string" ? body.returnTo : new URL(request.url).searchParams.get("returnTo"),
  )
  const ip = readClientIp(request, bodyIp)
  const userAgent = readUserAgent(request, bodyUa)

  if (debug) {
    console.info("[code-login] request", {
      code,
      ip,
      user_agent: userAgent,
      returnTo,
    })
  }

  if (!code) {
    return jsonError("Card code is required", 400, debug)
  }

  const supabaseAdmin = createAdminClient()

  const { data: profile, error: lookupError } = await supabaseAdmin
    .from("profiles")
    .select("id, sso_secret, role, school_id, full_name")
    .eq("card_token", code)
    .eq("is_card_active", true)
    .maybeSingle()

  if (lookupError) {
    console.info("[code-login] lookup error", lookupError.message)
    return jsonError("Unable to verify card code", 500, debug)
  }

  const row = profile as ProfileRow | null
  if (!row) {
    return jsonError("Invalid or inactive card code", 401, debug)
  }

  let email = row.email
  if (!email) {
    const { data: authUser, error: authLookupError } =
      await supabaseAdmin.auth.admin.getUserById(row.id)
    if (authLookupError || !authUser.user?.email) {
      return jsonError("Card is not linked to a login email", 401, debug)
    }
    email = authUser.user.email
  }

  if (!row.sso_secret) {
    return jsonError("Card is not linked to a login secret", 401, debug)
  }

  const { data: signInData, error: signInError } =
    await supabaseAdmin.auth.signInWithPassword({
      email,
      password: row.sso_secret,
    })

  if (signInError || !signInData.session) {
    return jsonError(signInError?.message || "Sign-in failed", 401, debug)
  }

  const session = signInData.session

  const { error: auditError } = await supabaseAdmin.from("login_events").insert({
    profile_id: row.id,
    method: "code",
    ip_address: ip,
    user_agent: userAgent,
    created_at: new Date().toISOString(),
  })

  if (auditError) {
    console.info("[code-login] audit error", auditError.message)
  }

  const cookieClient = await createClient()
  const { error: setSessionError } = await cookieClient.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })

  if (setSessionError) {
    return jsonError("Unable to store session", 500, debug)
  }

  const payload: Record<string, unknown> = {
    ok: true,
    redirectTo: returnTo,
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: { id: session.user.id, email: session.user.email },
    },
  }

  if (debug) {
    payload.debug = {
      profile: { id: row.id, email, role: row.role },
    }
    console.info("[code-login] response", payload)
  }

  const response = NextResponse.json(payload, { status: 200 })
  response.headers.set("Location", returnTo)
  return response
}

function jsonError(error: string, status: number, debug: boolean) {
  const body = { error }
  if (debug) {
    console.info("[code-login] response", body)
  }
  return NextResponse.json(body, { status })
}
