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
    description: "Strain, recovery og søvnprestasjon – krev WHOOP-abonnement",
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
    description: "Reseptfri CGM for metabolsk helseovervaking – krev Stelo-sensor",
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
  const [dbIntegrations, setDbIntegrations] = useState<Record<string, any>>({})
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Integrations with real OAuth flows
  const REAL_INTEGRATIONS = ["strava", "dexcom"]
  // Integrations that require hardware/subscription (placeholders)
  const PLACEHOLDER_INTEGRATIONS = ["garmin", "oura", "whoop", "stelo"]

  const SYNC_LABELS: Record<string, string> = {
    strava: "aktivitetar",
    dexcom: "glukosmålingar",
  }

  const CONNECT_LABELS: Record<string, string> = {
    strava: "Strava",
    dexcom: "Dexcom CGM",
  }

  useEffect(() => {
    fetch("/api/integrations")
      .then(r => r.json())
      .then((data: any[]) => {
        const details: Record<string, any> = {}
        for (const item of (data ?? [])) {
          if (item.is_active) details[item.integration_type] = item
        }
        setDbIntegrations(details)
        setIntegrations(prev => prev.map(i => ({
          ...i,
          connected: REAL_INTEGRATIONS.includes(i.id) ? !!details[i.id] : i.connected,
        })))
      })
      .catch(() => {})

    const params = new URLSearchParams(window.location.search)
    for (const id of REAL_INTEGRATIONS) {
      if (params.get(`${id}_connected`) === "1") {
        setMessage(`${CONNECT_LABELS[id]} er no kopla til!`)
        if (id === "strava") setActiveCategory("fitness")
        if (id === "dexcom") setActiveCategory("glucose")
        window.history.replaceState({}, "", window.location.pathname)
        break
      }
      if (params.get(`${id}_error`)) {
        setMessage(`Tilkopling feila: ${params.get(`${id}_error`)}`)
        window.history.replaceState({}, "", window.location.pathname)
        break
      }
    }
  }, [])

  const handleSync = async (integrationId: string) => {
    setSyncingId(integrationId)
    setMessage(null)
    try {
      const res = await fetch(`/api/integrations/${integrationId}/sync`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setMessage(`Synkronisert ${data.synced} nye ${SYNC_LABELS[integrationId] ?? "oppføringar"}`)
      } else {
        setMessage(`Feil: ${data.error}`)
      }
    } catch {
      setMessage("Synkronisering feila")
    } finally {
      setSyncingId(null)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    await fetch(`/api/integrations?type=${integrationId}`, { method: "DELETE" })
    setIntegrations(prev => prev.map(i =>
      i.id === integrationId ? { ...i, connected: false } : i
    ))
    setDbIntegrations(prev => { const next = { ...prev }; delete next[integrationId]; return next })
    setMessage(`${CONNECT_LABELS[integrationId] ?? integrationId} fråkopla`)
  }

  const toggleConnection = (integrationId: string) => {
    if (REAL_INTEGRATIONS.includes(integrationId)) return
    if (PLACEHOLDER_INTEGRATIONS.includes(integrationId)) return
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
        {message && (
          <div className="mt-3 text-sm px-3 py-2 rounded-md bg-primary/10 text-primary w-fit">
            {message}
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
                  {PLACEHOLDER_INTEGRATIONS.includes(integration.id) ? (
                    <div onClick={e => e.stopPropagation()}>
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                        {integration.id === "garmin" ? "Krev API-godkjenning"
                          : integration.id === "oura" ? "Krev Oura Ring"
                          : integration.id === "whoop" ? "Krev WHOOP"
                          : "Krev Stelo-sensor"}
                      </Badge>
                    </div>
                  ) : REAL_INTEGRATIONS.includes(integration.id) ? (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      {integration.connected ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(integration.id)}
                            disabled={syncingId === integration.id}
                          >
                            <RefreshCw className={cn("h-3 w-3 mr-1", syncingId === integration.id && "animate-spin")} />
                            Synkroniser
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            <LogOut className="h-3 w-3 mr-1" />
                            Koble frå
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" asChild>
                          <a href={`/api/integrations/${integration.id}/connect`}>
                            Koble til {CONNECT_LABELS[integration.id]}
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
                  {(integration.id === "whoop" || integration.id === "stelo") && (
                    <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-700">
                      <p className="font-medium mb-1">
                        Krev {integration.id === "whoop" ? "WHOOP-abonnement" : "Stelo-sensor"}
                      </p>
                      <p className="mb-2">
                        {integration.id === "whoop"
                          ? "For å koble til WHOOP treng du eit aktivt WHOOP-abonnement. Integrasjonen er klar til bruk når du har eit abonnement."
                          : "For å koble til Stelo treng du ein fysisk Stelo-sensor frå Dexcom. Integrasjonen er klar til bruk når du har sensoren."}
                      </p>
                      <a
                        href={integration.id === "whoop" ? "https://www.whoop.com" : "https://www.stelo.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        Les meir om {integration.id === "whoop" ? "WHOOP" : "Stelo"} →
                      </a>
                    </div>
                  )}
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
                  {REAL_INTEGRATIONS.includes(integration.id) && dbIntegrations[integration.id] && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {integration.id === "strava" && dbIntegrations.strava?.settings?.athlete_name && (
                        <>Kopla til som: <span className="font-medium">{dbIntegrations.strava.settings.athlete_name}</span></>
                      )}
                      {integration.id === "dexcom" && (
                        <>Sist synkronisert: <span className="font-medium">{new Date(dbIntegrations.dexcom.last_synced_at).toLocaleString("no-NO")}</span></>
                      )}
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
