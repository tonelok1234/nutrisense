"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Activity, Flame, Footprints, Timer, TrendingUp } from "lucide-react"

const activityData = {
  steps: { current: 8432, goal: 10000 },
  calories: { current: 2150, goal: 2500 },
  activeMinutes: { current: 45, goal: 60 },
  workouts: 3,
}

const recentWorkouts = [
  { type: "Running", duration: "32 min", calories: 320, date: "Today" },
  { type: "Yoga", duration: "45 min", calories: 180, date: "Yesterday" },
  { type: "Strength Training", duration: "50 min", calories: 280, date: "2 days ago" },
  { type: "Cycling", duration: "60 min", calories: 450, date: "3 days ago" },
]

export default function ActivityView() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          Activity Tracking
        </h1>
        <p className="text-muted-foreground mt-1">Monitor your daily activity and exercise progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Footprints className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-muted-foreground">Steps</span>
            </div>
            <div className="text-2xl font-bold">{activityData.steps.current.toLocaleString()}</div>
            <Progress value={(activityData.steps.current / activityData.steps.goal) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{activityData.steps.goal.toLocaleString()} goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-sm text-muted-foreground">Calories</span>
            </div>
            <div className="text-2xl font-bold">{activityData.calories.current.toLocaleString()}</div>
            <Progress value={(activityData.calories.current / activityData.calories.goal) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{activityData.calories.goal.toLocaleString()} goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Timer className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <div className="text-2xl font-bold">{activityData.activeMinutes.current} min</div>
            <Progress
              value={(activityData.activeMinutes.current / activityData.activeMinutes.goal) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">{activityData.activeMinutes.goal} min goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm text-muted-foreground">Workouts</span>
            </div>
            <div className="text-2xl font-bold">{activityData.workouts}</div>
            <p className="text-xs text-muted-foreground mt-3">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentWorkouts.map((workout, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{workout.type}</p>
                    <p className="text-sm text-muted-foreground">{workout.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{workout.duration}</p>
                  <p className="text-sm text-muted-foreground">{workout.calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
