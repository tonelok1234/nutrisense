"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Heart, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface RecipeCardProps {
  recipe: any
  userId: string
}

export default function RecipeCard({ recipe, userId }: RecipeCardProps) {
  const [isFavorited, setIsFavorited] = useState(
    recipe.favorite_recipes?.some((f: any) => f.user_id === userId) || false,
  )
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const toggleFavorite = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      if (isFavorited) {
        await supabase.from("favorite_recipes").delete().eq("user_id", userId).eq("recipe_id", recipe.id)
      } else {
        await supabase.from("favorite_recipes").insert({
          user_id: userId,
          recipe_id: recipe.id,
        })
      }
      setIsFavorited(!isFavorited)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error toggling favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)
  const likesCount = recipe.recipe_likes?.length || 0

  return (
    <Card className="flex flex-col">
      {recipe.photo_url && (
        <img
          src={recipe.photo_url || "/placeholder.svg"}
          alt={recipe.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 text-balance">{recipe.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">{recipe.description}</CardDescription>
          </div>
          {recipe.is_ai_generated && (
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3" />
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {totalTime} min
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recipe.servings} servings
            </div>
          )}
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={toggleFavorite} disabled={isLoading}>
          <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
          <span className="ml-1">{likesCount}</span>
        </Button>
        <Button asChild size="sm">
          <Link href={`/recipes/${recipe.id}`}>View Recipe</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
