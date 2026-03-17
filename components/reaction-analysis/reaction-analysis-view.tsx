"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { format, subDays } from "date-fns"
import { CalendarIcon, Sparkles, Loader2, AlertTriangle, ThumbsUp, Lightbulb, Info } from "lucide-react"
import type { DateRange } from "react-day-picker"
import HealthTimeline, { type TimelineEvent } from "./health-timeline"

interface Correlation {
  trigger: string
  symptom: string
  timePattern: string
  confidence: number
  evidenceBasis: string
}

interface Suggestion {
  suggestion: string
  reasoning: string
}

interface AnalysisResult {
  summary: string
  correlations: Correlation[]
  optimalPatterns: string[]
  suggestions: Suggestion[]
  dataQuality: "low" | "medium" | "high"
  disclaimer: string
}

function confidenceColor(c: number): string {
  if (c >= 75) return "bg-red-100 border-red-200 text-red-700"
  if (c >= 50) return "bg-orange-100 border-orange-200 text-orange-700"
  return "bg-yellow-100 border-yellow-200 text-yellow-700"
}

function dataQualityLabel(q: "low" | "medium" | "high") {
  const map = {
    low: { label: "Avgrensa data", color: "text-orange-600", desc: "For lite data for sikre konklusjonar. Logg meir over tid." },
    medium: { label: "Moderat data", color: "text-yellow-600", desc: "Noko data tilgjengeleg. Fleire loggar gir betre analyse." },
    high: { label: "Godt datagrunnlag", color: "text-green-600", desc: "Tilstrekkeleg data for å finne mønster." },
  }
  return map[q]
}

export default function ReactionAnalysisView() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 14),
    to: new Date(),
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dataCounts, setDataCounts] = useState<{ meals: number; symptoms: number } | null>(null)

  const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""
  const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : startDate

  const handleAnalyze = async () => {
    if (!startDate || !endDate) return
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      // Hent data for tidslinje og analyse parallelt
      const [mealRes, symptomRes, analysisRes] = await Promise.all([
        fetch(`/api/meals`),
        fetch(`/api/symptoms`),
        fetch("/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startDate, endDate }),
        }),
      ])

      // Bygg tidslinjehendingar frå måltidsdata
      const events: TimelineEvent[] = []

      if (mealRes.ok) {
        const meals = await mealRes.json()
        for (const m of meals) {
          if (m.meal_date >= startDate && m.meal_date <= endDate) {
            const datetime = `${m.meal_date}T${m.meal_time || "12:00:00"}`
            const items = m.ai_analysis?.items?.map((i: any) => i.name).join(", ") ?? m.notes ?? "Ukjent"
            events.push({
              id: `meal-${m.id}`,
              type: "meal",
              datetime,
              label: items,
              calories: m.ai_analysis?.total_calories,
              mealType: m.meal_type,
            })
          }
        }
      }

      if (symptomRes.ok) {
        const symptoms = await symptomRes.json()
        for (const s of symptoms) {
          if (s.logged_at >= `${startDate}T00:00:00` && s.logged_at <= `${endDate}T23:59:59`) {
            events.push({
              id: `symptom-${s.id}`,
              type: "symptom",
              datetime: s.logged_at,
              label: s.description,
              severity: s.severity,
              detail: s.notes ?? undefined,
            })
          }
        }
      }

      setTimelineEvents(events)

      if (!analysisRes.ok) {
        const err = await analysisRes.json()
        setError(err.error ?? "Analysen feila")
        return
      }

      const data = await analysisRes.json()
      setDataCounts({ meals: data.mealCount, symptoms: data.symptomCount })
      setResult(data.analysis)
    } catch (e) {
      setError("Noko gjekk gale. Prøv igjen.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-primary" />
          Helse- og reaksjonsanalyse
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Finn mønster mellom mat, aktivitet og korleis du har det
        </p>
      </div>

      {/* Innstillingar */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Vel periode</CardTitle>
          <CardDescription className="text-xs">
            Vel ein periode du har logga måltid og/eller symptom
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="space-y-2 flex-1">
            <Label>Periode</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from
                    ? dateRange.to
                      ? `${format(dateRange.from, "d. MMM")} – ${format(dateRange.to, "d. MMM yyyy")}`
                      : format(dateRange.from, "d. MMM yyyy")
                    : "Vel datoar"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                  disabled={{ after: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!startDate || isAnalyzing}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyserer...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" />Køyr analyse</>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="py-4 flex items-center gap-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Tidslinje */}
      {timelineEvents.length > 0 && startDate && (
        <div className="mb-6">
          <HealthTimeline events={timelineEvents} startDate={startDate} endDate={endDate} />
        </div>
      )}

      {/* Analyseresultat */}
      {result && (
        <div className="space-y-4">
          {/* Datagrunnlag og oppsummering */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                {dataCounts && (
                  <>
                    <Badge variant="secondary">{dataCounts.meals} måltid logga</Badge>
                    <Badge variant="secondary">{dataCounts.symptoms} symptom logga</Badge>
                  </>
                )}
                <Badge
                  variant="outline"
                  className={dataQualityLabel(result.dataQuality).color}
                >
                  {dataQualityLabel(result.dataQuality).label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {dataQualityLabel(result.dataQuality).desc}
              </p>
              <p className="text-sm">{result.summary}</p>
            </CardContent>
          </Card>

          {/* Mønster og samanhengar */}
          {result.correlations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Observerte mønster
                </CardTitle>
                <CardDescription className="text-xs">
                  Basert på samanfall i tid mellom måltid og symptom
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.correlations.map((c, i) => (
                  <div key={i} className={`p-3 rounded-lg border text-sm ${confidenceColor(c.confidence)}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <span className="font-medium">{c.trigger}</span>
                        <span className="mx-2 text-muted-foreground">→</span>
                        <span>{c.symptom}</span>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {c.confidence}% samsvar
                      </Badge>
                    </div>
                    <p className="text-xs opacity-80 mb-1">{c.timePattern}</p>
                    <p className="text-xs opacity-70 italic">{c.evidenceBasis}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Optimale mønster */}
          {result.optimalPatterns.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  Mønster som fungerte bra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.optimalPatterns.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Anbefalingar */}
          {result.suggestions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Anbefalingar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-sm font-medium mb-1">{s.suggestion}</p>
                    <p className="text-xs text-muted-foreground">{s.reasoning}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <Card className="border-muted bg-muted/20">
            <CardContent className="pt-4 flex gap-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{result.disclaimer}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tom tilstand */}
      {!result && !error && timelineEvents.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
            <h3 className="text-lg font-medium mb-2">Ingen analyse enno</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Vel ein periode der du har logga måltid og/eller symptom, og trykk «Køyr analyse».
              Jo meir du logger, jo betre mønster kan AI-en finne.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
