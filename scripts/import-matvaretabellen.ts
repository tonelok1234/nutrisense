/**
 * Import Matvaretabellen (Norwegian Food Composition Database) into Supabase.
 *
 * Run with:
 *   npx tsx scripts/import-matvaretabellen.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BASE_URL = "https://www.matvaretabellen.no/api"
const BATCH_SIZE = 200

interface RawNutrient {
  nutrientId: string
  quantity: number | null
}

interface RawFood {
  foodId: string
  foodGroupId: string
  name: string
  nutrients: RawNutrient[]
}

interface RawFoodsResponse {
  foods: RawFood[]
}

function getNutrient(nutrients: RawNutrient[], id: string): number {
  const n = nutrients.find((n) => n.nutrientId === id)
  return n?.quantity ?? 0
}

function toFoodItem(nb: RawFood, en: RawFood | undefined) {
  const protein = getNutrient(nb.nutrients, "Protein")
  const carbs = getNutrient(nb.nutrients, "Karbo")
  const fat = getNutrient(nb.nutrients, "Fett")
  const fiber = getNutrient(nb.nutrients, "Fiber")
  const calories = Math.round(protein * 4 + carbs * 4 + fat * 9)

  return {
    name: nb.name,
    name_nb: nb.name,
    name_en: en?.name ?? null,
    calories,
    protein_g: Math.round(protein * 10) / 10,
    carbs_g: Math.round(carbs * 10) / 10,
    fats_g: Math.round(fat * 10) / 10,
    fiber_g: Math.round(fiber * 10) / 10,
    source: "matvaretabellen",
    external_id: nb.foodId,
    is_public: true,
    is_custom: false,
  }
}

async function fetchFoods(locale: "nb" | "en"): Promise<RawFood[]> {
  console.log(`Lastar ned ${locale} data frå Matvaretabellen...`)
  const res = await fetch(`${BASE_URL}/${locale}/foods.json`)
  if (!res.ok) throw new Error(`Feil ved nedlasting av ${locale}: ${res.status}`)
  const data: RawFoodsResponse = await res.json()
  console.log(`  ${data.foods.length} matvarer lasta ned (${locale})`)
  return data.foods
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Manglar NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY i .env.local")
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const [nbFoods, enFoods] = await Promise.all([fetchFoods("nb"), fetchFoods("en")])

  const enMap = new Map(enFoods.map((f) => [f.foodId, f]))

  const items = nbFoods.map((nb) => toFoodItem(nb, enMap.get(nb.foodId)))

  console.log(`\nSlettar eksisterande Matvaretabellen-data...`)
  const { error: deleteError } = await supabase
    .from("food_items")
    .delete()
    .eq("source", "matvaretabellen")

  if (deleteError) {
    console.error("Feil ved sletting:", deleteError.message)
    process.exit(1)
  }

  console.log(`Importerer ${items.length} matvarer i batchar på ${BATCH_SIZE}...`)
  let imported = 0

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from("food_items").insert(batch)
    if (error) {
      console.error(`Feil i batch ${i}–${i + BATCH_SIZE}:`, error.message)
      process.exit(1)
    }
    imported += batch.length
    process.stdout.write(`\r  ${imported}/${items.length} importert`)
  }

  console.log(`\n\nFerdig! ${imported} matvarer frå Matvaretabellen er no i Supabase.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
