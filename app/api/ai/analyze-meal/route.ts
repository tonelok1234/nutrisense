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
  const { description, imageUrl, diet } = body

  try {
    const prompt = `Analyze this meal and provide nutritional information.
${description ? `Meal description: ${description}` : ""}
${diet ? `User's diet preference: ${diet}` : ""}

Please respond with a JSON object containing:
{
  "foods": [
    { "name": "food name", "portion": "estimated portion", "calories": number, "protein": number, "carbs": number, "fat": number }
  ],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "healthScore": number (1-10),
  "suggestions": ["suggestion 1", "suggestion 2"],
  "dietCompatibility": "How well this meal fits the user's diet"
}

Only respond with valid JSON, no other text.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    // Parse the JSON response
    const analysis = JSON.parse(text)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("AI analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze meal. Please try again." },
      { status: 500 }
    )
  }
}
