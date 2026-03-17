"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Utensils, HeartPulse } from "lucide-react"

export interface TimelineEvent {
  id: string
  type: "meal" | "symptom"
  datetime: string   // ISO-streng
  label: string
  detail?: string
  severity?: number  // berre for symptom (1-10)
  calories?: number  // berre for måltid
  mealType?: string
}

interface HealthTimelineProps {
  events: TimelineEvent[]
  startDate: string
  endDate: string
}

const HOURS = [6, 9, 12, 15, 18, 21, 24]

function timeToPercent(isoOrTime: string): number {
  const d = new Date(isoOrTime)
  const isValid = !isNaN(d.getTime())
  let hour: number
  let minute: number
  if (isValid) {
    hour = d.getHours()
    minute = d.getMinutes()
  } else {
    // fallback: "HH:MM:SS"
    const parts = isoOrTime.split(":")
    hour = parseInt(parts[0] ?? "0")
    minute = parseInt(parts[1] ?? "0")
  }
  return ((hour + minute / 60) / 24) * 100
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso.slice(0, 5)
  return d.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("no-NO", { weekday: "short", day: "numeric", month: "short" })
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start)
  const last = new Date(end)
  while (current <= last) {
    dates.push(current.toISOString().split("T")[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

function getEventDate(e: TimelineEvent): string {
  const d = new Date(e.datetime)
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0]
  return e.datetime.split("T")[0]
}

function symptomColor(severity?: number): string {
  if (!severity) return "bg-orange-400"
  if (severity >= 8) return "bg-red-500"
  if (severity >= 5) return "bg-orange-400"
  return "bg-yellow-400"
}

function mealTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    breakfast: "Frukost",
    lunch: "Lunsj",
    dinner: "Middag",
    snack: "Mellommåltid",
  }
  return map[type ?? ""] ?? type ?? "Måltid"
}

export default function HealthTimeline({ events, startDate, endDate }: HealthTimelineProps) {
  const [tooltip, setTooltip] = useState<{ event: TimelineEvent; x: number; y: number } | null>(null)
  const dates = useMemo(() => getDatesInRange(startDate, endDate), [startDate, endDate])

  const eventsByDate = useMemo(() => {
    const map: Record<string, TimelineEvent[]> = {}
    for (const e of events) {
      const day = getEventDate(e)
      if (!map[day]) map[day] = []
      map[day].push(e)
    }
    return map
  }, [events])

  if (dates.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Tidslinje
          <div className="flex gap-3 ml-auto text-xs font-normal text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              Måltid
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
              Symptom
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-4">
        {/* Tidsmarkeringar */}
        <div className="flex mb-1 pl-20 pr-2 text-[10px] text-muted-foreground select-none">
          {HOURS.map(h => (
            <span key={h} style={{ left: `${(h / 24) * 100}%` }} className="absolute">
              {h === 24 ? "" : `${h}:00`}
            </span>
          ))}
        </div>
        <div className="relative mb-2 h-4 pl-20 pr-2">
          {HOURS.map(h => (
            <span
              key={h}
              className="absolute text-[10px] text-muted-foreground"
              style={{ left: `calc(${(h / 24) * 100}% + 80px - 12px)` }}
            >
              {h === 24 ? "" : `${h}:00`}
            </span>
          ))}
        </div>

        {/* Dag-rader */}
        <div className="space-y-2">
          {dates.map(date => {
            const dayEvents = eventsByDate[date] ?? []
            const hasMeals = dayEvents.some(e => e.type === "meal")
            const hasSymptoms = dayEvents.some(e => e.type === "symptom")

            return (
              <div key={date} className="flex items-center gap-2">
                {/* Dag-label */}
                <div className="w-20 flex-shrink-0 text-xs text-muted-foreground text-right pr-2">
                  {getDayLabel(date)}
                </div>

                {/* Tidslinjestav */}
                <div className="relative flex-1 h-8 bg-muted/30 rounded-full border border-border/50">
                  {/* Bakgrunnsgitter */}
                  {HOURS.slice(0, -1).map(h => (
                    <div
                      key={h}
                      className="absolute top-0 bottom-0 w-px bg-border/30"
                      style={{ left: `${(h / 24) * 100}%` }}
                    />
                  ))}

                  {/* Hendingar */}
                  {dayEvents.map(event => {
                    const pct = timeToPercent(event.datetime)
                    const isMeal = event.type === "meal"
                    return (
                      <button
                        key={event.id}
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm cursor-pointer transition-transform hover:scale-125 z-10 flex items-center justify-center ${
                          isMeal ? "bg-green-500" : symptomColor(event.severity)
                        }`}
                        style={{ left: `${pct}%` }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setTooltip({ event, x: rect.left, y: rect.top })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => setTooltip(tooltip?.event.id === event.id ? null : { event, x: 0, y: 0 })}
                        aria-label={event.label}
                      >
                        {isMeal
                          ? <Utensils className="w-2 h-2 text-white" />
                          : <HeartPulse className="w-2 h-2 text-white" />
                        }
                      </button>
                    )
                  })}

                  {dayEvents.length === 0 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground/40">
                      ingen data
                    </span>
                  )}
                </div>

                {/* Oppsummering */}
                <div className="w-16 flex-shrink-0 flex flex-col gap-0.5">
                  {hasMeals && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 w-fit">
                      {dayEvents.filter(e => e.type === "meal").length} måltid
                    </Badge>
                  )}
                  {hasSymptoms && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 w-fit border-orange-300 text-orange-600">
                      {dayEvents.filter(e => e.type === "symptom").length} symptom
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div className="mt-3 p-3 rounded-lg bg-popover border shadow-md text-sm">
            <div className="flex items-center gap-2 font-medium mb-1">
              {tooltip.event.type === "meal"
                ? <Utensils className="h-4 w-4 text-green-500" />
                : <HeartPulse className="h-4 w-4 text-orange-500" />
              }
              {tooltip.event.type === "meal"
                ? mealTypeLabel(tooltip.event.mealType)
                : "Symptom"
              }
              <span className="text-muted-foreground font-normal text-xs ml-auto">
                {formatTime(tooltip.event.datetime)}
              </span>
            </div>
            <p className="text-muted-foreground">{tooltip.event.label}</p>
            {tooltip.event.calories && (
              <p className="text-xs text-muted-foreground mt-1">{tooltip.event.calories} kcal</p>
            )}
            {tooltip.event.severity && (
              <p className="text-xs text-muted-foreground mt-1">
                Alvorlegheit: {tooltip.event.severity}/10
              </p>
            )}
            {tooltip.event.detail && (
              <p className="text-xs text-muted-foreground mt-1 italic">{tooltip.event.detail}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
