import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Sparkles, Activity, Pill, AlertCircle, ChefHat, CheckCircle2, ArrowRight, Heart, LineChart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12 sm:py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-100 rounded-full mb-4 sm:mb-6">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="text-xs sm:text-sm font-medium text-green-700">All-in-one health app</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-balance mb-4 sm:mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Track health and nutrition easily with NutriSense
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 text-balance max-w-2xl mx-auto px-2">
              Log meals, medication and symptoms. Track activity and analyze how your body responds to what you eat and do.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button asChild size="lg" className="text-base sm:text-lg">
                <Link href="/meals">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base sm:text-lg bg-transparent">
                <Link href="/profile">Settings</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Everything you need in one place
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Complete tools for tracking, analyzing and improving your health
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
            <Card className="border shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <CardTitle className="text-base sm:text-lg">Meal Logging</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Log meals with photo, voice, barcode or manually. Previous meals appear as suggestions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Pill className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <CardTitle className="text-base sm:text-lg">Medication & Supplements</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Keep track of medicine, vitamins and supplements you take each day.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <CardTitle className="text-base sm:text-lg">Symptom Tracking</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Record symptoms with text or photos to find connections with food and activity.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <CardTitle className="text-base sm:text-lg">Activity Tracking</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Track steps, calories, workouts and active minutes to see the complete picture.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <LineChart className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
                </div>
                <CardTitle className="text-base sm:text-lg">Health Analysis</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  See how blood sugar, HRV, heart rate and stress change in relation to meals and activity.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
                </div>
                <CardTitle className="text-base sm:text-lg">Recipes</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Browse recipes or generate new ones with AI based on diet and preferences.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">How it works</h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Get started in minutes and take control of your health
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Log meals</h3>
              <p className="text-xs sm:text-base text-muted-foreground px-2">
                Take a photo, use voice, scan barcode or manually enter what you ate
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Record health</h3>
              <p className="text-xs sm:text-base text-muted-foreground px-2">
                Enter medication, supplements and symptoms for a complete picture
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Analyze data</h3>
              <p className="text-xs sm:text-base text-muted-foreground px-2">
                See connections between food, activity and how your body responds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Why choose NutriSense?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex gap-3 sm:gap-4 p-3 sm:p-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                <div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">Easy logging</h3>
                  <p className="text-xs sm:text-base text-muted-foreground">
                    Multiple ways to log meals - photo, voice, barcode or manual entry
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 p-3 sm:p-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                <div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">Complete overview</h3>
                  <p className="text-xs sm:text-base text-muted-foreground">
                    Meals, medication, symptoms and activity in one place
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 p-3 sm:p-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                <div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">AI analysis</h3>
                  <p className="text-xs sm:text-base text-muted-foreground">
                    Get personalized suggestions for improvement based on your chosen diet
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 p-3 sm:p-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                <div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">Health integrations</h3>
                  <p className="text-xs sm:text-base text-muted-foreground">
                    Connect to Apple Health, Garmin, Stelo and more
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 p-3 sm:p-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                <div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">Recipe database</h3>
                  <p className="text-xs sm:text-base text-muted-foreground">
                    Browse recipes or generate new ones with AI
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 p-3 sm:p-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                <div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">Multilingual</h3>
                  <p className="text-xs sm:text-base text-muted-foreground">
                    Support for Norwegian, English and more languages
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 text-balance">
            Ready to take control of your health?
          </h2>
          <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Start by logging your first meal today
          </p>
          <Button asChild size="lg" variant="secondary" className="text-base sm:text-lg">
            <Link href="/meals">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                NutriSense
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Your AI-powered health app for a healthier life.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">App</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link href="/meals" className="text-gray-400 hover:text-white transition-colors">
                    Meals
                  </Link>
                </li>
                <li>
                  <Link href="/analysis" className="text-gray-400 hover:text-white transition-colors">
                    Analysis
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Account</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2026 NutriSense. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
