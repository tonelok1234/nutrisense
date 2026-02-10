"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"
import { generateRecipe } from "@/app/actions/ai-recipe-actions"

interface GenerateRecipeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function GenerateRecipeDialog({ open, onOpenChange }: GenerateRecipeDialogProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      await generateRecipe({ prompt }) // Use userId from props
      onOpenChange(false)
      router.refresh()
      setPrompt("")
    } catch (error) {
      console.error("[v0] Error generating recipe:", error)
      alert("Failed to generate recipe. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recipe Generator
          </DialogTitle>
          <DialogDescription>Describe the type of recipe you want and let AI create it for you</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt">Recipe Request</Label>
            <Textarea
              id="prompt"
              placeholder="Create a high-protein, low-carb dinner recipe with chicken and vegetables that takes less than 30 minutes"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Try including:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Dietary preferences or restrictions</li>
              <li>Main ingredients you want to use</li>
              <li>Meal type and cooking time</li>
              <li>Nutritional goals</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Recipe
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
