import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateProfileSchema = z.object({
  full_name: z.string().max(200).optional().nullable(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  height_cm: z.number().positive().max(300).optional().nullable(),
  weight_kg: z.number().positive().max(500).optional().nullable(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().nullable(),
  activity_level: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"]).optional().nullable(),
  dietary_preferences: z.array(z.string()).optional().nullable(),
  health_goals: z.array(z.string()).optional().nullable(),
  allergies: z.array(z.string()).optional().nullable(),
})

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || { id: user.id, email: user.email })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rawBody = await request.json()
  const parsed = updateProfileSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const body = parsed.data

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: body.full_name,
      date_of_birth: body.date_of_birth,
      height_cm: body.height_cm,
      weight_kg: body.weight_kg,
      gender: body.gender,
      activity_level: body.activity_level,
      dietary_preferences: body.dietary_preferences,
      health_goals: body.health_goals,
      allergies: body.allergies,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
