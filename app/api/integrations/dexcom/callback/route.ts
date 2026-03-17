import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const DEXCOM_BASE = "https://sandbox-api.dexcom.com"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")
  const origin = url.origin
  const returnUrl = `${origin}/health-integrations`

  if (error || !code) {
    return NextResponse.redirect(`${returnUrl}?dexcom_error=${error || "no_code"}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const redirectUri = `${origin}/api/integrations/dexcom/callback`

  // Dexcom uses application/x-www-form-urlencoded (not JSON)
  const tokenRes = await fetch(`${DEXCOM_BASE}/v2/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DEXCOM_CLIENT_ID?.trim() ?? "",
      client_secret: process.env.DEXCOM_CLIENT_SECRET?.trim() ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    console.error("Dexcom token error:", err)
    return NextResponse.redirect(`${returnUrl}?dexcom_error=token_exchange_failed`)
  }

  const tokens = await tokenRes.json()

  await supabase.from("user_integrations").upsert({
    user_id: user.id,
    integration_type: "dexcom",
    is_active: true,
    settings: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_fetched_at: Math.floor(Date.now() / 1000),
    },
    last_synced_at: new Date().toISOString(),
  }, {
    onConflict: "user_id,integration_type",
  })

  return NextResponse.redirect(`${returnUrl}?dexcom_connected=1`)
}
