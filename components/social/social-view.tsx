"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import UserCard from "./user-card"

interface SocialViewProps {
  users: any[]
  userId: string
  followingIds: string[]
  followerIds: string[]
}

export default function SocialView({ users, userId, followingIds, followerIds }: SocialViewProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter((user) => user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))

  const followingUsers = users.filter((user) => followingIds.includes(user.id))
  const followerUsers = users.filter((user) => followerIds.includes(user.id))

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Community</h1>
        <p className="text-muted-foreground">Connect with others on their wellness journey</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="discover" className="w-full">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="following">
            Following <span className="ml-1 text-muted-foreground">({followingIds.length})</span>
          </TabsTrigger>
          <TabsTrigger value="followers">
            Followers <span className="ml-1 text-muted-foreground">({followerIds.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  currentUserId={userId}
                  isFollowing={followingIds.includes(user.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No users found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          {followingUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followingUsers.map((user) => (
                <UserCard key={user.id} user={user} currentUserId={userId} isFollowing={true} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">You&apos;re not following anyone yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          {followerUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followerUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  currentUserId={userId}
                  isFollowing={followingIds.includes(user.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No followers yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
