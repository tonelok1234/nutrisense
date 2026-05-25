import type { User } from "@supabase/supabase-js"

export type { User }

export interface Profile {
  id: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  date_of_birth: string | null
  height_cm: number | null
  weight_kg: number | null
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null
  activity_level:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extra_active"
    | null
  dietary_preferences: string[] | null
  health_goals: string[] | null
  allergies: string[] | null
  created_at: string
  updated_at: string | null
}

export interface UserGoals {
  id: string
  user_id: string
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fats_g: number | null
  fiber_g: number | null
  water_ml: number | null
  sodium_mg: number | null
  sugar_g: number | null
}

export interface Recipe {
  id: string
  user_id: string
  title: string
  description: string | null
  ingredients: Array<{ name: string; quantity: string; unit: string }>
  instructions: string[]
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  servings: number | null
  nutritional_info: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
  } | null
  tags: string[] | null
  difficulty: "easy" | "medium" | "hard" | null
  photo_url: string | null
  is_ai_generated: boolean
  is_public: boolean
  created_at: string
}

export interface MealLogItem {
  id: string
  meal_log_id: string
  food_item_id: string | null
  quantity: number
  unit: string
  manual_entry: Record<string, unknown> | null
  food_items?: FoodItem | null
}

export interface FoodItem {
  id: string
  name: string
  brand: string | null
  calories_per_100g: number | null
  protein_per_100g: number | null
  carbs_per_100g: number | null
  fat_per_100g: number | null
}

export interface MealLog {
  id: string
  user_id: string
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  meal_date: string
  meal_time: string
  photo_url: string | null
  notes: string | null
  ai_analysis: {
    foods?: Array<{ name: string; portion: string; calories: number; protein: number; carbs: number; fat: number }>
    totalCalories?: number
    totalProtein?: number
    totalCarbs?: number
    totalFat?: number
    healthScore?: number
    suggestions?: string[]
    dietCompatibility?: string
  } | null
  meal_log_items?: MealLogItem[]
}

export interface MedicationLog {
  id: string
  user_id: string
  name: string
  dosage: string | null
  notes: string | null
  logged_at: string
}

export interface SymptomLog {
  id: string
  user_id: string
  description: string
  severity: number
  image_url: string | null
  notes: string | null
  logged_at: string
}
