"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Apple,
  ChefHat,
  User,
  UtensilsCrossed,
  Brain,
  Activity,
  HeartPulse,
  Settings,
  Sparkles,
  Menu,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n/language-context"

const defaultEnabledItems = [
  "meals",
  "meal-analyzer",
  "recipes",
  "reaction-analysis",
  "health-integrations",
  "activity",
  "profile",
]

export default function TopNav() {
  const pathname = usePathname()
  const [enabledItems, setEnabledItems] = useState<string[]>(defaultEnabledItems)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useLanguage()

  const allNavItems = [
    { id: "meals", href: "/meals", label: t("nav.meals"), icon: UtensilsCrossed, category: t("category.food") },
    {
      id: "meal-analyzer",
      href: "/meal-analyzer",
      label: t("nav.analysis"),
      icon: Brain,
      category: t("category.food"),
    },
    { id: "recipes", href: "/recipes", label: t("nav.recipes"), icon: ChefHat, category: t("category.ai") },
    {
      id: "reaction-analysis",
      href: "/reaction-analysis",
      label: t("nav.reactions"),
      icon: Sparkles,
      category: t("category.ai"),
    },
    {
      id: "health-integrations",
      href: "/health-integrations",
      label: t("nav.integrations"),
      icon: HeartPulse,
      category: t("category.health"),
    },
    { id: "activity", href: "/activity", label: t("nav.activity"), icon: Activity, category: t("category.health") },
    {
      id: "profile",
      href: "/profile",
      label: t("nav.profile"),
      icon: Settings,
      category: t("category.account"),
      alwaysVisible: true,
    },
  ]

  const categories = [t("category.food"), t("category.ai"), t("category.health"), t("category.account")]

  useEffect(() => {
    const saved = localStorage.getItem("nutrisense-nav-items")
    if (saved) {
      try {
        setEnabledItems(JSON.parse(saved))
      } catch {
        setEnabledItems(defaultEnabledItems)
      }
    }
  }, [])

  const toggleItem = (itemId: string) => {
    const item = allNavItems.find((i) => i.id === itemId)
    if (item?.alwaysVisible) return

    setEnabledItems((prev) => {
      const newItems = prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      localStorage.setItem("nutrisense-nav-items", JSON.stringify(newItems))
      return newItems
    })
  }

  const toggleCategory = (category: string) => {
    const categoryItems = allNavItems.filter((item) => item.category === category).map((item) => item.id)
    const allEnabled = categoryItems.every((id) => enabledItems.includes(id))

    setEnabledItems((prev) => {
      const newItems = allEnabled
        ? prev.filter((id) => !categoryItems.includes(id))
        : [...new Set([...prev, ...categoryItems])]
      localStorage.setItem("nutrisense-nav-items", JSON.stringify(newItems))
      return newItems
    })
  }

  if (pathname === "/") return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/meals" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Apple className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold text-xl">
            NutriSense
          </span>
        </Link>

        {/* Right side: Customize + Profile */}
        <div className="flex items-center gap-2">
          {/* Customize Dropdown - Desktop */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Settings className="h-4 w-4" />
                  <span>{t("nav.customize")}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 py-1.5 text-sm font-semibold">{t("nav.showHide")}</div>
                <DropdownMenuSeparator />
                {categories.map((category) => {
                  const categoryItems = allNavItems.filter((item) => item.category === category)
                  const allEnabled = categoryItems.every((item) => enabledItems.includes(item.id))
                  const someEnabled = categoryItems.some((item) => enabledItems.includes(item.id))

                  return (
                    <div key={category}>
                      <DropdownMenuCheckboxItem
                        checked={allEnabled}
                        onCheckedChange={() => toggleCategory(category)}
                        className="font-medium"
                      >
                        {allEnabled ? <Eye className="h-3 w-3 mr-2" /> : <EyeOff className="h-3 w-3 mr-2 opacity-50" />}
                        {category}
                        {someEnabled && !allEnabled && (
                          <span className="ml-auto text-xs text-muted-foreground">{t("category.partial")}</span>
                        )}
                      </DropdownMenuCheckboxItem>
                      {categoryItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <DropdownMenuCheckboxItem
                            key={item.id}
                            checked={enabledItems.includes(item.id)}
                            onCheckedChange={() => toggleItem(item.id)}
                            className="pl-8"
                            disabled={item.alwaysVisible}
                          >
                            <Icon className="h-3 w-3 mr-2" />
                            {item.label}
                            {item.alwaysVisible && (
                              <span className="ml-auto text-xs text-muted-foreground">Alltid synleg</span>
                            )}
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                      <DropdownMenuSeparator />
                    </div>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Profile Avatar */}
          <Link href="/profile">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </Link>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetTitle className="text-left mb-4">{t("nav.customize")}</SheetTitle>
                <div className="flex flex-col gap-4">
                  {/* Customize Section */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {t("nav.showHide")}
                    </h3>
                    {categories.map((category) => {
                      const categoryItems = allNavItems.filter((item) => item.category === category)
                      const allEnabled = categoryItems.every((item) => enabledItems.includes(item.id))

                      return (
                        <div key={category} className="mb-3">
                          <button
                            type="button"
                            onClick={() => toggleCategory(category)}
                            className={cn(
                              "flex items-center gap-2 w-full text-left px-2 py-1 rounded text-sm font-medium",
                              allEnabled ? "text-foreground" : "text-muted-foreground",
                            )}
                          >
                            {allEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            {category}
                          </button>
                          <div className="ml-6 space-y-1 mt-1">
                            {categoryItems.map((item) => {
                              const Icon = item.icon
                              const isEnabled = enabledItems.includes(item.id)
                              return (
                                <button
                                  type="button"
                                  key={item.id}
                                  onClick={() => toggleItem(item.id)}
                                  className={cn(
                                    "flex items-center gap-2 w-full text-left px-2 py-1 rounded text-xs",
                                    isEnabled ? "text-foreground" : "text-muted-foreground",
                                  )}
                                  disabled={item.alwaysVisible}
                                >
                                  <Icon className="h-3 w-3" />
                                  <span className="flex-1">{item.label}</span>
                                  {isEnabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Profile Link */}
                  <div className="border-t pt-4">
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <User className="h-5 w-5" />
                      <span>{t("nav.profile")}</span>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
