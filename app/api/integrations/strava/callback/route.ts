import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")
  const origin = url.origin
  const returnUrl = `${origin}/dashboard/integrations`

  if (error || !code) {
    return NextResponse.redirect(`${returnUrl}?strava_error=${error || "no_code"}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // Exchange authorization code for tokens
  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID?.trim(),
      client_secret: process.env.STRAVA_CLIENT_SECRET?.trim(),
      code,
      grant_type: "authorization_code",
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${returnUrl}?strava_error=token_exchange_failed`)
  }

  const tokens = await tokenRes.json()

  const athleteName = [tokens.athlete?.firstname, tokens.athlete?.lastname]
    .filter(Boolean)
    .join(" ")

  await supabase.from("user_integrations").upsert({
    user_id: user.id,
    integration_type: "strava",
    is_active: true,
    settings: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      athlete_id: tokens.athlete?.id,
      athlete_name: athleteName,
    },
    last_synced_at: new Date().toISOString(),
  }, {
    onConflict: "user_id,integration_type",
  })

  return NextResponse.redirect(`${returnUrl}?strava_connected=1`)
}
