import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import RecipesView from "@/components/recipes/recipes-view"

export default async function RecipesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: recipes } = await supabase
    .from("recipes")
    .select(`
      *,
      profiles (full_name),
      recipe_likes (count),
      recipe_comments (count)
    `)
    .or(`is_public.eq.true,user_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  return <RecipesView recipes={recipes || []} userId={user.id} />
}
