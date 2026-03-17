import { NextResponse } from "next/server"

const BASE = "https://www.themealdb.com/api/json/v1/1"
const HEADERS = { "User-Agent": "NutriSense/1.0" }

// Map NutriSense-faner til TheMealDB-kategoriar
const TAB_CATEGORIES: Record<string, string[]> = {
  breakfast: ["Breakfast"],
  lunch: ["Soup", "Starter", "Side"],
  dinner: ["Chicken", "Beef", "Seafood", "Pasta", "Vegetarian", "Lamb", "Pork"],
  snacks: ["Dessert", "Miscellaneous"],
}

function mapMeal(m: any) {
  return {
    id: `mdb-${m.idMeal}`,
    mealdb_id: m.idMeal,
    title: m.strMeal,
    description: m.strCategory ? `${m.strArea || ""} ${m.strCategory}`.trim() : "",
    image: m.strMealThumb || null,
    tags: m.strTags ? m.strTags.split(",").map((t: string) => t.trim().toLowerCase()) : [],
    prep_time: null,
    servings: null,
    calories: null,
    source: "themealdb",
  }
}

async function fetchCategory(category: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`, {
      headers: HEADERS,
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return []
    const data = await res.json()
    return (data.meals || []).slice(0, 12).map(mapMeal)
  } catch {
    clearTimeout(timeout)
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tab = searchParams.get("tab")
  const search = searchParams.get("search")

  if (search && search.trim().length >= 2) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(search)}`, {
        headers: HEADERS,
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) return NextResponse.json({ meals: [] })
      const data = await res.json()
      const meals = (data.meals || []).map(mapMeal)
      return NextResponse.json({ meals })
    } catch {
      clearTimeout(timeout)
      return NextResponse.json({ meals: [], error: "Søket tima ut" })
    }
  }

  if (tab && TAB_CATEGORIES[tab]) {
    const categories = TAB_CATEGORIES[tab]
    const results = await Promise.all(categories.map(fetchCategory))
    const meals = results.flat()
    return NextResponse.json({ meals })
  }

  return NextResponse.json({ meals: [] })
}
