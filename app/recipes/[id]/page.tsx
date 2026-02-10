import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import RecipeDetailView from "@/components/recipes/recipe-detail-view"

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select(
      `
      *,
      profiles!recipes_user_id_fkey (full_name)
    `,
    )
    .eq("id", id)
    .single()

  if (!recipe) {
    redirect("/recipes")
  }

  return <RecipeDetailView recipe={recipe} userId={user.id} />
}
