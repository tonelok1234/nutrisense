"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  Heart,
  Zap,
} from "lucide-react"
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts"
import type { MealLog } from "@/lib/types"

const timeRanges = [
  { value: "today", label: "I dag" },
  { value: "yesterday", label: "I går" },
  { value: "week", label: "Siste 7 dagar" },
  { value: "month", label: "Siste 30 dagar" },
]

const healthDataSources = [
  { id: "bloodSugar", label: "Blodsukker", icon: Zap, color: "#f59e0b", unit: "mg/dL" },
  { id: "hrv", label: "HRV", icon: Heart, color: "#ef4444", unit: "ms" },
  { id: "heartRate", label: "Puls", icon: Activity, color: "#ec4899", unit: "bpm" },
  { id: "stress", label: "Stress", icon: TrendingUp, color: "#8b5cf6", unit: "%" },
  { id: "energy", label: "Energi", icon: Zap, color: "#22c55e", unit: "%" },
  { id: "steps", label: "Steg", icon: Activity, color: "#3b82f6", unit: "" },
]

function generateDayData(meals: MealLog[]) {
  const mealsByHour = meals.reduce<Record<number, { name: string; calories: number }>>((acc, m) => {
    const hour = m.meal_time ? parseInt(m.meal_time.split(":")[0]) : null
    if (hour !== null) {
      acc[hour] = {
        name: m.notes || m.meal_type,
        calories: m.ai_analysis?.totalCalories ?? 400,
      }
    }
    return acc
  }, {})

  return Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6
    const hasMeal = mealsByHour[hour]
    const prevMeal = mealsByHour[hour - 1] || mealsByHour[hour - 2]

    let bloodSugar = 85 + Math.random() * 15
    let hrv = 45 + Math.random() * 20
    let energy = 60 + Math.random() * 20

    if (hasMeal) bloodSugar += 30 + hasMeal.calories / 20
    if (prevMeal) { bloodSugar += 15 + prevMeal.calories / 40; hrv -= 5; energy += 10 }

    return {
      time: `${String(hour).padStart(2, "0")}:00`,
      bloodSugar: Math.round(bloodSugar),
      hrv: Math.round(hrv),
      stress: Math.round(25 + Math.random() * 15),
      energy: Math.round(energy),
      heartRate: Math.round(65 + Math.random() * 15 + (hasMeal ? 10 : 0)),
      steps: Math.round(Math.random() * 800 + (hour >= 12 && hour <= 14 ? 1500 : 0)),
      meal: hasMeal ? hasMeal.name : null,
      mealCalories: hasMeal ? hasMeal.calories : null,
    }
  })
}

interface HealthAnalyticsSectionProps {
  meals: MealLog[]
}

export default function HealthAnalyticsSection({ meals }: HealthAnalyticsSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [timeRange, setTimeRange] = useState("today")
  const [activeDataSources, setActiveDataSources] = useState<string[]>(["bloodSugar", "energy"])
  const [showMealMarkers, setShowMealMarkers] = useState(true)

  const dayData = useMemo(() => generateDayData(meals), [meals])

  const healthInsights = useMemo(() => {
    const results = []
    const maxBS = Math.max(...dayData.map((d) => d.bloodSugar))
    const maxBSEntry = dayData.find((d) => d.bloodSugar === maxBS)
    if (maxBSEntry) {
      results.push({
        type: "warning",
        title: "Høgast blodsukker",
        description: `${maxBS} mg/dL kl. ${maxBSEntry.time}${maxBSEntry.meal ? ` (etter ${maxBSEntry.meal})` : ""}`,
      })
    }
    const maxHRV = Math.max(...dayData.map((d) => d.hrv))
    const maxHRVEntry = dayData.find((d) => d.hrv === maxHRV)
    if (maxHRVEntry) {
      results.push({
        type: "success",
        title: "Beste HRV",
        description: `${maxHRV} ms kl. ${maxHRVEntry.time} - god restitusjon`,
      })
    }
    return results
  }, [dayData])

  const toggleDataSource = (id: string) => {
    setActiveDataSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  return (
    <Card>
      <CardHeader
        className="pb-2 px-3 sm:px-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm sm:text-base">Helseanalyse</CardTitle>
            <Badge variant="secondary" className="text-[10px]">Valfritt</Badge>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        <CardDescription className="text-xs">
          Sjå korleis kroppen din responderer på måltid og aktivitet
        </CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="px-3 sm:px-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch id="showMealsHealth" checked={showMealMarkers} onCheckedChange={setShowMealMarkers} />
              <Label htmlFor="showMealsHealth" className="text-sm">Vis måltid</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Vel datakjelder</Label>
            <div className="flex flex-wrap gap-2">
              {healthDataSources.map((source) => {
                const Icon = source.icon
                const isActive = activeDataSources.includes(source.id)
                return (
                  <Badge
                    key={source.id}
                    variant={isActive ? "default" : "outline"}
                    className="cursor-pointer transition-colors text-[10px] py-0.5 px-2"
                    style={isActive ? { backgroundColor: source.color } : {}}
                    onClick={() => toggleDataSource(source.id)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {source.label}
                  </Badge>
                )
              })}
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-2">
            <div className="h-[250px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[0, "auto"]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[0, "auto"]} hide />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 11,
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => {
                      const source = healthDataSources.find((s) => s.id === name)
                      return [`${value}${source?.unit || ""}`, source?.label || name]
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 9 }}
                    formatter={(value) => {
                      const source = healthDataSources.find((s) => s.id === value)
                      return source?.label || value
                    }}
                  />

                  {showMealMarkers && (
                    <Bar yAxisId="right" dataKey="mealCalories" fill="#22c55e" opacity={0.3} name="Måltid (kcal)" barSize={15} />
                  )}
                  {activeDataSources.includes("bloodSugar") && (
                    <Line yAxisId="left" type="monotone" dataKey="bloodSugar" stroke="#f59e0b" strokeWidth={2} dot={false} name="bloodSugar" />
                  )}
                  {activeDataSources.includes("hrv") && (
                    <Line yAxisId="left" type="monotone" dataKey="hrv" stroke="#ef4444" strokeWidth={2} dot={false} name="hrv" />
                  )}
                  {activeDataSources.includes("heartRate") && (
                    <Line yAxisId="left" type="monotone" dataKey="heartRate" stroke="#ec4899" strokeWidth={2} dot={false} name="heartRate" />
                  )}
                  {activeDataSources.includes("stress") && (
                    <Line yAxisId="left" type="monotone" dataKey="stress" stroke="#8b5cf6" strokeWidth={2} dot={false} name="stress" />
                  )}
                  {activeDataSources.includes("energy") && (
                    <Line yAxisId="left" type="monotone" dataKey="energy" stroke="#22c55e" strokeWidth={2} dot={false} name="energy" />
                  )}
                  {activeDataSources.includes("steps") && (
                    <Area yAxisId="right" type="monotone" dataKey="steps" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth={1} name="steps" />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-medium text-xs mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Dagens måltid
              </h4>
              <div className="space-y-1.5">
                {meals.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Ingen måltid logga i dag</p>
                ) : (
                  meals.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-muted-foreground text-[10px]">
                          {meal.meal_time?.slice(0, 5)}
                        </span>
                        <span className="font-medium">{meal.notes || meal.meal_type}</span>
                      </div>
                      {meal.ai_analysis?.totalCalories && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {meal.ai_analysis.totalCalories} kcal
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-medium text-xs mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Innsikter
              </h4>
              <div className="space-y-1.5">
                {healthInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-xs ${
                      insight.type === "warning"
                        ? "bg-amber-50 dark:bg-amber-950/30"
                        : "bg-green-50 dark:bg-green-950/30"
                    }`}
                  >
                    <div className="font-medium text-[10px]">{insight.title}</div>
                    <div className="text-[10px] text-muted-foreground">{insight.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
