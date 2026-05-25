import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const mealItemSchema = z.object({
  food_item_id: z.string().uuid().optional().nullable(),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  manual_entry: z.record(z.unknown()).optional().nullable(),
})

const createMealSchema = z.object({
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  meal_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  meal_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  photo_url: z.string().url().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  ai_analysis: z.record(z.unknown()).optional().nullable(),
  items: z.array(mealItemSchema).optional(),
})

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

  const rawBody = await request.json()
  const parsed = createMealSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { meal_type, meal_date, meal_time, photo_url, notes, ai_analysis, items } = parsed.data

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
    const mealItems = items.map((item) => ({
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
