import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"
import { checkRateLimit } from "@/lib/rate-limit"

const generateRecipeSchema = z.object({
  mealType: z.string().max(50).optional(),
  diet: z.string().max(100).optional(),
  excludeIngredients: z.array(z.string().max(100)).max(20).optional(),
  preferences: z.string().max(500).optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rateLimit = checkRateLimit(user.id, 5, 60 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "For mange førespurnader. Prøv igjen om ei stund." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) },
      },
    )
  }

  const rawBody = await request.json()
  const parsed = generateRecipeSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { mealType, diet, excludeIngredients, preferences } = parsed.data

  try {
    const prompt = `Generate a healthy recipe with the following requirements:
- Meal type: ${mealType || "any"}
- Diet: ${diet || "no restrictions"}
${excludeIngredients?.length ? `- Exclude these ingredients: ${excludeIngredients.join(", ")}` : ""}
${preferences ? `- Additional preferences: ${preferences}` : ""}

Please respond with a JSON object containing:
{
  "title": "Recipe title",
  "description": "Brief description",
  "ingredients": [
    { "name": "ingredient", "quantity": "amount", "unit": "unit" }
  ],
  "instructions": ["step 1", "step 2", ...],
  "prep_time_minutes": number,
  "cook_time_minutes": number,
  "servings": number,
  "nutritional_info": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number
  },
  "tags": ["tag1", "tag2"],
  "difficulty": "easy" | "medium" | "hard"
}

Only respond with valid JSON, no other text.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    // Parse the JSON response
    const recipe = JSON.parse(text)
    recipe.is_ai_generated = true

    return NextResponse.json(recipe)
  } catch (error) {
    console.error("AI recipe generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate recipe. Please try again." },
      { status: 500 }
    )
  }
}
