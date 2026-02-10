import ProfileView from "@/components/profile/profile-view"

const mockUser = {
  id: "mock-user-123",
  email: "demo@nutrisense.com",
}

const mockProfile = {
  id: "mock-user-123",
  full_name: "Demo User",
  bio: "Health enthusiast exploring NutriSense and living a balanced lifestyle",
  avatar_url: null,
  dietary_preferences: ["vegetarian", "gluten_free"],
  allergies: ["nuts"],
  health_goals: ["weight_loss", "more_energy", "better_sleep"],
  created_at: new Date().toISOString(),
}

const mockGoals = {
  user_id: "mock-user-123",
  daily_calories: 2000,
  daily_protein: 150,
  daily_carbs: 200,
  daily_fat: 65,
  daily_water_ml: 2000,
}

export default async function ProfilePage() {
  return (
    <ProfileView
      user={mockUser}
      profile={mockProfile}
      goals={mockGoals}
      stats={{
        recipes: 5,
        following: 12,
        followers: 8,
      }}
    />
  )
}
