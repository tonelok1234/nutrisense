import { NextResponse } from "next/server"

const HEADERS = { "User-Agent": "NutriSense/1.0 (kontakt@nutrisense.no)" }

function mapProduct(p: any) {
  return {
    id: p._id || p.id || p.code,
    name: p.product_name || p.product_name_no || p.product_name_en || "Ukjent produkt",
    brand: p.brands || null,
    serving_size: p.serving_size || "100g",
    image: p.image_thumb_url || p.image_small_url || null,
    calories: Math.round(p.nutriments?.["energy-kcal_100g"] || 0),
    protein: Math.round((p.nutriments?.["proteins_100g"] || 0) * 10) / 10,
    carbs: Math.round((p.nutriments?.["carbohydrates_100g"] || 0) * 10) / 10,
    fat: Math.round((p.nutriments?.["fat_100g"] || 0) * 10) / 10,
    fiber: Math.round((p.nutriments?.["fiber_100g"] || 0) * 10) / 10,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const barcode = searchParams.get("barcode")

  if (barcode) {
    const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`
    const response = await fetch(url, { headers: HEADERS })
    if (!response.ok) return NextResponse.json({ product: null })
    const data = await response.json()
    if (data.status !== 1 || !data.product) return NextResponse.json({ product: null })
    return NextResponse.json({ product: mapProduct(data.product) })
  }

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ products: [] })
  }

  const url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(query)}&page_size=10&fields=_id,product_name,product_name_no,product_name_en,brands,nutriments,serving_size,image_thumb_url,image_small_url`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  let response: Response
  try {
    response = await fetch(url, { headers: HEADERS, signal: controller.signal })
  } catch (err: any) {
    clearTimeout(timeout)
    const msg = err?.name === "AbortError" ? "Søket tima ut – prøv igjen" : "Kunne ikkje nå matdatabasen"
    return NextResponse.json({ error: msg, products: [] }, { status: 502 })
  }
  clearTimeout(timeout)
  if (!response.ok) return NextResponse.json({ error: "Søk feila", products: [] }, { status: 502 })

  const data = await response.json()
  const products = (data.products || [])
    .filter((p: any) => (p.product_name || p.product_name_no) && p.nutriments)
    .map(mapProduct)

  return NextResponse.json({ products })
}
