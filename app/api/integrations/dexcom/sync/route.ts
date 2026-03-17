import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const DEXCOM_BASE = "https://sandbox-api.dexcom.com"

async function refreshDexcomToken(refreshToken: string, redirectUri: string) {
  const res = await fetch(`${DEXCOM_BASE}/v2/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DEXCOM_CLIENT_ID?.trim() ?? "",
      client_secret: process.env.DEXCOM_CLIENT_SECRET?.trim() ?? "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      redirect_uri: redirectUri,
    }),
  })
  if (!res.ok) return null
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>
}

function formatDexcomDate(date: Date): string {
  // Dexcom expects YYYY-MM-DDTHH:mm:ss (no timezone)
  return date.toISOString().slice(0, 19)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Ikkje innlogga" }, { status: 401 })
  }

  const { data: integration } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("integration_type", "dexcom")
    .single()

  if (!integration?.settings) {
    return NextResponse.json({ error: "Dexcom ikkje kopla til" }, { status: 400 })
  }

  let { access_token, refresh_token, expires_in, token_fetched_at } = integration.settings as Record<string, any>

  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/api/integrations/dexcom/callback`

  // Refresh token if expired (with 60-second buffer)
  const tokenAge = Math.floor(Date.now() / 1000) - (token_fetched_at ?? 0)
  if (tokenAge > (expires_in ?? 7200) - 60) {
    const newTokens = await refreshDexcomToken(refresh_token, redirectUri)
    if (!newTokens) {
      return NextResponse.json({ error: "Token-fornyelse feila – logg inn på nytt" }, { status: 401 })
    }
    access_token = newTokens.access_token
    refresh_token = newTokens.refresh_token
    expires_in = newTokens.expires_in

    await supabase.from("user_integrations").update({
      settings: { ...integration.settings, access_token, refresh_token, expires_in, token_fetched_at: Math.floor(Date.now() / 1000) },
    }).eq("user_id", user.id).eq("integration_type", "dexcom")
  }

  // Fetch last 30 days (or since last sync)
  const endDate = new Date()
  const startDate = integration.last_synced_at
    ? new Date(new Date(integration.last_synced_at).getTime() - 3600 * 1000)
    : new Date(Date.now() - 30 * 24 * 3600 * 1000)

  const egvUrl = new URL(`${DEXCOM_BASE}/v2/users/self/egvs`)
  egvUrl.searchParams.set("startDate", formatDexcomDate(startDate))
  egvUrl.searchParams.set("endDate", formatDexcomDate(endDate))

  const egvRes = await fetch(egvUrl.toString(), {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!egvRes.ok) {
    const err = await egvRes.text()
    return NextResponse.json({ error: `Dexcom API-feil: ${err}` }, { status: 500 })
  }

  const { egvs = [] } = await egvRes.json()

  // Upsert glucose readings into glucose_logs
  let synced = 0
  for (const reading of egvs) {
    if (!reading.value || reading.value < 20) continue // skip calibration/error readings

    const { error } = await supabase.from("glucose_logs").upsert({
      user_id: user.id,
      recorded_at: new Date(reading.systemTime + "Z").toISOString(),
      glucose_mgdl: reading.value,
      trend: reading.trend ?? null,
      source: "dexcom",
    }, { onConflict: "user_id,recorded_at" })

    if (!error) synced++
  }

  await supabase.from("user_integrations").update({
    last_synced_at: new Date().toISOString(),
  }).eq("user_id", user.id).eq("integration_type", "dexcom")

  return NextResponse.json({ synced, total: egvs.length })
}
