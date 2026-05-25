"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pill, HeartPulse, ChevronDown, ChevronUp } from "lucide-react"
import AddMealDialog from "./add-meal-dialog"
import MedicationDialog from "./medication-dialog"
import SymptomDialog from "./symptom-dialog"
import AiAnalysisSection from "./ai-analysis-section"
import RecipesSection from "./recipes-section"
import ActivitySection from "./activity-section"
import HealthAnalyticsSection from "./health-analytics-section"
import MealOverviewSection from "./meal-overview-section"
import type { MealLog } from "@/lib/types"

interface MealLogViewProps {
  meals: MealLog[]
  userId: string
}

export default function MealLogView({ meals, userId }: MealLogViewProps) {
  const [addMealOpen, setAddMealOpen] = useState(false)
  const [medicationOpen, setMedicationOpen] = useState(false)
  const [symptomOpen, setSymptomOpen] = useState(false)
  const [mainSectionExpanded, setMainSectionExpanded] = useState(true)

  const mealTypeLabels: Record<string, string> = {
    breakfast: "Frukost",
    lunch: "Lunsj",
    dinner: "Middag",
    snack: "Snack",
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 max-w-7xl">
      <div className="flex flex-col gap-2 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          NutriSense
        </h1>
        <p className="text-sm sm:text-base font-semibold text-foreground">
          Logg måltid, medikament, symptom og aktivitet. Analyser korleis kroppen din responderar.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader
          className="pb-3 px-3 sm:px-6 cursor-pointer"
          onClick={() => setMainSectionExpanded(!mainSectionExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Logg og sporing</CardTitle>
            {mainSectionExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>

        {mainSectionExpanded && (
          <CardContent className="px-3 sm:px-6 space-y-4">
            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Button
                onClick={() => setAddMealOpen(true)}
                className="h-14 sm:h-16 flex flex-col items-center justify-center gap-1 bg-foreground text-background hover:bg-foreground/90"
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-medium">Logg måltid</span>
              </Button>

              <Button
                onClick={() => setMedicationOpen(true)}
                className="h-14 sm:h-16 flex flex-col items-center justify-center gap-1 bg-foreground text-background hover:bg-foreground/90"
              >
                <Pill className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-medium">Medikament</span>
              </Button>

              <Button
                onClick={() => setSymptomOpen(true)}
                className="h-14 sm:h-16 flex flex-col items-center justify-center gap-1 bg-foreground text-background hover:bg-foreground/90"
              >
                <HeartPulse className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-medium">Symptom</span>
              </Button>
            </div>

            {/* Today's logged meals */}
            {meals.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Dagens måltid ({meals.length})
                </h3>
                <div className="space-y-2">
                  {meals.map((meal) => {
                    const analysis = meal.ai_analysis
                    return (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {mealTypeLabels[meal.meal_type] || meal.meal_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {meal.meal_time?.slice(0, 5)}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate mt-1">
                            {meal.notes || analysis?.foods?.[0]?.name || "Måltid"}
                          </p>
                          {analysis && (
                            <p className="text-xs text-muted-foreground">
                              {analysis.totalCalories} kcal · {analysis.totalProtein}g protein
                            </p>
                          )}
                        </div>
                        {analysis?.healthScore && (
                          <div className="flex items-center gap-1 ml-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                analysis.healthScore >= 8
                                  ? "bg-green-500"
                                  : analysis.healthScore >= 6
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                            />
                            <span className="text-xs font-medium">{analysis.healthScore}/10</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {meals.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">Ingen måltid logga i dag</p>
                <p className="text-xs mt-1">Trykk "Logg måltid" for å starte</p>
              </div>
            )}

            <AiAnalysisSection meals={meals} />
            <RecipesSection userId={userId} />
            <ActivitySection />
            <HealthAnalyticsSection meals={meals} />
            <MealOverviewSection meals={meals} />
          </CardContent>
        )}
      </Card>

      {addMealOpen && <AddMealDialog open={addMealOpen} onOpenChange={setAddMealOpen} userId={userId} />}
      {medicationOpen && <MedicationDialog open={medicationOpen} onOpenChange={setMedicationOpen} userId={userId} />}
      {symptomOpen && <SymptomDialog open={symptomOpen} onOpenChange={setSymptomOpen} userId={userId} />}
    </div>
  )
}
