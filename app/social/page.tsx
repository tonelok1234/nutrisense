import SocialView from "@/components/social/social-view"

const mockUsers = [
  {
    id: "user-1",
    full_name: "Sarah Johnson",
    bio: "Fitness enthusiast and meal prep expert",
    avatar_url: null,
    dietary_preferences: ["vegetarian"],
    health_goals: ["weight_loss", "muscle_gain"],
  },
  {
    id: "user-2",
    full_name: "Mike Chen",
    bio: "Running marathons and eating clean",
    avatar_url: null,
    dietary_preferences: ["pescatarian"],
    health_goals: ["improve_energy", "better_sleep"],
  },
  {
    id: "user-3",
    full_name: "Emma Wilson",
    bio: "Plant-based nutritionist helping others thrive",
    avatar_url: null,
    dietary_preferences: ["vegan"],
    health_goals: ["maintain_weight", "improve_digestion"],
  },
]

export default async function SocialPage() {
  return <SocialView users={mockUsers} userId="mock-user-123" followingIds={[]} followerIds={[]} />
}
