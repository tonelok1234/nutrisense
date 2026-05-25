import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const createSymptomSchema = z.object({
  description: z.string().min(1).max(1000),
  severity: z.number().int().min(1).max(10).optional(),
  image_url: z.string().url().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("symptom_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rawBody = await request.json()
  const parsed = createSymptomSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { description, severity, image_url, notes } = parsed.data

  const { data, error } = await supabase
    .from("symptom_logs")
    .insert({
      user_id: user.id,
      description,
      severity: severity || 5,
      image_url,
      notes,
      logged_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
