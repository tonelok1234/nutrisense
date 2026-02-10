import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { mealType, diet, excludeIngredients, preferences } = body

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
