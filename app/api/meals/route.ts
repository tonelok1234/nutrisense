import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("meal_logs")
    .select(`
      *,
      meal_log_items (
        *,
        food_items (*)
      )
    `)
    .eq("user_id", user.id)
    .order("meal_date", { ascending: false })
    .order("meal_time", { ascending: false })

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
  const { meal_type, meal_date, meal_time, photo_url, notes, ai_analysis, items } = body

  // Create meal log
  const { data: mealLog, error: mealError } = await supabase
    .from("meal_logs")
    .insert({
      user_id: user.id,
      meal_type,
      meal_date: meal_date || new Date().toISOString().split("T")[0],
      meal_time: meal_time || new Date().toTimeString().split(" ")[0],
      photo_url,
      notes,
      ai_analysis,
    })
    .select()
    .single()

  if (mealError) {
    return NextResponse.json({ error: mealError.message }, { status: 500 })
  }

  // Add meal items if provided
  if (items && items.length > 0) {
    const mealItems = items.map((item: any) => ({
      meal_log_id: mealLog.id,
      food_item_id: item.food_item_id || null,
      quantity: item.quantity,
      unit: item.unit,
      manual_entry: item.manual_entry || null,
    }))

    const { error: itemsError } = await supabase
      .from("meal_log_items")
      .insert(mealItems)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }
  }

  return NextResponse.json(mealLog, { status: 201 })
}
