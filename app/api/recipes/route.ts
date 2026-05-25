import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const createRecipeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  ingredients: z.array(z.record(z.unknown())).min(1),
  instructions: z.array(z.string()).min(1),
  prep_time_minutes: z.number().int().nonnegative().optional().nullable(),
  cook_time_minutes: z.number().int().nonnegative().optional().nullable(),
  servings: z.number().int().positive().optional().nullable(),
  nutritional_info: z.record(z.unknown()).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
  is_ai_generated: z.boolean().optional(),
  is_public: z.boolean().optional(),
})

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const tags = searchParams.get("tags")?.split(",").filter(Boolean)
  const search = searchParams.get("search")
  const publicOnly = searchParams.get("public") === "true"

  let query = supabase
    .from("recipes")
    .select(`
      *,
      profiles (full_name),
      recipe_likes (count),
      recipe_comments (count)
    `)

  // Show public recipes or user's own recipes
  if (user && !publicOnly) {
    query = query.or(`is_public.eq.true,user_id.eq.${user.id}`)
  } else {
    query = query.eq("is_public", true)
  }

  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  if (tags && tags.length > 0) {
    query = query.overlaps("tags", tags)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

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
  const parsed = createRecipeSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const body = parsed.data

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title: body.title,
      description: body.description,
      ingredients: body.ingredients,
      instructions: body.instructions,
      prep_time_minutes: body.prep_time_minutes,
      cook_time_minutes: body.cook_time_minutes,
      servings: body.servings,
      nutritional_info: body.nutritional_info,
      tags: body.tags,
      difficulty: body.difficulty,
      photo_url: body.photo_url,
      is_ai_generated: body.is_ai_generated ?? false,
      is_public: body.is_public ?? false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
