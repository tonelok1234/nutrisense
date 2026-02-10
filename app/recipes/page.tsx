import RecipesView from "@/components/recipes/recipes-view"

const mockRecipes = [
  {
    id: "1",
    user_id: "mock-user-123",
    title: "Quinoa Buddha Bowl",
    description: "A colorful and nutritious bowl packed with plant-based protein and fresh vegetables",
    ingredients: ["quinoa", "chickpeas", "avocado", "kale", "cherry tomatoes", "tahini dressing"],
    instructions: [
      "Cook quinoa according to package directions",
      "Roast chickpeas with spices",
      "Massage kale with lemon juice",
      "Arrange all ingredients in a bowl",
      "Drizzle with tahini dressing",
    ],
    prep_time_minutes: 15,
    cook_time_minutes: 25,
    servings: 2,
    cuisine_type: "mediterranean",
    meal_type: "lunch",
    calories_per_serving: 450,
    protein_per_serving: 18,
    carbs_per_serving: 52,
    fat_per_serving: 20,
    is_public: true,
    created_at: new Date().toISOString(),
    profiles: { full_name: "Demo User" },
    recipe_likes: [],
    favorite_recipes: [],
  },
  {
    id: "2",
    user_id: "other-user",
    title: "Grilled Salmon with Asparagus",
    description: "Heart-healthy omega-3 rich meal with roasted vegetables",
    ingredients: ["salmon fillet", "asparagus", "lemon", "olive oil", "garlic", "herbs"],
    instructions: [
      "Preheat grill to medium-high",
      "Season salmon with herbs and lemon",
      "Toss asparagus with olive oil and garlic",
      "Grill salmon 4-5 minutes per side",
      "Roast asparagus until tender",
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 2,
    cuisine_type: "american",
    meal_type: "dinner",
    calories_per_serving: 380,
    protein_per_serving: 35,
    carbs_per_serving: 8,
    fat_per_serving: 22,
    is_public: true,
    created_at: new Date().toISOString(),
    profiles: { full_name: "Chef Maria" },
    recipe_likes: [],
    favorite_recipes: [],
  },
]

export default async function RecipesPage() {
  return <RecipesView recipes={mockRecipes} userId="mock-user-123" />
}
