import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"
import { checkRateLimit } from "@/lib/rate-limit"

const analyzeMealSchema = z.object({
  description: z.string().min(1).max(2000).optional(),
  imageUrl: z.string().url().optional(),
  diet: z.string().max(100).optional(),
}).refine((data) => data.description || data.imageUrl, {
  message: "Either description or imageUrl is required",
})

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rateLimit = checkRateLimit(user.id, 10, 60 * 60 * 1000)
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
  const parsed = analyzeMealSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { description, imageUrl, diet } = parsed.data

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
