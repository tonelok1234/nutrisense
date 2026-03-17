import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

async function refreshToken(refreshToken: string) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })
  if (!res.ok) return null
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_at: number }>
}

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Ikkje innlogga" }, { status: 401 })
  }

  const { data: integration } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("integration_type", "strava")
    .single()

  if (!integration?.settings) {
    return NextResponse.json({ error: "Strava ikkje kopla til" }, { status: 400 })
  }

  let { access_token, refresh_token, expires_at, athlete_name } = integration.settings as Record<string, any>

  // Refresh token if expired (with 60-second buffer)
  if (Math.floor(Date.now() / 1000) > expires_at - 60) {
    const newTokens = await refreshToken(refresh_token)
    if (!newTokens) {
      return NextResponse.json({ error: "Token-fornyelse feila" }, { status: 500 })
    }
    access_token = newTokens.access_token
    refresh_token = newTokens.refresh_token
    expires_at = newTokens.expires_at

    await supabase.from("user_integrations").update({
      settings: { ...integration.settings, access_token, refresh_token, expires_at },
    }).eq("user_id", user.id).eq("integration_type", "strava")
  }

  // Determine fetch window: last 30 days on first sync, else since last sync
  const after = integration.last_synced_at
    ? Math.floor(new Date(integration.last_synced_at).getTime() / 1000) - 3600
    : Math.floor(Date.now() / 1000) - 30 * 24 * 3600

  const activitiesRes = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=50`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )

  if (!activitiesRes.ok) {
    return NextResponse.json({ error: "Klarte ikkje hente aktivitetar frå Strava" }, { status: 500 })
  }

  const activities: any[] = await activitiesRes.json()

  // Get already-synced Strava activity IDs to avoid duplicates
  const { data: existingLogs } = await supabase
    .from("exercise_logs")
    .select("notes")
    .eq("user_id", user.id)
    .like("notes", "[strava:%")

  const syncedIds = new Set(
    (existingLogs ?? []).map(l => {
      const m = l.notes?.match(/\[strava:(\d+)\]/)
      return m?.[1]
    }).filter(Boolean)
  )

  let synced = 0
  for (const activity of activities) {
    const stravaId = String(activity.id)
    if (syncedIds.has(stravaId)) continue

    const distanceKm = activity.distance ? (activity.distance / 1000).toFixed(1) : null
    const noteParts = [`[strava:${stravaId}]`, activity.name]
    if (distanceKm) noteParts.push(`– ${distanceKm} km`)

    await supabase.from("exercise_logs").insert({
      user_id: user.id,
      log_date: activity.start_date_local?.split("T")[0] ?? activity.start_date.split("T")[0],
      exercise_type: activity.type,
      duration_minutes: activity.moving_time ? Math.round(activity.moving_time / 60) : null,
      calories_burned: activity.kilojoules ? Math.round(activity.kilojoules * 0.239) : null,
      notes: noteParts.join(" "),
    })

    synced++
  }

  await supabase.from("user_integrations").update({
    last_synced_at: new Date().toISOString(),
  }).eq("user_id", user.id).eq("integration_type", "strava")

  return NextResponse.json({ synced, total: activities.length })
}
