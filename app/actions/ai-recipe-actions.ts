"use server"

import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const recipeSchema = z.object({
  title: z.string().describe("Creative and appetizing recipe name"),
  description: z.string().describe("Brief description of the dish"),
  ingredients: z
    .array(
      z.object({
        quantity: z.string().describe("Amount needed"),
        unit: z.string().describe("Measurement unit"),
        name: z.string().describe("Ingredient name"),
      }),
    )
    .describe("List of ingredients with quantities"),
  instructions: z.array(z.string()).describe("Step-by-step cooking instructions"),
  prep_time_minutes: z.number().describe("Preparation time in minutes"),
  cook_time_minutes: z.number().describe("Cooking time in minutes"),
  servings: z.number().describe("Number of servings"),
  difficulty: z.enum(["easy", "medium", "hard"]).describe("Recipe difficulty level"),
  tags: z.array(z.string()).describe("Relevant tags like dietary preferences, meal type, etc."),
  nutritional_info: z
    .object({
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fats: z.number(),
      fiber: z.number().optional(),
    })
    .describe("Nutritional information per serving"),
})

export async function generateRecipe({ prompt }: { prompt: string }) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error("Du må vere logga inn for å generere oppskrifter")
  }

  try {
    const { object: recipe } = await generateObject({
      model: openai("gpt-4o"),
      schema: recipeSchema,
      prompt: `Generate a detailed recipe based on this request: ${prompt}. Make it healthy, practical, and include accurate nutritional information per serving.`,
    })

    const { data, error } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        tags: recipe.tags,
        nutritional_info: recipe.nutritional_info,
        is_ai_generated: true,
        is_public: false,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, recipe: data }
  } catch (error) {
    console.error("[v0] Error generating recipe:", error)
    throw new Error("Failed to generate recipe")
  }
}

export async function generateMealPlan({
  days,
  preferences,
}: {
  days: number
  preferences?: string
}) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error("Du må vere logga inn for å generere måltidsplanar")
  }

  try {
    const mealPlanSchema = z.object({
      name: z.string().describe("Name for this meal plan"),
      meals: z
        .array(
          z.object({
            day: z.number().describe("Day number (1-7)"),
            meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
            recipe_title: z.string(),
            recipe_description: z.string(),
            ingredients: z.array(
              z.object({
                quantity: z.string(),
                unit: z.string(),
                name: z.string(),
              }),
            ),
            instructions: z.array(z.string()),
            prep_time_minutes: z.number(),
            cook_time_minutes: z.number(),
            servings: z.number(),
            difficulty: z.enum(["easy", "medium", "hard"]),
            tags: z.array(z.string()),
            nutritional_info: z.object({
              calories: z.number(),
              protein: z.number(),
              carbs: z.number(),
              fats: z.number(),
            }),
          }),
        )
        .describe("All meals for the entire meal plan"),
    })

    const { object: plan } = await generateObject({
      model: openai("gpt-4o"),
      schema: mealPlanSchema,
      prompt: `Create a ${days}-day meal plan with breakfast, lunch, and dinner for each day. ${preferences ? `User preferences: ${preferences}` : ""} Make it balanced, varied, and nutritious.`,
    })

    // Create meal plan
    const startDate = new Date().toISOString().split("T")[0]
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const { data: mealPlan, error: planError } = await supabase
      .from("meal_plans")
      .insert({
        user_id: user.id,
        name: plan.name,
        start_date: startDate,
        end_date: endDate,
        is_active: true,
        created_by_ai: true,
      })
      .select()
      .single()

    if (planError) throw planError

    // Create recipes and meal plan items
    for (const meal of plan.meals) {
      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          user_id: user.id,
          title: meal.recipe_title,
          description: meal.recipe_description,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          prep_time_minutes: meal.prep_time_minutes,
          cook_time_minutes: meal.cook_time_minutes,
          servings: meal.servings,
          difficulty: meal.difficulty,
          tags: meal.tags,
          nutritional_info: meal.nutritional_info,
          is_ai_generated: true,
          is_public: false,
        })
        .select()
        .single()

      if (recipeError) throw recipeError

      const mealDate = new Date(Date.now() + (meal.day - 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      await supabase.from("meal_plan_items").insert({
        meal_plan_id: mealPlan.id,
        recipe_id: recipe.id,
        meal_date: mealDate,
        meal_type: meal.meal_type,
      })
    }

    return { success: true, mealPlan }
  } catch (error) {
    console.error("[v0] Error generating meal plan:", error)
    throw new Error("Failed to generate meal plan")
  }
}
