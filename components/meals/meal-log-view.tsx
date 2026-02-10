"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Clock,
  Pill,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  ChefHat,
  Activity,
  Flame,
  Footprints,
  Timer,
  TrendingUp,
  Heart,
  Zap,
  BarChart3,
  Calendar,
} from "lucide-react"
import AddMealDialog from "./add-meal-dialog"
import MealCard from "./meal-card"
import MedicationDialog from "./medication-dialog"
import SymptomDialog from "./symptom-dialog"
import GenerateRecipeDialog from "../recipes/generate-recipe-dialog"
import CreateRecipeDialog from "../recipes/create-recipe-dialog"
import { Progress } from "@/components/ui/progress"
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
import { Switch } from "@/components/ui/switch"

interface MealLogViewProps {
  meals: any[]
  userId: string
}

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

const mockRecipes = {
  breakfast: [
    {
      id: "b1",
      title: "Havregraut med bær",
      description: "Kremet havregraut med friske bær og honning",
      prep_time: 10,
      servings: 2,
      calories: 320,
      tags: ["vegetarian", "glutenfree"],
    },
    {
      id: "b2",
      title: "Eggerøre med avokado",
      description: "Fluffy eggerøre med kremet avokado og tomatar",
      prep_time: 15,
      servings: 2,
      calories: 380,
      tags: ["keto", "lowcarb", "glutenfree"],
    },
    {
      id: "b3",
      title: "Smoothie bowl",
      description: "Fargerik smoothie bowl med frukt og granola",
      prep_time: 10,
      servings: 1,
      calories: 290,
      tags: ["vegan", "vegetarian"],
    },
  ],
  lunch: [
    {
      id: "l1",
      title: "Kyllingsalat med quinoa",
      description: "Proteinrik salat med grilla kylling og quinoa",
      prep_time: 25,
      servings: 2,
      calories: 450,
      tags: ["glutenfree", "mediterranean"],
    },
    {
      id: "l2",
      title: "Avokado wrap",
      description: "Frisk wrap med avokado, hummus og grønsaker",
      prep_time: 15,
      servings: 2,
      calories: 380,
      tags: ["vegan", "vegetarian"],
    },
    {
      id: "l3",
      title: "Laksepoké bowl",
      description: "Asiatisk-inspirert bowl med fersk laks og ris",
      prep_time: 20,
      servings: 2,
      calories: 520,
      tags: ["glutenfree", "dairyfree"],
    },
  ],
  dinner: [
    {
      id: "d1",
      title: "Laks med grønsaker",
      description: "Ovnsbakt laks med sesonggrønsaker",
      prep_time: 35,
      servings: 4,
      calories: 480,
      tags: ["keto", "lowcarb", "glutenfree", "paleo"],
    },
    {
      id: "d2",
      title: "Pasta primavera",
      description: "Italiensk pasta med friske grønsaker",
      prep_time: 30,
      servings: 4,
      calories: 420,
      tags: ["vegetarian", "mediterranean"],
    },
    {
      id: "d3",
      title: "Vegetar curry",
      description: "Kremet curry med kikerter og spinat",
      prep_time: 40,
      servings: 4,
      calories: 380,
      tags: ["vegan", "vegetarian", "glutenfree"],
    },
  ],
  snacks: [
    {
      id: "s1",
      title: "Energikuler",
      description: "Sunne energikuler med dadlar og nøtter",
      prep_time: 15,
      servings: 12,
      calories: 85,
      tags: ["vegan", "glutenfree", "paleo"],
    },
    {
      id: "s2",
      title: "Gresk yoghurt med honning",
      description: "Kremet yoghurt med honning og valnøtter",
      prep_time: 5,
      servings: 1,
      calories: 180,
      tags: ["vegetarian", "glutenfree"],
    },
    {
      id: "s3",
      title: "Hummus med grønsaker",
      description: "Heimelaga hummus med sprø grønsaker",
      prep_time: 15,
      servings: 4,
      calories: 120,
      tags: ["vegan", "glutenfree"],
    },
  ],
}

const activityData = {
  steps: { current: 8432, goal: 10000 },
  calories: { current: 2150, goal: 2500 },
  activeMinutes: { current: 45, goal: 60 },
  workouts: 3,
}

const recentWorkouts = [
  { type: "Running", duration: "32 min", calories: 320, date: "I dag" },
  { type: "Yoga", duration: "45 min", calories: 180, date: "I går" },
  { type: "Strength Training", duration: "50 min", calories: 280, date: "2 dagar sidan" },
  { type: "Cycling", duration: "60 min", calories: 450, date: "3 dagar sidan" },
]

const mockMealsForAnalysis = [
  { time: "07:30", name: "Frukost", calories: 450, type: "breakfast" },
  { time: "12:00", name: "Lunsj", calories: 620, type: "lunch" },
  { time: "15:30", name: "Snack", calories: 180, type: "snack" },
  { time: "18:30", name: "Middag", calories: 750, type: "dinner" },
]

const generateDayData = () => {
  const hours = []
  for (let i = 6; i <= 23; i++) {
    const hour = i.toString().padStart(2, "0") + ":00"
    const hasMeal = mockMealsForAnalysis.find((m) => {
      const mealHour = Number.parseInt(m.time.split(":")[0])
      return mealHour === i
    })

    let bloodSugar = 85 + Math.random() * 15
    let hrv = 45 + Math.random() * 20
    const stress = 25 + Math.random() * 15
    let energy = 60 + Math.random() * 20

    if (hasMeal) {
      bloodSugar += 30 + hasMeal.calories / 20
    }
    const prevMeal = mockMealsForAnalysis.find((m) => {
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

export default function MealLogView({ meals, userId }: MealLogViewProps) {
  const [addMealOpen, setAddMealOpen] = useState(false)
  const [medicationOpen, setMedicationOpen] = useState(false)
  const [symptomOpen, setSymptomOpen] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<string>("breakfast")

  const [mainSectionExpanded, setMainSectionExpanded] = useState(true)

  const [analysisExpanded, setAnalysisExpanded] = useState(false)
  const [analysisDiet, setAnalysisDiet] = useState("none")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{ nutrition: string; suggestion: string } | null>(null)

  const [recipesExpanded, setRecipesExpanded] = useState(false)
  const [recipesDiet, setRecipesDiet] = useState("all")
  const [recipesExcluded, setRecipesExcluded] = useState("")
  const [recipesSearch, setRecipesSearch] = useState("")
  const [recipesCategory, setRecipesCategory] = useState("breakfast")
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const [activityExpanded, setActivityExpanded] = useState(false)

  const [healthExpanded, setHealthExpanded] = useState(false)
  const [mealOverviewExpanded, setMealOverviewExpanded] = useState(false)
  const [timeRange, setTimeRange] = useState("today")
  const [activeDataSources, setActiveDataSources] = useState<string[]>(["bloodSugar", "energy"])
  const [showMealMarkers, setShowMealMarkers] = useState(true)

  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([])

  useEffect(() => {
    loadSavedMeals()
  }, [])

  const loadSavedMeals = async () => {
    const localMeals = localStorage.getItem("nutrisense_saved_meals")
    if (localMeals) {
      setSavedMeals(JSON.parse(localMeals))
    }
  }

  const getMealsByType = (type: string) => {
    return meals.filter((meal) => meal.meal_type === type)
  }

  const toggleDataSource = (sourceId: string) => {
    setActiveDataSources((prev) =>
      prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId],
    )
  }

  const healthInsights = useMemo(() => {
    const results = []

    const maxBloodSugar = Math.max(...dayData.map((d) => d.bloodSugar))
    const maxBSEntry = dayData.find((d) => d.bloodSugar === maxBloodSugar)
    if (maxBSEntry) {
      results.push({
        type: "warning",
        title: "Høgast blodsukker",
        description: `${maxBloodSugar} mg/dL kl. ${maxBSEntry.time}${maxBSEntry.meal ? ` (etter ${maxBSEntry.meal})` : ""}`,
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

  const runAnalysis = async () => {
    setIsAnalyzing(true)

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const dietAdvice: Record<string, { nutrition: string; suggestion: string }> = {
      none: {
        nutrition:
          "Dagens måltid inneheld ca. 1850 kcal, 85g protein, 220g karbohydrat og 65g feitt. Du er på god veg mot daglege mål.",
        suggestion: "Prøv å inkludere fleire grønsaker i neste måltid for meir fiber og næringsstoff.",
      },
      keto: {
        nutrition:
          "Karbohydratinntak: 45g (over 20g grense). Feitt: 120g (bra!). Protein: 90g. Du bør redusere karbohydrat for å halde deg i ketose.",
        suggestion:
          "Bytt ut brødet med avokado eller egg. Legg til meir smør eller olivenolje for å auke feittinntaket.",
      },
      lowcarb: {
        nutrition: "Karbohydrat: 85g av 100g mål. Protein: 95g. Feitt: 80g. Du held deg innanfor lav-karbo grensene.",
        suggestion: "Byt ut potet med blomkål-mos eller grønsaker med lågt karbohydratinnhald.",
      },
      paleo: {
        nutrition:
          "Måltida inneheld nokre prosesserte ingrediensar som ikkje er paleo-vennlege. Proteininntak er godt på 100g.",
        suggestion: "Unngå meieriprodukta og korn. Byt ut pasta med spiraliserte grønsaker.",
      },
      vegetarian: {
        nutrition: "Protein: 65g (vurder å auke). Jern: 12mg. B12: lågt - vurder supplement. Fiber: 35g (utmerka!).",
        suggestion:
          "Inkluder meir linser, kikerter eller tofu for å auke proteininntak. Kombiner med C-vitamin for betre jernopptak.",
      },
      vegan: {
        nutrition: "Protein: 55g. B12: kritisk lågt. Omega-3: lågt. Kalsium: 650mg. Jern: 10mg.",
        suggestion: "Legg til B12-supplement. Inkluder meir tempeh, edamame og chiafrø for protein og omega-3.",
      },
      glutenfree: {
        nutrition: "Ingen glutenhaldig mat registrert i dag. Fiber: 18g (kan vere lågt). Karbohydrat: 180g.",
        suggestion: "Velg glutenfrie fullkornalternativ som quinoa og bokhvete for meir fiber.",
      },
      mediterranean: {
        nutrition: "Godt inntak av olivenolje og fisk! Fiber: 25g. Omega-3: tilstrekkeleg. Antioksidantar: høgt nivå.",
        suggestion: "Legg til fleire belgfrukter og nøtter. Prøv å inkludere meir fullkorn.",
      },
      dairyfree: {
        nutrition: "Kalsium: 450mg (under tilrådd). Vitamin D: lågt. Protein: 80g (bra!).",
        suggestion: "Inkluder kalsiumrike matvarer som grønkål, brokkoli og mandelmelk.",
      },
      whole30: {
        nutrition: "Sukkerfri dag! Ingen tilsett sukker eller prosessert mat. Protein: 110g. Grønsaker: 5 porsjonar.",
        suggestion: "Hald fram med det gode arbeidet! Prøv nye grønsaker og krydder for variasjon.",
      },
      dash: {
        nutrition: "Natrium: 1800mg (bra, under 2300mg). Kalium: 3500mg. Magnesium: 350mg.",
        suggestion: "Reduser salt ytterlegare og auk inntaket av bananer, søtpotet og spinat.",
      },
      fodmap: {
        nutrition: "Lav-FODMAP dag. Ingen høg-FODMAP mat registrert. Magevenleg val!",
        suggestion: "Prøv å gradvis introdusere moderate FODMAP-matvarer for å teste toleranse.",
      },
    }

    setAnalysisResult(dietAdvice[analysisDiet] || dietAdvice.none)
    setIsAnalyzing(false)
  }

  const filterRecipes = (recipeList: any[]) => {
    let filtered = recipeList

    if (recipesSearch) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(recipesSearch.toLowerCase()) ||
          recipe.description?.toLowerCase().includes(recipesSearch.toLowerCase()),
      )
    }

    if (recipesDiet !== "all") {
      filtered = filtered.filter((recipe) => recipe.tags?.includes(recipesDiet))
    }

    if (recipesExcluded.trim()) {
      const excluded = recipesExcluded
        .toLowerCase()
        .split(",")
        .map((i) => i.trim())
      filtered = filtered.filter(
        (recipe) =>
          !excluded.some(
            (ingredient) =>
              recipe.title.toLowerCase().includes(ingredient) || recipe.description?.toLowerCase().includes(ingredient),
          ),
      )
    }

    return filtered
  }

  const RecipeCard = ({ recipe }: { recipe: any }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-3">
        <h4 className="font-medium text-sm mb-1 line-clamp-1">{recipe.title}</h4>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{recipe.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.prep_time}m
          </span>
          <span>{recipe.calories} kcal</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 max-w-7xl">
      <div className="flex flex-col gap-2 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">NutriSense</h1>
        <p className="text-sm sm:text-base font-semibold text-foreground">Logg maltid, medikament, symptom og aktivitet. Analyser korleis kroppen din responderar.</p>
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
            {/* Three action buttons */}
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
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Dagens måltid ({meals.length})</h3>
                </div>
                <div className="space-y-2">
                  {meals.map((meal) => {
                    const analysis = meal.ai_analysis as any
                    const mealTypeLabels: Record<string, string> = {
                      breakfast: "Frukost",
                      lunch: "Lunsj",
                      dinner: "Middag",
                      snack: "Snack",
                    }
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
                            {meal.notes || (analysis?.items?.[0]?.name) || "Måltid"}
                          </p>
                          {analysis && (
                            <p className="text-xs text-muted-foreground">
                              {analysis.total_calories} kcal • {analysis.total_protein}g protein
                            </p>
                          )}
                        </div>
                        {analysis?.health_score && (
                          <div className="flex items-center gap-1 ml-2">
                            <div className={`h-2 w-2 rounded-full ${
                              analysis.health_score >= 8 ? "bg-green-500" :
                              analysis.health_score >= 6 ? "bg-yellow-500" : "bg-red-500"
                            }`} />
                            <span className="text-xs font-medium">{analysis.health_score}/10</span>
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

            {/* AI Analysis Card */}
            <Card>
              <CardHeader
                className="pb-2 px-3 sm:px-6 cursor-pointer"
                onClick={() => setAnalysisExpanded(!analysisExpanded)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm sm:text-base">AI Måltidsanalyse</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      Valfritt
                    </Badge>
                  </div>
                  {analysisExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <CardDescription className="text-xs">
                  Få ernæringsanalyse og forbetringsforslag basert på dietten din
                </CardDescription>
              </CardHeader>
              {analysisExpanded && (
                <CardContent className="px-3 sm:px-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Vel diett</Label>
                    <Select value={analysisDiet} onValueChange={setAnalysisDiet}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vel diett" />
                      </SelectTrigger>
                      <SelectContent>
                        {diets.map((diet) => (
                          <SelectItem key={diet.value} value={diet.value}>
                            {diet.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={runAnalysis} disabled={isAnalyzing} className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isAnalyzing ? "Analyserer..." : "Analyser dagens måltid"}
                  </Button>

                  {analysisResult && (
                    <div className="space-y-3 pt-2">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          Næringsanalyse
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{analysisResult.nutrition}</p>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3">
                        <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          AI-forslag til forbetring
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{analysisResult.suggestion}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Recipes Card */}
            <Card>
              <CardHeader
                className="pb-2 px-3 sm:px-6 cursor-pointer"
                onClick={() => setRecipesExpanded(!recipesExpanded)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm sm:text-base">Oppskrifter</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      Valfritt
                    </Badge>
                  </div>
                  {recipesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <CardDescription className="text-xs">Finn inspirasjon til sunne måltid</CardDescription>
              </CardHeader>
              {recipesExpanded && (
                <CardContent className="px-3 sm:px-6 space-y-4">
                  {/* Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Vel diett</Label>
                      <Select value={recipesDiet} onValueChange={setRecipesDiet}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Alle diettar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle diettar</SelectItem>
                          {diets.slice(1).map((diet) => (
                            <SelectItem key={diet.value} value={diet.value}>
                              {diet.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Utelat ingrediensar</Label>
                      <Input
                        placeholder="t.d. nøtter, melk..."
                        value={recipesExcluded}
                        onChange={(e) => setRecipesExcluded(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Search and buttons */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Søk oppskrifter..."
                        value={recipesSearch}
                        onChange={(e) => setRecipesSearch(e.target.value)}
                        className="pl-8 h-9"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => setGenerateDialogOpen(true)}>
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Recipe category tabs */}
                  <Tabs value={recipesCategory} onValueChange={setRecipesCategory}>
                    <TabsList className="grid w-full grid-cols-4 h-8">
                      <TabsTrigger value="breakfast" className="text-xs py-1">
                        Frukost
                      </TabsTrigger>
                      <TabsTrigger value="lunch" className="text-xs py-1">
                        Lunsj
                      </TabsTrigger>
                      <TabsTrigger value="dinner" className="text-xs py-1">
                        Middag
                      </TabsTrigger>
                      <TabsTrigger value="snacks" className="text-xs py-1">
                        Snacks
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="breakfast" className="mt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {filterRecipes(mockRecipes.breakfast).map((recipe) => (
                          <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="lunch" className="mt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {filterRecipes(mockRecipes.lunch).map((recipe) => (
                          <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="dinner" className="mt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {filterRecipes(mockRecipes.dinner).map((recipe) => (
                          <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="snacks" className="mt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {filterRecipes(mockRecipes.snacks).map((recipe) => (
                          <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>

            {/* Activity Tracking Card */}
            <Card>
              <CardHeader
                className="pb-2 px-3 sm:px-6 cursor-pointer"
                onClick={() => setActivityExpanded(!activityExpanded)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm sm:text-base">Aktivitetssporing</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      Valfritt
                    </Badge>
                  </div>
                  {activityExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <CardDescription className="text-xs">Overvak dagleg aktivitet og treningsframgang</CardDescription>
              </CardHeader>
              {activityExpanded && (
                <CardContent className="px-3 sm:px-6 space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900">
                            <Footprints className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-xs text-muted-foreground">Steg</span>
                        </div>
                        <div className="text-xl font-bold">{activityData.steps.current.toLocaleString()}</div>
                        <Progress
                          value={(activityData.steps.current / activityData.steps.goal) * 100}
                          className="mt-2 h-1.5"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {activityData.steps.goal.toLocaleString()} mål
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900">
                            <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="text-xs text-muted-foreground">Kalorier</span>
                        </div>
                        <div className="text-xl font-bold">{activityData.calories.current.toLocaleString()}</div>
                        <Progress
                          value={(activityData.calories.current / activityData.calories.goal) * 100}
                          className="mt-2 h-1.5"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {activityData.calories.goal.toLocaleString()} mål
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900">
                            <Timer className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-xs text-muted-foreground">Aktiv</span>
                        </div>
                        <div className="text-xl font-bold">{activityData.activeMinutes.current} min</div>
                        <Progress
                          value={(activityData.activeMinutes.current / activityData.activeMinutes.goal) * 100}
                          className="mt-2 h-1.5"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {activityData.activeMinutes.goal} min mål
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900">
                            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-xs text-muted-foreground">Økter</span>
                        </div>
                        <div className="text-xl font-bold">{activityData.workouts}</div>
                        <p className="text-[10px] text-muted-foreground mt-5">Denne veka</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Workouts */}
                  <div>
                    <h4 className="font-medium text-sm mb-3">Siste økter</h4>
                    <div className="space-y-2">
                      {recentWorkouts.map((workout, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Activity className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{workout.type}</p>
                              <p className="text-xs text-muted-foreground">{workout.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">{workout.duration}</p>
                            <p className="text-xs text-muted-foreground">{workout.calories} kcal</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader
                className="pb-2 px-3 sm:px-6 cursor-pointer"
                onClick={() => setHealthExpanded(!healthExpanded)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm sm:text-base">Helseanalyse</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      Valfritt
                    </Badge>
                  </div>
                  {healthExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <CardDescription className="text-xs">
                  Sjå korleis kroppen din responderer på måltid og aktivitet
                </CardDescription>
              </CardHeader>
              {healthExpanded && (
                <CardContent className="px-3 sm:px-6 space-y-4">
                  {/* Controls */}
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
                      <Label htmlFor="showMealsHealth" className="text-sm">
                        Vis måltid
                      </Label>
                    </div>
                  </div>

                  {/* Data sources toggle */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Vel datakjelder</Label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleDataSource("bloodSugar")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                          activeDataSources.includes("bloodSugar")
                            ? "bg-amber-500 text-white shadow-md"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        }`}
                      >
                        <Zap className="h-3 w-3" />
                        Blodsukker
                      </button>
                      <button
                        onClick={() => toggleDataSource("steps")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                          activeDataSources.includes("steps")
                            ? "bg-blue-500 text-white shadow-md"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        }`}
                      >
                        <Activity className="h-3 w-3" />
                        Aktivitet
                      </button>
                    </div>

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

                  {/* Chart */}
                  <div className="bg-muted/30 rounded-lg p-2">
                    <div className="h-[250px] sm:h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={dayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                          <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[0, "auto"]} />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 10 }}
                            domain={[0, "auto"]}
                            hide
                          />
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
                            <Bar
                              yAxisId="right"
                              dataKey="mealCalories"
                              fill="#22c55e"
                              opacity={0.3}
                              name="Måltid (kcal)"
                              barSize={15}
                            />
                          )}

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
                  </div>

                  {/* Insights grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Today's meals */}
                    <div className="bg-muted/30 rounded-lg p-3">
                      <h4 className="font-medium text-xs mb-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Dagens måltid
                      </h4>
                      <div className="space-y-1.5">
                        {mockMealsForAnalysis.map((meal, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-muted-foreground text-[10px]">{meal.time}</span>
                              <span className="font-medium">{meal.name}</span>
                            </div>
                            <Badge variant="secondary" className="text-[10px] h-5">
                              {meal.calories} kcal
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Insights */}
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
                                : insight.type === "success"
                                  ? "bg-green-50 dark:bg-green-950/30"
                                  : "bg-blue-50 dark:bg-blue-950/30"
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

            {/* Daily meal overview */}
            <Card>
              <CardHeader
                className="pb-3 px-3 sm:px-6 cursor-pointer"
                onClick={() => setMealOverviewExpanded(!mealOverviewExpanded)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg">Dagens måltidsoversikt</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      Valfritt
                    </Badge>
                  </div>
                  {mealOverviewExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <CardDescription className="text-xs">Alle måltida du har logga i dag</CardDescription>
              </CardHeader>
              {mealOverviewExpanded && (
                <CardContent className="px-3 sm:px-6 space-y-4">
                  {/* Breakfast */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                        <span className="text-lg">🌅</span>
                      </div>
                      <h3 className="font-medium text-sm">Frukost</h3>
                      <Badge variant="secondary" className="text-[10px]">
                        {getMealsByType("breakfast").length}
                      </Badge>
                    </div>
                    {getMealsByType("breakfast").length > 0 ? (
                      <div className="space-y-2 pl-10">
                        {getMealsByType("breakfast").map((meal) => (
                          <MealCard key={meal.id} meal={meal} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground pl-10">Ingen måltid logga</p>
                    )}
                  </div>

                  {/* Lunch */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <span className="text-lg">☀️</span>
                      </div>
                      <h3 className="font-medium text-sm">Lunsj</h3>
                      <Badge variant="secondary" className="text-[10px]">
                        {getMealsByType("lunch").length}
                      </Badge>
                    </div>
                    {getMealsByType("lunch").length > 0 ? (
                      <div className="space-y-2 pl-10">
                        {getMealsByType("lunch").map((meal) => (
                          <MealCard key={meal.id} meal={meal} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground pl-10">Ingen måltid logga</p>
                    )}
                  </div>

                  {/* Dinner */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-lg">🌙</span>
                      </div>
                      <h3 className="font-medium text-sm">Middag</h3>
                      <Badge variant="secondary" className="text-[10px]">
                        {getMealsByType("dinner").length}
                      </Badge>
                    </div>
                    {getMealsByType("dinner").length > 0 ? (
                      <div className="space-y-2 pl-10">
                        {getMealsByType("dinner").map((meal) => (
                          <MealCard key={meal.id} meal={meal} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground pl-10">Ingen måltid logga</p>
                    )}
                  </div>

                  {/* Snacks */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <span className="text-lg">🍎</span>
                      </div>
                      <h3 className="font-medium text-sm">Snacks</h3>
                      <Badge variant="secondary" className="text-[10px]">
                        {getMealsByType("snack").length}
                      </Badge>
                    </div>
                    {getMealsByType("snack").length > 0 ? (
                      <div className="space-y-2 pl-10">
                        {getMealsByType("snack").map((meal) => (
                          <MealCard key={meal.id} meal={meal} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground pl-10">Ingen måltid logga</p>
                    )}
                  </div>

                  {/* Total summary */}
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
          </CardContent>
        )}
      </Card>

      {addMealOpen && <AddMealDialog open={addMealOpen} onOpenChange={setAddMealOpen} userId={userId} />}
      {medicationOpen && <MedicationDialog open={medicationOpen} onOpenChange={setMedicationOpen} userId={userId} />}
      {symptomOpen && <SymptomDialog open={symptomOpen} onOpenChange={setSymptomOpen} userId={userId} />}
      {generateDialogOpen && <GenerateRecipeDialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen} />}
      {createDialogOpen && <CreateRecipeDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />}
    </div>
  )
}
