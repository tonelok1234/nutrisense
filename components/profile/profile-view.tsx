"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Edit,
  Mail,
  Calendar,
  Activity,
  Target,
  Heart,
  Users,
  Settings,
  Globe,
  HeartPulse,
  Watch,
  Smartphone,
  Droplet,
  LogOut,
} from "lucide-react"
import EditProfileDialog from "./edit-profile-dialog"
import { useLanguage } from "@/lib/i18n/language-context"
import { languages, type Language } from "@/lib/i18n/translations"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Wifi, WifiOff } from "lucide-react"
import type { User, Profile, UserGoals } from "@/lib/types"

interface ProfileViewProps {
  user: User
  profile: Profile | null
  goals: UserGoals | null
  stats: {
    recipes: number
    following: number
    followers: number
  }
}

export default function ProfileView({ user, profile, goals, stats }: ProfileViewProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  const [integrations, setIntegrations] = useState([
    {
      id: "apple-health",
      name: "Apple Health",
      description: "Import health metrics from your iPhone and Apple Watch",
      icon: <Smartphone className="h-6 w-6" />,
      connected: true,
      category: "wearables" as const,
    },
    {
      id: "garmin",
      name: "Garmin Connect",
      description: "Sync heart rate, HRV, stress levels, and activity data",
      icon: <Watch className="h-6 w-6" />,
      connected: true,
      category: "wearables" as const,
    },
    {
      id: "stelo",
      name: "Stelo by Dexcom",
      description: "Over-the-counter CGM for metabolic health awareness",
      icon: <Droplet className="h-6 w-6" />,
      connected: false,
      category: "glucose" as const,
    },
  ])
  const [expandedIntegrationId, setExpandedIntegrationId] = useState<string | null>(null)

  const getInitials = (name: string | null) => {
    if (!name) return user.email?.[0]?.toUpperCase() || "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const calculateAge = (dob: string | null) => {
    if (!dob) return null
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const age = calculateAge(profile?.date_of_birth)

  const handleLogout = () => {
    window.location.href = "/"
  }

  const toggleIntegration = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId ? { ...integration, connected: !integration.connected } : integration,
      ),
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-2xl">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-balance">{profile?.full_name || t("profile.setYourName")}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                {age && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {age} {t("profile.yearsOld")}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t("profile.editProfile")}
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("profile.recipesCreated")}</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recipes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("profile.following")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.following}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("profile.followers")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.followers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Health Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("profile.healthProfile")}</CardTitle>
                  <CardDescription>{t("profile.physicalStats")}</CardDescription>
                </div>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.height_cm && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("profile.height")}</span>
                  <span className="font-medium">{profile.height_cm} cm</span>
                </div>
              )}
              {profile?.weight_kg && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("profile.weight")}</span>
                  <span className="font-medium">{profile.weight_kg} kg</span>
                </div>
              )}
              {profile?.activity_level && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("profile.activityLevel")}</span>
                  <span className="font-medium capitalize">{profile.activity_level.replace("_", " ")}</span>
                </div>
              )}
              {profile?.gender && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("profile.gender")}</span>
                  <span className="font-medium capitalize">{profile.gender.replace("_", " ")}</span>
                </div>
              )}
              {(!profile?.height_cm || !profile?.weight_kg || !profile?.activity_level) && (
                <p className="text-sm text-muted-foreground">{t("profile.completeProfile")}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("profile.goalsPreferences")}</CardTitle>
                  <CardDescription>{t("profile.healthJourney")}</CardDescription>
                </div>
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.health_goals && profile.health_goals.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t("profile.healthGoals")}</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.health_goals.map((goal: string) => (
                      <Badge key={goal} variant="secondary" className="capitalize">
                        {goal.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile?.dietary_preferences && profile.dietary_preferences.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t("profile.dietaryPreferences")}</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.dietary_preferences.map((pref: string) => (
                      <Badge key={pref} variant="outline" className="capitalize">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile?.allergies && profile.allergies.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t("profile.allergies")}</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.allergies.map((allergy: string) => (
                      <Badge key={allergy} variant="destructive" className="capitalize">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Health Integrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Health Integrations</CardTitle>
                <CardDescription>Connect your health devices and apps for personalized insights</CardDescription>
              </div>
              <HeartPulse className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-lg",
                  integration.connected && "border-primary/50 bg-primary/5",
                )}
              >
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{integration.name}</p>
                      {integration.connected ? (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          <Wifi className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <WifiOff className="h-3 w-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <Switch checked={integration.connected} onCheckedChange={() => toggleIntegration(integration.id)} />
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent">
              <HeartPulse className="h-4 w-4 mr-2" />
              Browse More Integrations
            </Button>
          </CardContent>
        </Card>

        {/* Settings section with language selector */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("settings.title")}</CardTitle>
                <CardDescription>{t("settings.description")}</CardDescription>
              </div>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language Selection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t("settings.language")}</p>
                  <p className="text-sm text-muted-foreground">{t("settings.selectLanguage")}</p>
                </div>
              </div>
              <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        userId={user.id}
        currentProfile={profile}
      />
    </div>
  )
}
