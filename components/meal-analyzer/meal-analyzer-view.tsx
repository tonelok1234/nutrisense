"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Activity, Heart, Zap, TrendingUp, Utensils, BarChart3, Calendar } from "lucide-react"
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts"

// Mock data - måltid med tidspunkt
const mockMeals = [
  { time: "07:30", name: "Frukost", calories: 450, type: "breakfast" },
  { time: "12:00", name: "Lunsj", calories: 620, type: "lunch" },
  { time: "15:30", name: "Snack", calories: 180, type: "snack" },
  { time: "18:30", name: "Middag", calories: 750, type: "dinner" },
]

// Mock helsedata gjennom dagen (time for time)
const generateDayData = () => {
  const hours = []
  for (let i = 6; i <= 23; i++) {
    const hour = i.toString().padStart(2, "0") + ":00"
    const hasMeal = mockMeals.find((m) => {
      const mealHour = Number.parseInt(m.time.split(":")[0])
      return mealHour === i
    })

    // Simuler helsedata som responderer på måltid
    let bloodSugar = 85 + Math.random() * 15
    let hrv = 45 + Math.random() * 20
    const stress = 25 + Math.random() * 15
    let energy = 60 + Math.random() * 20

    // Blodsukker stig etter måltid
    if (hasMeal) {
      bloodSugar += 30 + hasMeal.calories / 20
    }
    // Blodsukker held seg høgt 1-2 timar etter måltid
    const prevMeal = mockMeals.find((m) => {
      const mealHour = Number.parseInt(m.time.split(":")[0])
      return mealHour === i - 1 || mealHour === i - 2
    })
    if (prevMeal) {
      bloodSugar += 15 + prevMeal.calories / 40
      hrv -= 5
      energy += 10
    }

    hours.push({
      time: hour,
      bloodSugar: Math.round(bloodSugar),
      hrv: Math.round(hrv),
      stress: Math.round(stress),
      energy: Math.round(energy),
      heartRate: Math.round(65 + Math.random() * 15 + (hasMeal ? 10 : 0)),
      steps: Math.round(Math.random() * 800 + (i >= 12 && i <= 14 ? 1500 : 0)),
      meal: hasMeal ? hasMeal.name : null,
      mealCalories: hasMeal ? hasMeal.calories : null,
    })
  }
  return hours
}

const dayData = generateDayData()

// Tidsperiodar for analyse
const timeRanges = [
  { value: "today", label: "I dag" },
  { value: "yesterday", label: "I går" },
  { value: "week", label: "Siste 7 dagar" },
  { value: "month", label: "Siste 30 dagar" },
]

// Tilgjengelege datakjelder
const dataSources = [
  { id: "bloodSugar", label: "Blodsukker", icon: Zap, color: "#f59e0b", unit: "mg/dL" },
  { id: "hrv", label: "HRV", icon: Heart, color: "#ef4444", unit: "ms" },
  { id: "heartRate", label: "Puls", icon: Activity, color: "#ec4899", unit: "bpm" },
  { id: "stress", label: "Stress", icon: TrendingUp, color: "#8b5cf6", unit: "%" },
  { id: "energy", label: "Energi", icon: Zap, color: "#22c55e", unit: "%" },
  { id: "steps", label: "Steg", icon: Activity, color: "#3b82f6", unit: "" },
]

export default function MealAnalyzerView() {
  const [timeRange, setTimeRange] = useState("today")
  const [activeDataSources, setActiveDataSources] = useState<string[]>(["bloodSugar", "energy"])
  const [showMealMarkers, setShowMealMarkers] = useState(true)

  const toggleDataSource = (sourceId: string) => {
    setActiveDataSources((prev) =>
      prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId],
    )
  }

  // Finn innsikter basert på data
  const insights = useMemo(() => {
    const results = []

    // Finn høgaste blodsukker-spike
    const maxBloodSugar = Math.max(...dayData.map((d) => d.bloodSugar))
    const maxBSEntry = dayData.find((d) => d.bloodSugar === maxBloodSugar)
    if (maxBSEntry) {
      results.push({
        type: "warning",
        title: "Høgast blodsukker",
        description: `${maxBloodSugar} mg/dL kl. ${maxBSEntry.time}${maxBSEntry.meal ? ` (etter ${maxBSEntry.meal})` : ""}`,
      })
    }

    // Finn beste HRV-periode
    const maxHRV = Math.max(...dayData.map((d) => d.hrv))
    const maxHRVEntry = dayData.find((d) => d.hrv === maxHRV)
    if (maxHRVEntry) {
      results.push({
        type: "success",
        title: "Beste HRV",
        description: `${maxHRV} ms kl. ${maxHRVEntry.time} - god restitusjon`,
      })
    }

    // Aktivitetstopp
    const maxSteps = Math.max(...dayData.map((d) => d.steps))
    const activeHour = dayData.find((d) => d.steps === maxSteps)
    if (activeHour && maxSteps > 1000) {
      results.push({
        type: "info",
        title: "Mest aktiv",
        description: `${maxSteps} steg kl. ${activeHour.time}`,
      })
    }

    return results
  }, [])

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Helseanalyse
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Sjå korleis kroppen din responderer på måltid og aktivitet</p>
      </div>

      {/* Kontroller */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
          <Switch id="showMeals" checked={showMealMarkers} onCheckedChange={setShowMealMarkers} />
          <Label htmlFor="showMeals" className="text-sm">
            Vis måltid
          </Label>
        </div>
      </div>

      {/* Datakjelder toggle */}
      <Card className="mb-4">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium">Vel datakjelder</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => toggleDataSource("bloodSugar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeDataSources.includes("bloodSugar")
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              <Zap className="h-4 w-4" />
              Blodsukker
            </button>
            <button
              onClick={() => toggleDataSource("steps")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeDataSources.includes("steps")
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              <Activity className="h-4 w-4" />
              Aktivitet
            </button>
          </div>
          {/* </CHANGE> */}

          <div className="flex flex-wrap gap-2">
            {dataSources.map((source) => {
              const Icon = source.icon
              const isActive = activeDataSources.includes(source.id)
              return (
                <Badge
                  key={source.id}
                  variant={isActive ? "default" : "outline"}
                  className="cursor-pointer transition-colors text-xs py-1 px-2"
                  style={isActive ? { backgroundColor: source.color } : {}}
                  onClick={() => toggleDataSource(source.id)}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {source.label}
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hovudgraf */}
      <Card className="mb-4">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium">Kroppsrespons gjennom dagen</CardTitle>
          <CardDescription className="text-xs">Måltid er markert med stolpar, helsedata med linjer</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[0, "auto"]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[0, "auto"]} hide />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ fontWeight: "bold" }}
                  formatter={(value: number, name: string) => {
                    const source = dataSources.find((s) => s.id === name)
                    return [`${value}${source?.unit || ""}`, source?.label || name]
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={(value) => {
                    const source = dataSources.find((s) => s.id === value)
                    return source?.label || value
                  }}
                />

                {/* Måltidsmarkørar som stolpar */}
                {showMealMarkers && (
                  <Bar
                    yAxisId="right"
                    dataKey="mealCalories"
                    fill="#22c55e"
                    opacity={0.3}
                    name="Måltid (kcal)"
                    barSize={20}
                  />
                )}

                {/* Dynamiske linjer basert på valde datakjelder */}
                {activeDataSources.includes("bloodSugar") && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bloodSugar"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    name="bloodSugar"
                  />
                )}
                {activeDataSources.includes("hrv") && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="hrv"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name="hrv"
                  />
                )}
                {activeDataSources.includes("heartRate") && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={false}
                    name="heartRate"
                  />
                )}
                {activeDataSources.includes("stress") && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="stress"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    name="stress"
                  />
                )}
                {activeDataSources.includes("energy") && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="energy"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name="energy"
                  />
                )}
                {activeDataSources.includes("steps") && (
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="steps"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    stroke="#3b82f6"
                    strokeWidth={1}
                    name="steps"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Måltidsoversikt og innsikter */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Dagens måltid */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Dagens måltid
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div className="space-y-2">
              {mockMeals.map((meal, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{meal.time}</span>
                    <span className="text-sm font-medium">{meal.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {meal.calories} kcal
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Innsikter */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Innsikter
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-sm ${
                    insight.type === "warning"
                      ? "bg-amber-50 dark:bg-amber-950/30"
                      : insight.type === "success"
                        ? "bg-green-50 dark:bg-green-950/30"
                        : "bg-blue-50 dark:bg-blue-950/30"
                  }`}
                >
                  <div className="font-medium text-xs">{insight.title}</div>
                  <div className="text-xs text-muted-foreground">{insight.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
