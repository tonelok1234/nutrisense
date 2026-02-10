import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from("user_integrations")
    .upsert({
      user_id: user.id,
      integration_type: body.integration_type,
      is_active: body.is_active ?? true,
      settings: body.settings || {},
      last_synced_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,integration_type"
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const integrationType = searchParams.get("type")

  if (!integrationType) {
    return NextResponse.json({ error: "Integration type required" }, { status: 400 })
  }

  const { error } = await supabase
    .from("user_integrations")
    .delete()
    .eq("user_id", user.id)
    .eq("integration_type", integrationType)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
