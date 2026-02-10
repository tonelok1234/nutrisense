"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, ChefHat, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface RecipeDetailViewProps {
  recipe: any
  userId: string
}

export default function RecipeDetailView({ recipe, userId }: RecipeDetailViewProps) {
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/recipes">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Recipes
        </Link>
      </Button>

      <div className="space-y-6">
        {recipe.photo_url && (
          <img
            src={recipe.photo_url || "/placeholder.svg"}
            alt={recipe.title}
            className="w-full h-96 object-cover rounded-lg"
          />
        )}

        <div>
          <h1 className="text-4xl font-bold text-balance mb-2">{recipe.title}</h1>
          <p className="text-lg text-muted-foreground">{recipe.description}</p>
          {recipe.profiles && (
            <p className="text-sm text-muted-foreground mt-2">By {recipe.profiles.full_name || "Anonymous"}</p>
          )}
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {recipe.prep_time_minutes && (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>
                Prep: <strong>{recipe.prep_time_minutes} min</strong>
              </span>
            </div>
          )}
          {recipe.cook_time_minutes && (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>
                Cook: <strong>{recipe.cook_time_minutes} min</strong>
              </span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>
                <strong>{recipe.servings}</strong> servings
              </span>
            </div>
          )}
          {recipe.difficulty && (
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-muted-foreground" />
              <Badge variant="outline" className="capitalize">
                {recipe.difficulty}
              </Badge>
            </div>
          )}
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {recipe.nutritional_info && (
          <Card>
            <CardHeader>
              <CardTitle>Nutritional Information</CardTitle>
              <CardDescription>Per serving</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{Math.round(recipe.nutritional_info.calories)}</p>
                  <p className="text-sm text-muted-foreground">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{Math.round(recipe.nutritional_info.protein)}g</p>
                  <p className="text-sm text-muted-foreground">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{Math.round(recipe.nutritional_info.carbs)}g</p>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{Math.round(recipe.nutritional_info.fats)}g</p>
                  <p className="text-sm text-muted-foreground">Fats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient: any, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="font-bold mr-3 text-primary">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
