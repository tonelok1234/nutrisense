"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface CreateRecipeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateRecipeDialog({ open, onOpenChange }: CreateRecipeDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [instructions, setInstructions] = useState("")
  const [prepTime, setPrepTime] = useState("")
  const [cookTime, setCookTime] = useState("")
  const [servings, setServings] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [tags, setTags] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        alert("Du må vere logga inn for å lage oppskrifter")
        return
      }
      // Parse ingredients from text
      const ingredientsList = ingredients
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const parts = line.trim().split(/\s+/)
          return {
            quantity: parts[0] || "",
            unit: parts[1] || "",
            name: parts.slice(2).join(" ") || line,
          }
        })

      // Parse instructions
      const instructionsList = instructions
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.trim())

      // Parse tags
      const tagsList = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)

      await supabase.from("recipes").insert({
        user_id: user.id,
        title,
        description,
        ingredients: ingredientsList,
        instructions: instructionsList,
        prep_time_minutes: Number.parseInt(prepTime) || null,
        cook_time_minutes: Number.parseInt(cookTime) || null,
        servings: Number.parseInt(servings) || null,
        difficulty,
        tags: tagsList,
        is_public: isPublic,
      })

      onOpenChange(false)
      router.refresh()

      // Reset form
      setTitle("")
      setDescription("")
      setIngredients("")
      setInstructions("")
      setPrepTime("")
      setCookTime("")
      setServings("")
      setTags("")
      setIsPublic(false)
    } catch (error) {
      console.error("[v0] Error creating recipe:", error)
      alert("Failed to create recipe. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Recipe</DialogTitle>
          <DialogDescription>Add your own recipe to your collection</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Recipe Name</Label>
              <Input
                id="title"
                placeholder="Grilled Chicken Salad"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A healthy and delicious chicken salad..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prepTime">Prep (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  placeholder="15"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cookTime">Cook (min)</Label>
                <Input
                  id="cookTime"
                  type="number"
                  placeholder="20"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  placeholder="4"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ingredients">Ingredients (one per line)</Label>
              <Textarea
                id="ingredients"
                placeholder="2 cups chicken breast, diced&#10;1 tbsp olive oil&#10;4 cups mixed greens"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions (one per line)</Label>
              <Textarea
                id="instructions"
                placeholder="Heat olive oil in a pan&#10;Cook chicken until golden&#10;Toss with greens and serve"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="healthy, high-protein, quick"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic">Share with community</Label>
              <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Recipe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
