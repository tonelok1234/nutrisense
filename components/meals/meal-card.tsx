"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Sparkles } from "lucide-react"
import type { MealLog } from "@/lib/types"

interface MealCardProps {
  meal: MealLog
}

export default function MealCard({ meal }: MealCardProps) {
  const analysis = meal.ai_analysis

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="capitalize">{meal.meal_type}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3" />
              {meal.meal_time
                ? new Date(`2000-01-01T${meal.meal_time}`).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Time not set"}
            </CardDescription>
          </div>
          {analysis && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Analyzed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meal.photo_url && (
            <img
              src={meal.photo_url || "/placeholder.svg"}
              alt="Meal"
              className="w-full h-48 object-cover rounded-md"
            />
          )}

          {analysis && (
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-md">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{Math.round(analysis.total_calories || 0)}</p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{Math.round(analysis.total_protein || 0)}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{Math.round(analysis.total_carbs || 0)}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{Math.round(analysis.total_fats || 0)}g</p>
                <p className="text-xs text-muted-foreground">Fats</p>
              </div>
            </div>
          )}

          {analysis?.items && analysis.items.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Detected Foods:</h4>
              <ul className="space-y-1">
                {analysis.items.map((item: { name: string; quantity?: string }, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {item.name} {item.quantity && `(${item.quantity})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meal.notes && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Notes:</h4>
              <p className="text-sm text-muted-foreground">{meal.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
