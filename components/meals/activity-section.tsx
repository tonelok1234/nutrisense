"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronUp, Activity, Flame, Footprints, Timer, TrendingUp } from "lucide-react"

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

export default function ActivitySection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardHeader
        className="pb-2 px-3 sm:px-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm sm:text-base">Aktivitetssporing</CardTitle>
            <Badge variant="secondary" className="text-[10px]">Valfritt</Badge>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        <CardDescription className="text-xs">Overvak dagleg aktivitet og treningsframgang</CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="px-3 sm:px-6 space-y-4">
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
  )
}
