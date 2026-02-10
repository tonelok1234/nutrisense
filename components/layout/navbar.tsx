"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Apple, Home, ChefHat, Users, User } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Apple className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              NutriSense
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/meals"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                isActive("/meals") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Apple className="h-4 w-4" />
              Meals
            </Link>
            <Link
              href="/recipes"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                isActive("/recipes") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <ChefHat className="h-4 w-4" />
              Recipes
            </Link>
            <Link
              href="/social"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                isActive("/social") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Users className="h-4 w-4" />
              Social
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/profile">
                <User className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
