"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, UserMinus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserCardProps {
  user: any
  currentUserId: string
  isFollowing: boolean
}

export default function UserCard({ user, currentUserId, isFollowing: initialIsFollowing }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const toggleFollow = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      if (isFollowing) {
        await supabase.from("user_follows").delete().eq("follower_id", currentUserId).eq("following_id", user.id)
      } else {
        await supabase.from("user_follows").insert({
          follower_id: currentUserId,
          following_id: user.id,
        })
      }
      setIsFollowing(!isFollowing)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error toggling follow:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-lg">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{user.full_name || "Anonymous User"}</h3>
            {user.health_goals && user.health_goals.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {user.health_goals.slice(0, 2).map((goal: string) => (
                  <Badge key={goal} variant="outline" className="text-xs capitalize">
                    {goal.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          {user.activity_level && (
            <p>
              <span className="font-medium">Activity:</span> {user.activity_level.replace("_", " ")}
            </p>
          )}
          {user.dietary_preferences && user.dietary_preferences.length > 0 && (
            <p>
              <span className="font-medium">Diet:</span> {user.dietary_preferences.join(", ")}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1 bg-transparent" asChild>
          <Link href={`/profile/${user.id}`}>View Profile</Link>
        </Button>
        <Button onClick={toggleFollow} disabled={isLoading} variant={isFollowing ? "outline" : "default"}>
          {isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
