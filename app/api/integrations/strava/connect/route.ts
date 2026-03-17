import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const clientId = process.env.STRAVA_CLIENT_ID?.trim()
  if (!clientId) {
    return NextResponse.json({ error: "STRAVA_CLIENT_ID mangler" }, { status: 500 })
  }

  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/api/integrations/strava/callback`

  const stravaUrl = new URL("https://www.strava.com/oauth/authorize")
  stravaUrl.searchParams.set("client_id", clientId)
  stravaUrl.searchParams.set("redirect_uri", redirectUri)
  stravaUrl.searchParams.set("response_type", "code")
  stravaUrl.searchParams.set("approval_prompt", "auto")
  stravaUrl.searchParams.set("scope", "activity:read_all")

  return NextResponse.redirect(stravaUrl.toString())
}
