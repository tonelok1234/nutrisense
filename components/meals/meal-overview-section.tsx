"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp } from "lucide-react"
import MealCard from "./meal-card"
import type { MealLog } from "@/lib/types"

const mealTypes = [
  { type: "breakfast", label: "Frukost", emoji: "🌅", bgClass: "bg-orange-100 dark:bg-orange-900" },
  { type: "lunch", label: "Lunsj", emoji: "☀️", bgClass: "bg-green-100 dark:bg-green-900" },
  { type: "dinner", label: "Middag", emoji: "🌙", bgClass: "bg-blue-100 dark:bg-blue-900" },
  { type: "snack", label: "Snacks", emoji: "🍎", bgClass: "bg-purple-100 dark:bg-purple-900" },
] as const

interface MealOverviewSectionProps {
  meals: MealLog[]
}

export default function MealOverviewSection({ meals }: MealOverviewSectionProps) {
  const [expanded, setExpanded] = useState(false)

  const getMealsByType = (type: string) => meals.filter((m) => m.meal_type === type)

  return (
    <Card>
      <CardHeader
        className="pb-3 px-3 sm:px-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base sm:text-lg">Dagens måltidsoversikt</CardTitle>
            <Badge variant="secondary" className="text-[10px]">Valfritt</Badge>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        <CardDescription className="text-xs">Alle måltida du har logga i dag</CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="px-3 sm:px-6 space-y-4">
          {mealTypes.map(({ type, label, emoji, bgClass }) => {
            const typeMeals = getMealsByType(type)
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg ${bgClass} flex items-center justify-center`}>
                    <span className="text-lg">{emoji}</span>
                  </div>
                  <h3 className="font-medium text-sm">{label}</h3>
                  <Badge variant="secondary" className="text-[10px]">{typeMeals.length}</Badge>
                </div>
                {typeMeals.length > 0 ? (
                  <div className="space-y-2 pl-10">
                    {typeMeals.map((meal) => (
                      <MealCard key={meal.id} meal={meal} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground pl-10">Ingen måltid logga</p>
                )}
              </div>
            )
          })}

          {meals.length > 0 && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Totalt i dag:</span>
                <span className="text-muted-foreground">{meals.length} måltid</span>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
