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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Star, Search, Utensils } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SavedMeal {
  id: string
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
  usageCount?: number
  lastUsed?: string
}

interface QuickAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  savedMeals?: SavedMeal[]
  onSelectMeal?: (meal: SavedMeal) => void
}

export default function QuickAddDialog({
  open,
  onOpenChange,
  userId,
  savedMeals = [],
  onSelectMeal,
}: QuickAddDialogProps) {
  const [mealType, setMealType] = useState("breakfast")
  const [foodName, setFoodName] = useState("")
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("saved")
  const router = useRouter()

  const getRecentMeals = () => {
    return [...savedMeals]
      .sort((a, b) => {
        const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0
        const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 10)
  }

  const getFrequentMeals = () => {
    return [...savedMeals].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 10)
  }

  const getFilteredMeals = () => {
    if (!searchQuery.trim()) return savedMeals.slice(0, 20)
    return savedMeals.filter((meal) => meal.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const handleSelectSavedMeal = (meal: SavedMeal) => {
    if (onSelectMeal) {
      onSelectMeal(meal)
    } else {
      setFoodName(meal.name)
      setCalories(meal.calories.toString())
      setProtein(meal.protein_g.toString())
      setCarbs(meal.carbs_g.toString())
      setFats(meal.fats_g.toString())
      setActiveTab("manual")
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const today = new Date().toISOString().split("T")[0]
      const now = new Date().toTimeString().split(" ")[0]

      const { data: mealLog, error: mealError } = await supabase
        .from("meal_logs")
        .insert({
          user_id: userId,
          meal_type: mealType,
          meal_date: today,
          meal_time: now,
          notes: `Quick add: ${foodName}`,
          ai_analysis: {
            total_calories: Number.parseFloat(calories) || 0,
            total_protein: Number.parseFloat(protein) || 0,
            total_carbs: Number.parseFloat(carbs) || 0,
            total_fats: Number.parseFloat(fats) || 0,
          },
        })
        .select()
        .single()

      if (mealError) throw mealError

      onOpenChange(false)
      router.refresh()

      setFoodName("")
      setCalories("")
      setProtein("")
      setCarbs("")
      setFats("")
    } catch (error) {
      console.error("[v0] Error quick adding meal:", error)
      alert("Kunne ikkje legge til måltid. Prøv igjen.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hurtigregistrering</DialogTitle>
          <DialogDescription>Vel frå lagra måltid eller legg inn manuelt</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="saved" className="text-xs sm:text-sm">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Lagra
            </TabsTrigger>
            <TabsTrigger value="frequent" className="text-xs sm:text-sm">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Hyppige
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-xs sm:text-sm">
              <Utensils className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Manuell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-3 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søk i lagra måltid..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {savedMeals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Utensils className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Ingen lagra måltid enno. Registrer eit måltid for å lagre det her.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {getFilteredMeals().map((meal) => (
                  <Card
                    key={meal.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectSavedMeal(meal)}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{meal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {meal.calories} kcal | {meal.protein_g}g protein | {meal.carbs_g}g karbo | {meal.fats_g}g
                          feitt
                        </p>
                      </div>
                      {meal.usageCount && meal.usageCount > 1 && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {meal.usageCount}x
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="frequent" className="space-y-3 mt-4">
            {getFrequentMeals().length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Star className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Ingen hyppige måltid enno. Registrer same måltid fleire gongar for å sjå dei her.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {getFrequentMeals().map((meal) => (
                  <Card
                    key={meal.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectSavedMeal(meal)}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{meal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {meal.calories} kcal | {meal.protein_g}g protein
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs">{meal.usageCount || 1}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mealType" className="text-sm">
                  Måltidstype
                </Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Frukost</SelectItem>
                    <SelectItem value="lunch">Lunsj</SelectItem>
                    <SelectItem value="dinner">Middag</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="foodName" className="text-sm">
                  Matnamn
                </Label>
                <Input
                  id="foodName"
                  placeholder="t.d. Kyllingsalat"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="calories" className="text-sm">
                    Kalorier
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="0"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="protein" className="text-sm">
                    Protein (g)
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    placeholder="0"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="carbs" className="text-sm">
                    Karbo (g)
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="0"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fats" className="text-sm">
                    Feitt (g)
                  </Label>
                  <Input
                    id="fats"
                    type="number"
                    placeholder="0"
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Avbryt
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !foodName} className="w-full sm:w-auto">
                {isSubmitting ? "Legg til..." : "Legg til måltid"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
