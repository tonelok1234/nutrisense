"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, ChevronUp, ChefHat, Search, Plus, Sparkles } from "lucide-react"
import GenerateRecipeDialog from "../recipes/generate-recipe-dialog"
import CreateRecipeDialog from "../recipes/create-recipe-dialog"
import RecipeCard from "../recipes/recipe-card"
import type { Recipe } from "@/lib/types"

interface RecipeWithMeta extends Recipe {
  favorite_recipes?: Array<{ user_id: string }>
  recipe_likes?: Array<{ count: number }>
  profiles?: { full_name: string | null } | null
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snacks"] as const
type MealType = (typeof MEAL_TYPES)[number]

const mealTypeLabels: Record<MealType, string> = {
  breakfast: "Frukost",
  lunch: "Lunsj",
  dinner: "Middag",
  snacks: "Snacks",
}

const diets = [
  { value: "all", label: "Alle diettar" },
  { value: "keto", label: "Keto" },
  { value: "lowcarb", label: "Lav-karbo" },
  { value: "paleo", label: "Paleo" },
  { value: "mediterranean", label: "Middelhavsdiett" },
  { value: "vegetarian", label: "Vegetar" },
  { value: "vegan", label: "Vegansk" },
  { value: "glutenfree", label: "Glutenfri" },
]

interface RecipesSectionProps {
  userId: string
}

export default function RecipesSection({ userId }: RecipesSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [recipes, setRecipes] = useState<RecipeWithMeta[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [diet, setDiet] = useState("all")
  const [excluded, setExcluded] = useState("")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<MealType>("breakfast")
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    if (expanded && recipes.length === 0) {
      fetchRecipes()
    }
  }, [expanded])

  const fetchRecipes = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (diet !== "all") params.set("tags", diet)
      const res = await fetch(`/api/recipes?${params}`)
      if (res.ok) {
        const data = await res.json()
        setRecipes(data)
      }
    } catch {
      // fail silently
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      !search ||
      recipe.title.toLowerCase().includes(search.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(search.toLowerCase())

    const matchesDiet = diet === "all" || recipe.tags?.includes(diet)

    const excludedList = excluded
      .toLowerCase()
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean)
    const matchesExclusion =
      excludedList.length === 0 ||
      !excludedList.some(
        (ingredient) =>
          recipe.title.toLowerCase().includes(ingredient) ||
          recipe.description?.toLowerCase().includes(ingredient),
      )

    const matchesCategory =
      category === "snacks"
        ? recipe.tags?.includes("snack") || recipe.tags?.includes("snacks")
        : recipe.tags?.includes(category) || true

    return matchesSearch && matchesDiet && matchesExclusion && matchesCategory
  })

  return (
    <Card>
      <CardHeader
        className="pb-2 px-3 sm:px-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm sm:text-base">Oppskrifter</CardTitle>
            <Badge variant="secondary" className="text-[10px]">Valfritt</Badge>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        <CardDescription className="text-xs">Finn inspirasjon til sunne måltid</CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="px-3 sm:px-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Vel diett</Label>
              <Select value={diet} onValueChange={setDiet}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Alle diettar" />
                </SelectTrigger>
                <SelectContent>
                  {diets.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Utelat ingrediensar</Label>
              <Input
                placeholder="t.d. nøtter, melk..."
                value={excluded}
                onChange={(e) => setExcluded(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søk oppskrifter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchRecipes()}
                className="pl-8 h-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setGenerateDialogOpen(true)}>
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={category} onValueChange={(v) => setCategory(v as MealType)}>
            <TabsList className="grid w-full grid-cols-4 h-8">
              {MEAL_TYPES.map((type) => (
                <TabsTrigger key={type} value={type} className="text-xs py-1">
                  {mealTypeLabels[type]}
                </TabsTrigger>
              ))}
            </TabsList>

            {MEAL_TYPES.map((type) => (
              <TabsContent key={type} value={type} className="mt-3">
                {isLoading ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Lastar...</p>
                ) : filteredRecipes.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Ingen oppskrifter funne. Prøv å generere ein med AI.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {filteredRecipes.slice(0, 6).map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} userId={userId} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      )}

      {generateDialogOpen && (
        <GenerateRecipeDialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen} />
      )}
      {createDialogOpen && (
        <CreateRecipeDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      )}
    </Card>
  )
}
