import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const startOfDay = `${date}T00:00:00.000Z`
  const endOfDay = `${date}T23:59:59.999Z`

  // Fetch meals for the day
  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_at", startOfDay)
    .lte("logged_at", endOfDay)
    .order("logged_at", { ascending: true })

  // Fetch health metrics for the day
  const { data: healthMetrics } = await supabase
    .from("health_metrics")
    .select("*")
    .eq("user_id", user.id)
    .gte("recorded_at", startOfDay)
    .lte("recorded_at", endOfDay)
    .order("recorded_at", { ascending: true })

  // Fetch symptoms for the day
  const { data: symptoms } = await supabase
    .from("symptom_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_at", startOfDay)
    .lte("logged_at", endOfDay)
    .order("logged_at", { ascending: true })

  // Fetch medications for the day
  const { data: medications } = await supabase
    .from("medication_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_at", startOfDay)
    .lte("logged_at", endOfDay)
    .order("logged_at", { ascending: true })

  return NextResponse.json({
    meals: meals || [],
    healthMetrics: healthMetrics || [],
    symptoms: symptoms || [],
    medications: medications || [],
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { metric_type, value, unit, source } = body

  const { data, error } = await supabase
    .from("health_metrics")
    .insert({
      user_id: user.id,
      metric_type,
      value,
      unit,
      source: source || "manual",
      recorded_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
