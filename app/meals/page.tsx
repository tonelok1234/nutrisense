import MealLogView from "@/components/meals/meal-log-view"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function MealsPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/auth/login")
  }
  
  // Fetch today's meals
  const today = new Date().toISOString().split("T")[0]
  
  const { data: meals, error: mealsError } = await supabase
    .from("meal_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("meal_date", today)
    .order("meal_time", { ascending: true })
  
  if (mealsError) {
    console.error("[v0] Error fetching meals:", mealsError)
  }
  
  return <MealLogView meals={meals || []} userId={user.id} />
}
