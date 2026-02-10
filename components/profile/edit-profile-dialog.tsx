"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  currentProfile: any
}

export default function EditProfileDialog({ open, onOpenChange, userId, currentProfile }: EditProfileDialogProps) {
  const [fullName, setFullName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [gender, setGender] = useState("")
  const [activityLevel, setActivityLevel] = useState("")
  const [healthGoals, setHealthGoals] = useState<string[]>([])
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [newGoal, setNewGoal] = useState("")
  const [newPref, setNewPref] = useState("")
  const [newAllergy, setNewAllergy] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (currentProfile) {
      setFullName(currentProfile.full_name || "")
      setDateOfBirth(currentProfile.date_of_birth || "")
      setHeight(currentProfile.height_cm?.toString() || "")
      setWeight(currentProfile.weight_kg?.toString() || "")
      setGender(currentProfile.gender || "")
      setActivityLevel(currentProfile.activity_level || "")
      setHealthGoals(currentProfile.health_goals || [])
      setDietaryPrefs(currentProfile.dietary_preferences || [])
      setAllergies(currentProfile.allergies || [])
    }
  }, [currentProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          date_of_birth: dateOfBirth || null,
          height_cm: height ? Number.parseFloat(height) : null,
          weight_kg: weight ? Number.parseFloat(weight) : null,
          gender: gender || null,
          activity_level: activityLevel || null,
          health_goals: healthGoals.length > 0 ? healthGoals : null,
          dietary_preferences: dietaryPrefs.length > 0 ? dietaryPrefs : null,
          allergies: allergies.length > 0 ? allergies : null,
        })
        .eq("id", userId)

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addGoal = () => {
    if (newGoal.trim() && !healthGoals.includes(newGoal.trim())) {
      setHealthGoals([...healthGoals, newGoal.trim()])
      setNewGoal("")
    }
  }

  const addPref = () => {
    if (newPref.trim() && !dietaryPrefs.includes(newPref.trim())) {
      setDietaryPrefs([...dietaryPrefs, newPref.trim()])
      setNewPref("")
    }
  }

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your personal information and health profile</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                  <SelectItem value="extra_active">Extra Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Health Goals</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., weight_loss"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGoal())}
                />
                <Button type="button" onClick={addGoal} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {healthGoals.map((goal) => (
                  <Badge key={goal} variant="secondary">
                    {goal}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setHealthGoals(healthGoals.filter((g) => g !== goal))}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Dietary Preferences</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., vegetarian"
                  value={newPref}
                  onChange={(e) => setNewPref(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPref())}
                />
                <Button type="button" onClick={addPref} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {dietaryPrefs.map((pref) => (
                  <Badge key={pref} variant="outline">
                    {pref}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setDietaryPrefs(dietaryPrefs.filter((p) => p !== pref))}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Allergies</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., peanuts"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                />
                <Button type="button" onClick={addAllergy} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {allergies.map((allergy) => (
                  <Badge key={allergy} variant="destructive">
                    {allergy}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setAllergies(allergies.filter((a) => a !== allergy))}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
