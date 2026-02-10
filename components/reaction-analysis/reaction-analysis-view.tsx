"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { format, subDays } from "date-fns"
import { CalendarIcon, Sparkles, Loader2, AlertTriangle, ThumbsUp, Pill } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

interface AnalysisResult {
  potentialAllergens: string[]
  optimalChoices: string[]
  recommendations: string[]
  correlations: { trigger: string; symptom: string; confidence: number }[]
}

const mockResult: AnalysisResult = {
  potentialAllergens: ["Dairy products", "Gluten-containing grains", "Nightshades (tomatoes, peppers)"],
  optimalChoices: [
    "Lean proteins (chicken, fish)",
    "Leafy greens and vegetables",
    "Rice and quinoa",
    "Berries and low-sugar fruits",
  ],
  recommendations: [
    "Consider an elimination diet for dairy products for 2-3 weeks.",
    "Monitor symptoms after consuming tomato-based dishes.",
    "Your glucose levels spike less with morning exercise - consider consistent AM workouts.",
    "Evening meals with lower carbs correlate with better sleep quality.",
  ],
  correlations: [
    { trigger: "Cheese consumption", symptom: "Bloating", confidence: 78 },
    { trigger: "Wheat bread", symptom: "Fatigue", confidence: 65 },
    { trigger: "Late dinners (after 8pm)", symptom: "Poor sleep", confidence: 82 },
    { trigger: "High sugar breakfast", symptom: "Energy crash", confidence: 71 },
  ],
}

const healthDataSources = [
  { id: "hrv", label: "Heart Rate Variability (HRV)", source: "Garmin" },
  { id: "stress", label: "Stress Level", source: "Garmin" },
  { id: "sleep", label: "Sleep Quality", source: "Apple Health" },
  { id: "glucose", label: "Glucose Levels", source: "Dexcom" },
  { id: "steps", label: "Daily Steps", source: "Apple Health" },
]

export default function ReactionAnalysisView() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 14),
    to: new Date(),
  })
  const [selectedSources, setSelectedSources] = useState<string[]>(["hrv", "glucose", "sleep"])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setResult(mockResult)
    setIsAnalyzing(false)
  }

  const toggleSource = (sourceId: string) => {
    setSelectedSources((prev) => (prev.includes(sourceId) ? prev.filter((s) => s !== sourceId) : [...prev, sourceId]))
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Reaction Analysis
        </h1>
        <p className="text-muted-foreground mt-1">
          Analyze your food logs with health data to identify triggers and optimize your diet
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Analysis Settings</CardTitle>
            <CardDescription>Select date range and health data sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Health Data Sources */}
            <div className="space-y-3">
              <Label>Health Data Sources</Label>
              {healthDataSources.map((source) => (
                <div key={source.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={source.id}
                    checked={selectedSources.includes(source.id)}
                    onCheckedChange={() => toggleSource(source.id)}
                  />
                  <Label htmlFor={source.id} className="text-sm font-normal flex-1">
                    {source.label}
                    <span className="text-xs text-muted-foreground ml-2">({source.source})</span>
                  </Label>
                </div>
              ))}
            </div>

            <Button onClick={handleAnalyze} disabled={selectedSources.length === 0 || isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              {/* Correlations */}
              <Card>
                <CardHeader>
                  <CardTitle>Detected Correlations</CardTitle>
                  <CardDescription>Patterns found between your food intake and symptoms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.correlations.map((correlation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              correlation.confidence > 75 && "bg-red-500",
                              correlation.confidence > 60 && correlation.confidence <= 75 && "bg-orange-500",
                              correlation.confidence <= 60 && "bg-yellow-500",
                            )}
                          />
                          <div>
                            <p className="font-medium">{correlation.trigger}</p>
                            <p className="text-sm text-muted-foreground">→ {correlation.symptom}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{correlation.confidence}% confidence</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Allergens & Optimal Choices */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Potential Triggers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.potentialAllergens.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-green-500" />
                      Optimal Choices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.optimalChoices.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
                <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Select your date range and health data sources, then click "Run Analysis" to discover patterns between
                  your diet and well-being.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
