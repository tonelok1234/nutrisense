"use server"

import { createClient } from "@/lib/supabase/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const PROTOTYPE_MODE = false

interface MealAnalysis {
  items: Array<{
    name: string
    quantity?: string
    calories: number
    protein: number
    carbs: number
    fats: number
    fiber?: number
  }>
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fats: number
  total_fiber?: number
  health_score: number
  recommendations?: string
}

// Mock analysis for prototype mode
function getMockAnalysis(description: string): MealAnalysis {
  const lowerDesc = description.toLowerCase()

  // Generate contextual mock data based on description
  if (lowerDesc.includes("laks") || lowerDesc.includes("salmon") || lowerDesc.includes("fisk")) {
    return {
      items: [
        { name: "Grilla laks", quantity: "150g", calories: 280, protein: 35, carbs: 0, fats: 15, fiber: 0 },
        { name: "Brokkoli", quantity: "100g", calories: 35, protein: 3, carbs: 7, fats: 0, fiber: 3 },
        { name: "Søtpotet", quantity: "150g", calories: 130, protein: 2, carbs: 30, fats: 0, fiber: 4 },
      ],
      total_calories: 445,
      total_protein: 40,
      total_carbs: 37,
      total_fats: 15,
      total_fiber: 7,
      health_score: 9,
      recommendations: "Utmerka val! Rik på omega-3 og protein. Vurder å legge til meir grønsaker for fiber.",
    }
  }

  if (lowerDesc.includes("salat") || lowerDesc.includes("salad")) {
    return {
      items: [
        { name: "Blanda salat", quantity: "200g", calories: 30, protein: 2, carbs: 5, fats: 0, fiber: 3 },
        { name: "Kylling", quantity: "120g", calories: 165, protein: 31, carbs: 0, fats: 4, fiber: 0 },
        { name: "Olivenolje", quantity: "15ml", calories: 120, protein: 0, carbs: 0, fats: 14, fiber: 0 },
      ],
      total_calories: 315,
      total_protein: 33,
      total_carbs: 5,
      total_fats: 18,
      total_fiber: 3,
      health_score: 8,
      recommendations: "Lett og næringsrik! Legg til nøtter eller frø for meir sunne fettsyrer.",
    }
  }

  if (lowerDesc.includes("pizza")) {
    return {
      items: [
        { name: "Pizza (2 skiver)", quantity: "200g", calories: 540, protein: 22, carbs: 60, fats: 24, fiber: 3 },
      ],
      total_calories: 540,
      total_protein: 22,
      total_carbs: 60,
      total_fats: 24,
      total_fiber: 3,
      health_score: 5,
      recommendations: "Moderat helsescore. Prøv fullkornbunn og meir grønsaker neste gong.",
    }
  }

  if (lowerDesc.includes("frukost") || lowerDesc.includes("egg") || lowerDesc.includes("breakfast")) {
    return {
      items: [
        { name: "Eggerøre", quantity: "2 egg", calories: 180, protein: 12, carbs: 2, fats: 14, fiber: 0 },
        { name: "Fullkornbrød", quantity: "2 skiver", calories: 160, protein: 6, carbs: 28, fats: 2, fiber: 4 },
        { name: "Avokado", quantity: "50g", calories: 80, protein: 1, carbs: 4, fats: 7, fiber: 3 },
      ],
      total_calories: 420,
      total_protein: 19,
      total_carbs: 34,
      total_fats: 23,
      total_fiber: 7,
      health_score: 8,
      recommendations: "God start på dagen! Balansert med protein og sunne fettsyrer.",
    }
  }

  if (lowerDesc.includes("pasta") || lowerDesc.includes("spaghetti")) {
    return {
      items: [
        { name: "Pasta", quantity: "200g", calories: 260, protein: 8, carbs: 52, fats: 2, fiber: 2 },
        { name: "Kjøttsaus", quantity: "150g", calories: 180, protein: 15, carbs: 10, fats: 8, fiber: 2 },
        { name: "Parmesan", quantity: "20g", calories: 80, protein: 7, carbs: 1, fats: 5, fiber: 0 },
      ],
      total_calories: 520,
      total_protein: 30,
      total_carbs: 63,
      total_fats: 15,
      total_fiber: 4,
      health_score: 6,
      recommendations: "Velbalansert! Vurder fullkornpasta for meir fiber og næringsstoff.",
    }
  }

  // Default analysis for unrecognized meals
  return {
    items: [
      {
        name: description || "Ukjent måltid",
        quantity: "1 porsjon",
        calories: 400,
        protein: 20,
        carbs: 45,
        fats: 15,
        fiber: 5,
      },
    ],
    total_calories: 400,
    total_protein: 20,
    total_carbs: 45,
    total_fats: 15,
    total_fiber: 5,
    health_score: 7,
    recommendations: "Registrer meir detaljar for nøyaktigare analyse. Prøv å inkludere alle ingrediensar.",
  }
}

export async function analyzeMealPhoto({
  mealType,
  description,
  photoData,
}: {
  mealType: string
  description: string
  photoData?: string | null
}) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  const userId = user?.id || ""; // Declare userId variable
  
  if (authError || !user) {
    throw new Error("Du må vere logga inn for å logge måltid")
  }

  try {
    let analysis: MealAnalysis

    if (PROTOTYPE_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay
      analysis = getMockAnalysis(description)
    } else {
      // Real AI analysis would go here
      const mealAnalysisSchema = z.object({
        items: z.array(
          z.object({
            name: z.string(),
            quantity: z.string().optional(),
            calories: z.number(),
            protein: z.number(),
            carbs: z.number(),
            fats: z.number(),
            fiber: z.number().optional(),
          }),
        ),
        total_calories: z.number(),
        total_protein: z.number(),
        total_carbs: z.number(),
        total_fats: z.number(),
        total_fiber: z.number().optional(),
        health_score: z.number().min(1).max(10),
        recommendations: z.string().optional(),
      })

      // Check if we have enough information
      if (!description && !photoData) {
        return {
          success: false,
          error: "Skriv inn kva du har ete, eller last opp eit bilete av måltidet.",
          needsMoreInfo: true,
        }
      }

      const userContent: any[] = [
        {
          type: "text",
          text: description
            ? `Analyser dette måltidet: ${description}`
            : "Analyser måltidet på biletet.",
        },
      ]

      if (photoData) {
        userContent.push({ type: "image", image: photoData })
      }

      const result = await generateObject({
        model: openai("gpt-4o"),
        schema: mealAnalysisSchema,
        system: `Du er ein ernæringsassistent. Analyser måltidet basert KUN på informasjonen som er gitt.

VIKTIGE REGLAR:
1. IKKJE dikta opp mengder eller ingrediensar som ikkje er nemnt
2. Om mengde ikkje er oppgitt, set quantity til "ukjent mengde" og bruk gjennomsnittlege verdiar for ein typisk porsjon
3. Om du er usikker, set health_score til 5 og skriv i recommendations at meir detaljert logging vil gi betre analyse
4. Berre inkluder ingrediensar som er eksplisitt nemnt eller tydeleg synlege på biletet
5. Svar alltid på norsk (nynorsk)`,
        messages: [{ role: "user", content: userContent }],
      })
      analysis = result.object
      
      // Add warning if description was vague
      if (description && description.split(' ').length < 3 && !photoData) {
        analysis.recommendations = `For meir nøyaktig analyse, beskriv mengder og alle ingrediensar. ${analysis.recommendations || ""}`
      }
    }

    // Save to database
    const today = new Date().toISOString().split("T")[0]
    const now = new Date().toTimeString().split(" ")[0]

    const { data: mealLog, error: mealError } = await supabase
      .from("meal_logs")
      .insert({
        user_id: user.id,
        meal_type: mealType,
        meal_date: today,
        meal_time: now,
        photo_url: photoData || null,
        ai_analysis: analysis,
        notes: description || null,
      })
      .select()
      .single()

    if (mealError) throw mealError

    return { success: true, analysis, mealLog }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[v0] Error analyzing meal:", message)
    throw new Error(message)
  }
}

export async function getMealInsights(userId: string, dateRange: { start: string; end: string }) {
  const supabase = await createClient()

  const { data: meals, error } = await supabase
    .from("meal_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("meal_date", dateRange.start)
    .lte("meal_date", dateRange.end)

  if (error) throw error

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFats = 0
  let avgHealthScore = 0

  meals?.forEach((meal) => {
    if (meal.ai_analysis) {
      totalCalories += meal.ai_analysis.total_calories || 0
      totalProtein += meal.ai_analysis.total_protein || 0
      totalCarbs += meal.ai_analysis.total_carbs || 0
      totalFats += meal.ai_analysis.total_fats || 0
      avgHealthScore += meal.ai_analysis.health_score || 0
    }
  })

  const mealCount = meals?.length || 1

  return {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFats,
    avgHealthScore: avgHealthScore / mealCount,
    mealCount,
  }
}
