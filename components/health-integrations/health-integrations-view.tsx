"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  HeartPulse,
  Activity,
  Watch,
  Smartphone,
  Wifi,
  WifiOff,
  ChevronRight,
  Droplet,
  Footprints,
  Moon,
  Dumbbell,
  RefreshCw,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  category: "wearables" | "fitness" | "glucose"
  dataCategories: { id: string; label: string; enabled: boolean }[]
}

const initialIntegrations: Integration[] = [
  // Wearables
  {
    id: "apple-health",
    name: "Apple Health",
    description: "Import health metrics from your iPhone and Apple Watch",
    icon: <Smartphone className="h-6 w-6" />,
    connected: true,
    category: "wearables",
    dataCategories: [
      { id: "steps", label: "Steps & Distance", enabled: true },
      { id: "sleep", label: "Sleep Analysis", enabled: true },
      { id: "nutrition", label: "Nutrition Data", enabled: false },
      { id: "mindfulness", label: "Mindfulness Minutes", enabled: false },
      { id: "heartrate", label: "Heart Rate", enabled: true },
    ],
  },
  {
    id: "garmin",
    name: "Garmin Connect",
    description: "Synkroniser puls, HRV, stressnivå og aktivitetsdata",
    icon: <Watch className="h-6 w-6" />,
    connected: false,
    category: "wearables",
    dataCategories: [
      { id: "hrv", label: "Heart Rate Variability", enabled: true },
      { id: "stress", label: "Stress Level", enabled: true },
      { id: "heartrate", label: "Resting Heart Rate", enabled: true },
      { id: "steps", label: "Daily Steps", enabled: false },
      { id: "sleep", label: "Sleep Data", enabled: true },
    ],
  },
  {
    id: "oura",
    name: "Oura Ring",
    description: "Sleep, readiness, and activity tracking",
    icon: <Moon className="h-6 w-6" />,
    connected: false,
    category: "wearables",
    dataCategories: [
      { id: "sleep", label: "Sleep Score", enabled: true },
      { id: "readiness", label: "Readiness Score", enabled: true },
      { id: "activity", label: "Activity Score", enabled: true },
      { id: "hrv", label: "HRV Balance", enabled: true },
    ],
  },
  {
    id: "whoop",
    name: "WHOOP",
    description: "Strain, recovery, and sleep performance tracking",
    icon: <Activity className="h-6 w-6" />,
    connected: false,
    category: "wearables",
    dataCategories: [
      { id: "strain", label: "Daily Strain", enabled: true },
      { id: "recovery", label: "Recovery Score", enabled: true },
      { id: "sleep", label: "Sleep Performance", enabled: true },
      { id: "hrv", label: "HRV", enabled: true },
    ],
  },
  {
    id: "samsung-health",
    name: "Samsung Health",
    description: "Health data from Samsung Galaxy Watch and phones",
    icon: <Watch className="h-6 w-6" />,
    connected: false,
    category: "wearables",
    dataCategories: [
      { id: "steps", label: "Steps & Activity", enabled: true },
      { id: "sleep", label: "Sleep Tracking", enabled: true },
      { id: "heartrate", label: "Heart Rate", enabled: true },
      { id: "stress", label: "Stress Levels", enabled: false },
    ],
  },
  {
    id: "withings",
    name: "Withings",
    description: "Smart scales, blood pressure monitors, and sleep tracking",
    icon: <HeartPulse className="h-6 w-6" />,
    connected: false,
    category: "wearables",
    dataCategories: [
      { id: "weight", label: "Weight & Body Composition", enabled: true },
      { id: "bp", label: "Blood Pressure", enabled: true },
      { id: "sleep", label: "Sleep Data", enabled: true },
      { id: "ecg", label: "ECG Readings", enabled: false },
    ],
  },
  // Fitness Apps
  {
    id: "google-fit",
    name: "Google Fit",
    description: "Activity and health data from Android devices",
    icon: <Footprints className="h-6 w-6" />,
    connected: false,
    category: "fitness",
    dataCategories: [
      { id: "steps", label: "Steps & Distance", enabled: true },
      { id: "activity", label: "Activity Minutes", enabled: true },
      { id: "heartrate", label: "Heart Rate", enabled: true },
      { id: "calories", label: "Calories Burned", enabled: true },
    ],
  },
  {
    id: "fitbit",
    name: "Fitbit",
    description: "Comprehensive fitness and health tracking",
    icon: <Activity className="h-6 w-6" />,
    connected: false,
    category: "fitness",
    dataCategories: [
      { id: "steps", label: "Steps & Floors", enabled: true },
      { id: "sleep", label: "Sleep Stages", enabled: true },
      { id: "heartrate", label: "Heart Rate Zones", enabled: true },
      { id: "activity", label: "Active Zone Minutes", enabled: true },
      { id: "weight", label: "Weight Tracking", enabled: false },
    ],
  },
  {
    id: "strava",
    name: "Strava",
    description: "Running, cycling, and workout tracking",
    icon: <Dumbbell className="h-6 w-6" />,
    connected: false,
    category: "fitness",
    dataCategories: [
      { id: "activities", label: "Workouts & Activities", enabled: true },
      { id: "distance", label: "Distance & Pace", enabled: true },
      { id: "heartrate", label: "Heart Rate Data", enabled: true },
      { id: "power", label: "Power Data", enabled: false },
    ],
  },
  {
    id: "peloton",
    name: "Peloton",
    description: "Cycling, running, and strength workout data",
    icon: <Dumbbell className="h-6 w-6" />,
    connected: false,
    category: "fitness",
    dataCategories: [
      { id: "workouts", label: "Workout History", enabled: true },
      { id: "output", label: "Output & Metrics", enabled: true },
      { id: "calories", label: "Calories Burned", enabled: true },
    ],
  },
  // Glucose Monitors
  {
    id: "dexcom",
    name: "Dexcom CGM",
    description: "Continuous glucose monitoring for metabolic insights",
    icon: <Droplet className="h-6 w-6" />,
    connected: false,
    category: "glucose",
    dataCategories: [
      { id: "glucose", label: "Glucose Readings", enabled: true },
      { id: "trends", label: "Glucose Trends", enabled: true },
      { id: "events", label: "Events & Notes", enabled: false },
      { id: "timeinrange", label: "Time in Range", enabled: true },
    ],
  },
  {
    id: "stelo",
    name: "Stelo by Dexcom",
    description: "Over-the-counter CGM for metabolic health awareness",
    icon: <Droplet className="h-6 w-6" />,
    connected: false,
    category: "glucose",
    dataCategories: [
      { id: "glucose", label: "Glucose Readings", enabled: true },
      { id: "trends", label: "Glucose Patterns", enabled: true },
      { id: "meals", label: "Meal Response", enabled: true },
      { id: "insights", label: "Metabolic Insights", enabled: true },
    ],
  },
  {
    id: "freestyle-libre",
    name: "FreeStyle Libre",
    description: "Abbott's flash glucose monitoring system",
    icon: <Droplet className="h-6 w-6" />,
    connected: false,
    category: "glucose",
    dataCategories: [
      { id: "glucose", label: "Glucose Readings", enabled: true },
      { id: "trends", label: "Glucose Trends", enabled: true },
      { id: "timeinrange", label: "Time in Range", enabled: true },
      { id: "reports", label: "AGP Reports", enabled: false },
    ],
  },
  {
    id: "levels",
    name: "Levels Health",
    description: "Metabolic health insights powered by CGM data",
    icon: <Activity className="h-6 w-6" />,
    connected: false,
    category: "glucose",
    dataCategories: [
      { id: "metabolicscore", label: "Metabolic Score", enabled: true },
      { id: "zonescores", label: "Zone Scores", enabled: true },
      { id: "glucose", label: "Glucose Data", enabled: true },
      { id: "insights", label: "AI Insights", enabled: true },
    ],
  },
]

const categoryLabels = {
  wearables: "Wearables",
  fitness: "Fitness Apps",
  glucose: "Glucose Monitors",
}

const categoryIcons = {
  wearables: <Watch className="h-4 w-4" />,
  fitness: <Dumbbell className="h-4 w-4" />,
  glucose: <Droplet className="h-4 w-4" />,
}

export default function HealthIntegrationsView() {
  const [integrations, setIntegrations] = useState(initialIntegrations)
  const [expandedId, setExpandedId] = useState<string | null>("apple-health")
  const [activeCategory, setActiveCategory] = useState<string>("wearables")
  const [stravaAthleteName, setStravaAthleteName] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  useEffect(() => {
    // Check Strava connection status from database
    fetch("/api/integrations")
      .then(r => r.json())
      .then((data: any[]) => {
        const strava = data?.find((i: any) => i.integration_type === "strava" && i.is_active)
        if (strava) {
          setIntegrations(prev => prev.map(i =>
            i.id === "strava" ? { ...i, connected: true } : i
          ))
          setStravaAthleteName(strava.settings?.athlete_name ?? null)
        }
      })
      .catch(() => {})

    // Handle callback params
    const params = new URLSearchParams(window.location.search)
    if (params.get("strava_connected") === "1") {
      setSyncMessage("Strava er no kopla til!")
      setActiveCategory("fitness")
      window.history.replaceState({}, "", window.location.pathname)
    } else if (params.get("strava_error")) {
      setSyncMessage(`Tilkopling feila: ${params.get("strava_error")}`)
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const handleStravaSync = async () => {
    setIsSyncing(true)
    setSyncMessage(null)
    try {
      const res = await fetch("/api/integrations/strava/sync", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setSyncMessage(`Synkronisert ${data.synced} nye aktivitetar`)
      } else {
        setSyncMessage(`Feil: ${data.error}`)
      }
    } catch {
      setSyncMessage("Synkronisering feila")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleStravaDisconnect = async () => {
    await fetch("/api/integrations?type=strava", { method: "DELETE" })
    setIntegrations(prev => prev.map(i =>
      i.id === "strava" ? { ...i, connected: false } : i
    ))
    setStravaAthleteName(null)
    setSyncMessage("Strava fråkopla")
  }

  const toggleConnection = (integrationId: string) => {
    if (integrationId === "strava") return // handled separately
    if (integrationId === "garmin") return // requires API approval
    if (integrationId === "oura") return // requires Oura Ring
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId ? { ...integration, connected: !integration.connected } : integration,
      ),
    )
  }

  const toggleDataCategory = (integrationId: string, categoryId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? {
              ...integration,
              dataCategories: integration.dataCategories.map((cat) =>
                cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat,
              ),
            }
          : integration,
      ),
    )
  }

  const connectedCount = integrations.filter((i) => i.connected).length

  const filteredIntegrations = integrations.filter((i) => i.category === activeCategory)

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <HeartPulse className="h-8 w-8 text-primary" />
          Health Integrations
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect your health devices and apps to unlock personalized insights
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {connectedCount} of {integrations.length} connected
          </Badge>
        </div>
        {syncMessage && (
          <div className="mt-3 text-sm px-3 py-2 rounded-md bg-primary/10 text-primary w-fit">
            {syncMessage}
          </div>
        )}
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((cat) => (
            <TabsTrigger key={cat} value={cat} className="flex items-center gap-2">
              {categoryIcons[cat]}
              <span className="hidden sm:inline">{categoryLabels[cat]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className={cn("transition-all", integration.connected && "border-primary/50")}>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpandedId(expandedId === integration.id ? null : integration.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "p-3 rounded-lg",
                      integration.connected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {integration.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {integration.name}
                      {integration.connected ? (
                        <Badge variant="default" className="bg-green-500">
                          <Wifi className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <WifiOff className="h-3 w-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {integration.id === "garmin" ? (
                    <div onClick={e => e.stopPropagation()}>
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                        Krev API-godkjenning
                      </Badge>
                    </div>
                  ) : integration.id === "oura" ? (
                    <div onClick={e => e.stopPropagation()}>
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                        Krev Oura Ring
                      </Badge>
                    </div>
                  ) : integration.id === "strava" ? (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      {integration.connected ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleStravaSync}
                            disabled={isSyncing}
                          >
                            <RefreshCw className={cn("h-3 w-3 mr-1", isSyncing && "animate-spin")} />
                            Synkroniser
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleStravaDisconnect}
                          >
                            <LogOut className="h-3 w-3 mr-1" />
                            Koble frå
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" asChild>
                          <a href="/api/integrations/strava/connect">
                            Koble til Strava
                          </a>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Switch
                      checked={integration.connected}
                      onCheckedChange={() => toggleConnection(integration.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <ChevronRight
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      expandedId === integration.id && "rotate-90",
                    )}
                  />
                </div>
              </div>
            </CardHeader>

            {expandedId === integration.id && (
              <CardContent className="pt-0">
                <div className="border-t pt-4">
                  {integration.id === "garmin" && (
                    <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-700">
                      <p className="font-medium mb-1">Garmin API krev godkjenning</p>
                      <p className="mb-2">For å koble til Garmin Connect må applikasjonen godkjennast av Garmin. Dette er under arbeid.</p>
                      <a
                        href="https://developer.garmin.com/gc-developer-program/overview/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        Les meir om Garmin Developer Program →
                      </a>
                    </div>
                  )}
                  {integration.id === "oura" && (
                    <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-700">
                      <p className="font-medium mb-1">Krev Oura Ring</p>
                      <p className="mb-2">For å koble til Oura treng du ein fysisk Oura Ring og ein aktiv brukarkonto. Integrasjonen er klar til bruk når du skaffar deg ringen.</p>
                      <a
                        href="https://ouraring.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        Les meir om Oura Ring →
                      </a>
                    </div>
                  )}
                  {integration.id === "strava" && stravaAthleteName && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Kopla til som: <span className="font-medium">{stravaAthleteName}</span>
                    </p>
                  )}
                  <h4 className="text-sm font-medium mb-3">Data Categories to Sync</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {integration.dataCategories.map((category) => (
                      <div
                        key={category.id}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg border p-3",
                          !integration.connected && "opacity-50",
                        )}
                      >
                        <Checkbox
                          id={`${integration.id}-${category.id}`}
                          checked={category.enabled}
                          onCheckedChange={() => toggleDataCategory(integration.id, category.id)}
                          disabled={!integration.connected}
                        />
                        <Label
                          htmlFor={`${integration.id}-${category.id}`}
                          className="text-sm font-normal flex-1 cursor-pointer"
                        >
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">Don't see your device? We're adding new integrations regularly.</p>
          <Button variant="outline">Request Integration</Button>
        </CardContent>
      </Card>
    </div>
  )
}
