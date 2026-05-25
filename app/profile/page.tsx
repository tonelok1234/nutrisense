import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProfileView from "@/components/profile/profile-view"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [profileResult, goalsResult, recipesCountResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("nutritional_goals").select("*").eq("user_id", user.id).single(),
    supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ])

  const profile = profileResult.data ?? null
  const goals = goalsResult.data ?? null
  const recipesCount = recipesCountResult.count ?? 0

  return (
    <ProfileView
      user={user}
      profile={profile}
      goals={goals}
      stats={{
        recipes: recipesCount,
        following: 0,
        followers: 0,
      }}
    />
  )
}
