"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { MealLog } from "@/lib/types"

const diets = [
  { value: "none", label: "Ingen spesifikk diett" },
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

interface AiAnalysisSectionProps {
  meals: MealLog[]
}

interface AnalysisResult {
  foods?: Array<{ name: string; portion: string; calories: number }>
  totalCalories?: number
  totalProtein?: number
  totalCarbs?: number
  totalFat?: number
  healthScore?: number
  suggestions?: string[]
  dietCompatibility?: string
}

export default function AiAnalysisSection({ meals }: AiAnalysisSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [diet, setDiet] = useState("none")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = async () => {
    if (meals.length === 0) return
    setIsAnalyzing(true)
    setError(null)

    const description = meals
      .map((m) => {
        const parts = [m.meal_type]
        if (m.notes) parts.push(m.notes)
        if (m.ai_analysis?.foods) {
          parts.push(m.ai_analysis.foods.map((f) => f.name).join(", "))
        }
        return parts.join(": ")
      })
      .join("; ")

    try {
      const response = await fetch("/api/ai/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, diet: diet !== "none" ? diet : undefined }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Analyse feila")
        return
      }

      const data = await response.json()
      setResult(data)
    } catch {
      setError("Noko gjekk gale. Prøv igjen.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader
        className="pb-2 px-3 sm:px-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm sm:text-base">AI Måltidsanalyse</CardTitle>
            <Badge variant="secondary" className="text-[10px]">Valfritt</Badge>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        <CardDescription className="text-xs">
          Få ernæringsanalyse og forbetringsforslag basert på dietten din
        </CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="px-3 sm:px-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Vel diett</Label>
            <Select value={diet} onValueChange={setDiet}>
              <SelectTrigger>
                <SelectValue placeholder="Vel diett" />
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

          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing || meals.length === 0}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isAnalyzing ? "Analyserer..." : "Analyser dagens måltid"}
          </Button>

          {meals.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Logg eit måltid fyrst for å køyre analyse
            </p>
          )}

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          {result && (
            <div className="space-y-3 pt-2">
              {(result.totalCalories !== undefined) && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Næringsanalyse
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {result.totalCalories} kcal · {result.totalProtein}g protein ·{" "}
                    {result.totalCarbs}g karbohydrat · {result.totalFat}g feitt
                  </p>
                  {result.dietCompatibility && (
                    <p className="text-xs text-muted-foreground mt-1">{result.dietCompatibility}</p>
                  )}
                </div>
              )}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="bg-primary/10 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    AI-forslag til forbetring
                  </h4>
                  <ul className="space-y-1">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-xs sm:text-sm text-muted-foreground">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
