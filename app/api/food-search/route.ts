import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const OFF_HEADERS = { "User-Agent": "NutriSense/1.0 (kontakt@nutrisense.no)" }

// Languages that show Norwegian names; all others get English
const NORWEGIAN_LOCALES = new Set(["nb", "nn"])

function pickName(row: { name: string; name_nb: string | null; name_en: string | null }, lang: string) {
  if (NORWEGIAN_LOCALES.has(lang)) return row.name_nb ?? row.name
  return row.name_en ?? row.name_nb ?? row.name
}

function mapSupabaseFood(row: {
  id: string
  name: string
  name_nb: string | null
  name_en: string | null
  brand: string | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fats_g: number | null
  fiber_g: number | null
  source: string | null
}, lang: string) {
  return {
    id: row.id,
    name: pickName(row, lang),
    brand: row.brand,
    serving_size: "100g",
    image: null,
    calories: row.calories ?? 0,
    protein: row.protein_g ?? 0,
    carbs: row.carbs_g ?? 0,
    fat: row.fats_g ?? 0,
    fiber: row.fiber_g ?? 0,
    source: row.source ?? "custom",
  }
}

function mapOffProduct(p: {
  _id?: string; id?: string; code?: string
  product_name?: string; product_name_no?: string; product_name_en?: string
  brands?: string; serving_size?: string
  image_thumb_url?: string; image_small_url?: string
  nutriments?: Record<string, number>
}) {
  return {
    id: p._id ?? p.id ?? p.code,
    name: p.product_name ?? p.product_name_no ?? p.product_name_en ?? "Ukjent produkt",
    brand: p.brands ?? null,
    serving_size: p.serving_size ?? "100g",
    image: p.image_thumb_url ?? p.image_small_url ?? null,
    calories: Math.round(p.nutriments?.["energy-kcal_100g"] ?? 0),
    protein: Math.round((p.nutriments?.["proteins_100g"] ?? 0) * 10) / 10,
    carbs: Math.round((p.nutriments?.["carbohydrates_100g"] ?? 0) * 10) / 10,
    fat: Math.round((p.nutriments?.["fat_100g"] ?? 0) * 10) / 10,
    fiber: Math.round((p.nutriments?.["fiber_100g"] ?? 0) * 10) / 10,
    source: "open_food_facts",
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const barcode = searchParams.get("barcode")
  const lang = searchParams.get("lang") ?? "nb"

  // Barcode lookup – Open Food Facts only
  if (barcode) {
    const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`
    const res = await fetch(url, { headers: OFF_HEADERS })
    if (!res.ok) return NextResponse.json({ product: null })
    const data = await res.json()
    if (data.status !== 1 || !data.product) return NextResponse.json({ product: null })
    return NextResponse.json({ product: mapOffProduct(data.product) })
  }

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ products: [] })
  }

  const supabase = await createClient()

  // Search Matvaretabellen in Supabase
  const nameField = NORWEGIAN_LOCALES.has(lang) ? "name_nb" : "name_en"
  const { data: localResults } = await supabase
    .from("food_items")
    .select("id, name, name_nb, name_en, brand, calories, protein_g, carbs_g, fats_g, fiber_g, source")
    .eq("source", "matvaretabellen")
    .ilike(nameField, `%${query}%`)
    .limit(10)

  if (localResults && localResults.length >= 5) {
    return NextResponse.json({ products: localResults.map((r) => mapSupabaseFood(r, lang)) })
  }

  // Fall back to Open Food Facts if too few local results
  const offUrl = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(query)}&page_size=${10 - (localResults?.length ?? 0)}&fields=_id,product_name,product_name_no,product_name_en,brands,nutriments,serving_size,image_thumb_url,image_small_url`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  let offResults: ReturnType<typeof mapOffProduct>[] = []
  try {
    const res = await fetch(offUrl, { headers: OFF_HEADERS, signal: controller.signal })
    clearTimeout(timeout)
    if (res.ok) {
      const data = await res.json()
      offResults = (data.products ?? [])
        .filter((p: { product_name?: string; product_name_no?: string; nutriments?: unknown }) =>
          (p.product_name ?? p.product_name_no) && p.nutriments)
        .map(mapOffProduct)
    }
  } catch {
    clearTimeout(timeout)
  }

  const combined = [...(localResults ?? []).map((r) => mapSupabaseFood(r, lang)), ...offResults]
  return NextResponse.json({ products: combined })
}
