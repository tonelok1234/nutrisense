import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Switch to https://api.dexcom.com when going to production
const DEXCOM_BASE = "https://sandbox-api.dexcom.com"

export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const clientId = process.env.DEXCOM_CLIENT_ID?.trim()
  if (!clientId) {
    return NextResponse.json({ error: "DEXCOM_CLIENT_ID mangler" }, { status: 500 })
  }

  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/api/integrations/dexcom/callback`

  const authUrl = new URL(`${DEXCOM_BASE}/v2/oauth2/login`)
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("scope", "offline_access")
  authUrl.searchParams.set("state", "dexcom_auth")

  return NextResponse.redirect(authUrl.toString())
}
