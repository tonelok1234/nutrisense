"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Sparkles, Clock, Users, ChefHat, Coffee, Sun, Moon, Cookie, Filter, X, Plus } from "lucide-react"
import GenerateRecipeDialog from "./generate-recipe-dialog"
import CreateRecipeDialog from "./create-recipe-dialog"

interface RecipesViewProps {
  recipes: any[]
  userId: string
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
  { value: "dairyfree", label: "Melkefri" },
  { value: "whole30", label: "Whole30" },
  { value: "dash", label: "DASH" },
  { value: "fodmap", label: "Lav-FODMAP" },
]

const mockRecipes = {
  breakfast: [
    {
      id: "b1",
      title: "Havregraut med bær",
      description: "Kremet havregraut med friske bær og honning",
      prep_time: 10,
      servings: 2,
      calories: 320,
      tags: ["vegetarian", "glutenfree"],
      image: "/oatmeal-with-berries.png",
    },
    {
      id: "b2",
      title: "Eggerøre med avokado",
      description: "Fluffy eggerøre med kremet avokado og tomatar",
      prep_time: 15,
      servings: 2,
      calories: 380,
      tags: ["keto", "lowcarb", "glutenfree"],
      image: "/scrambled-eggs-avocado.jpg",
    },
    {
      id: "b3",
      title: "Smoothie bowl",
      description: "Fargerik smoothie bowl med frukt og granola",
      prep_time: 10,
      servings: 1,
      calories: 290,
      tags: ["vegan", "vegetarian"],
      image: "/smoothie-bowl-fruit.jpg",
    },
    {
      id: "b4",
      title: "Pannekaker med banan",
      description: "Sunne pannekaker med banan og ahornsirup",
      prep_time: 20,
      servings: 4,
      calories: 350,
      tags: ["vegetarian"],
      image: "/banana-pancakes.jpg",
    },
  ],
  lunch: [
    {
      id: "l1",
      title: "Kyllingsalat med quinoa",
      description: "Proteinrik salat med grilla kylling og quinoa",
      prep_time: 25,
      servings: 2,
      calories: 450,
      tags: ["glutenfree", "mediterranean"],
      image: "/chicken-quinoa-salad.png",
    },
    {
      id: "l2",
      title: "Avokado wrap",
      description: "Frisk wrap med avokado, hummus og grønsaker",
      prep_time: 15,
      servings: 2,
      calories: 380,
      tags: ["vegan", "vegetarian"],
      image: "/avocado-wrap.jpg",
    },
    {
      id: "l3",
      title: "Laksepoké bowl",
      description: "Asiatisk-inspirert bowl med fersk laks og ris",
      prep_time: 20,
      servings: 2,
      calories: 520,
      tags: ["glutenfree", "dairyfree"],
      image: "/salmon-poke-bowl.png",
    },
    {
      id: "l4",
      title: "Tomatsupppe",
      description: "Varmande tomatsuppe med basilikum",
      prep_time: 30,
      servings: 4,
      calories: 180,
      tags: ["vegan", "vegetarian", "glutenfree"],
      image: "/tomato-soup-basil.jpg",
    },
  ],
  dinner: [
    {
      id: "d1",
      title: "Laks med grønsaker",
      description: "Ovnsbakt laks med sesonggrønsaker",
      prep_time: 35,
      servings: 4,
      calories: 480,
      tags: ["keto", "lowcarb", "glutenfree", "paleo"],
      image: "/baked-salmon-vegetables.png",
    },
    {
      id: "d2",
      title: "Pasta primavera",
      description: "Italiensk pasta med friske grønsaker",
      prep_time: 30,
      servings: 4,
      calories: 420,
      tags: ["vegetarian", "mediterranean"],
      image: "/pasta-primavera.png",
    },
    {
      id: "d3",
      title: "Kylling tikka masala",
      description: "Krydra indisk kyllingrett med ris",
      prep_time: 45,
      servings: 4,
      calories: 550,
      tags: ["glutenfree"],
      image: "/chicken-tikka-masala.png",
    },
    {
      id: "d4",
      title: "Vegetar curry",
      description: "Kremet curry med kikerter og spinat",
      prep_time: 40,
      servings: 4,
      calories: 380,
      tags: ["vegan", "vegetarian", "glutenfree"],
      image: "/vegetable-curry.png",
    },
  ],
  snacks: [
    {
      id: "s1",
      title: "Energikuler",
      description: "Sunne energikuler med dadlar og nøtter",
      prep_time: 15,
      servings: 12,
      calories: 85,
      tags: ["vegan", "glutenfree", "paleo"],
      image: "/energy-balls-dates.jpg",
    },
    {
      id: "s2",
      title: "Gresk yoghurt med honning",
      description: "Kremet yoghurt med honning og valnøtter",
      prep_time: 5,
      servings: 1,
      calories: 180,
      tags: ["vegetarian", "glutenfree"],
      image: "/greek-yogurt-honey.jpg",
    },
    {
      id: "s3",
      title: "Hummus med grønsaker",
      description: "Heimelaga hummus med sprø grønsaker",
      prep_time: 15,
      servings: 4,
      calories: 120,
      tags: ["vegan", "glutenfree"],
      image: "/hummus-vegetables.jpg",
    },
    {
      id: "s4",
      title: "Frukt og nøttebar",
      description: "Heimelaga bar med tørka frukt og nøtter",
      prep_time: 20,
      servings: 8,
      calories: 150,
      tags: ["vegan", "glutenfree"],
      image: "/fruit-nut-bar.jpg",
    },
  ],
}

export default function RecipesView({ recipes, userId }: RecipesViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDiet, setSelectedDiet] = useState("all")
  const [excludedIngredients, setExcludedIngredients] = useState("")
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filterRecipes = (recipeList: any[]) => {
    let filtered = recipeList

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by diet
    if (selectedDiet !== "all") {
      filtered = filtered.filter((recipe) => recipe.tags?.includes(selectedDiet))
    }

    // Filter by excluded ingredients
    if (excludedIngredients.trim()) {
      const excluded = excludedIngredients
        .toLowerCase()
        .split(",")
        .map((i) => i.trim())
      filtered = filtered.filter(
        (recipe) =>
          !excluded.some(
            (ingredient) =>
              recipe.title.toLowerCase().includes(ingredient) || recipe.description?.toLowerCase().includes(ingredient),
          ),
      )
    }

    return filtered
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "breakfast":
        return <Coffee className="h-4 w-4" />
      case "lunch":
        return <Sun className="h-4 w-4" />
      case "dinner":
        return <Moon className="h-4 w-4" />
      case "snacks":
        return <Cookie className="h-4 w-4" />
      default:
        return <ChefHat className="h-4 w-4" />
    }
  }

  const RecipeGridCard = ({ recipe }: { recipe: any }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={recipe.image || "/placeholder.svg"}
          alt={recipe.title}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-1">{recipe.title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{recipe.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{recipe.prep_time} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{recipe.servings} pers</span>
          </div>
          <span>{recipe.calories} kcal</span>
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                {diets.find((d) => d.value === tag)?.label || tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-balance">Oppskrifter</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Finn inspirasjon til sunne måltid</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setCreateDialogOpen(true)} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Legg til oppskrift
          </Button>
          <Button onClick={() => setGenerateDialogOpen(true)} className="flex-1 sm:flex-none">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generer
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">Filtrer oppskrifter</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Vel diett og utelat matvarer (valfritt)</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="sm:hidden">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className={`px-3 sm:px-6 space-y-4 ${!showFilters ? "hidden sm:block" : ""}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diet-select" className="text-xs sm:text-sm">
                Vel diett
              </Label>
              <Select value={selectedDiet} onValueChange={setSelectedDiet}>
                <SelectTrigger id="diet-select">
                  <SelectValue placeholder="Vel diett" />
                </SelectTrigger>
                <SelectContent>
                  {diets.map((diet) => (
                    <SelectItem key={diet.value} value={diet.value}>
                      {diet.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exclude-input" className="text-xs sm:text-sm">
                Utelat ingrediensar
              </Label>
              <div className="relative">
                <Input
                  id="exclude-input"
                  placeholder="t.d. nøtter, melk, gluten..."
                  value={excludedIngredients}
                  onChange={(e) => setExcludedIngredients(e.target.value)}
                />
                {excludedIngredients && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setExcludedIngredients("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Separer med komma for fleire ingrediensar</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk i oppskrifter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active filters display */}
          {(selectedDiet !== "all" || excludedIngredients) && (
            <div className="flex flex-wrap gap-2">
              {selectedDiet !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {diets.find((d) => d.value === selectedDiet)?.label}
                  <button onClick={() => setSelectedDiet("all")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {excludedIngredients &&
                excludedIngredients.split(",").map((ingredient, i) => (
                  <Badge key={i} variant="outline" className="gap-1 text-red-600">
                    Utan: {ingredient.trim()}
                  </Badge>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="breakfast" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="breakfast" className="text-xs sm:text-sm py-2 px-1 sm:px-3 gap-1">
            <Coffee className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" />
            Frukost
          </TabsTrigger>
          <TabsTrigger value="lunch" className="text-xs sm:text-sm py-2 px-1 sm:px-3 gap-1">
            <Sun className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" />
            Lunsj
          </TabsTrigger>
          <TabsTrigger value="dinner" className="text-xs sm:text-sm py-2 px-1 sm:px-3 gap-1">
            <Moon className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" />
            Middag
          </TabsTrigger>
          <TabsTrigger value="snacks" className="text-xs sm:text-sm py-2 px-1 sm:px-3 gap-1">
            <Cookie className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" />
            Snacks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breakfast" className="mt-4 sm:mt-6">
          {filterRecipes(mockRecipes.breakfast).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterRecipes(mockRecipes.breakfast).map((recipe) => (
                <RecipeGridCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Coffee className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Ingen frukostoppskrifter funne med valde filter</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDiet("all")
                    setExcludedIngredients("")
                  }}
                >
                  Nullstill filter
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lunch" className="mt-4 sm:mt-6">
          {filterRecipes(mockRecipes.lunch).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterRecipes(mockRecipes.lunch).map((recipe) => (
                <RecipeGridCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sun className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Ingen lunsjoppskrifter funne med valde filter</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDiet("all")
                    setExcludedIngredients("")
                  }}
                >
                  Nullstill filter
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dinner" className="mt-4 sm:mt-6">
          {filterRecipes(mockRecipes.dinner).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterRecipes(mockRecipes.dinner).map((recipe) => (
                <RecipeGridCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Moon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Ingen middagsoppskrifter funne med valde filter</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDiet("all")
                    setExcludedIngredients("")
                  }}
                >
                  Nullstill filter
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="snacks" className="mt-4 sm:mt-6">
          {filterRecipes(mockRecipes.snacks).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterRecipes(mockRecipes.snacks).map((recipe) => (
                <RecipeGridCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Cookie className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Ingen snacks-oppskrifter funne med valde filter</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDiet("all")
                    setExcludedIngredients("")
                  }}
                >
                  Nullstill filter
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <GenerateRecipeDialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen} />
      <CreateRecipeDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}
