/**
 * Import Matvaretabellen into Supabase.
 * Run with: node --env-file=.env.local scripts/import-matvaretabellen.mjs
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BASE_URL = "https://www.matvaretabellen.no/api"
const BATCH_SIZE = 200

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Manglar NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY i .env.local")
  process.exit(1)
}

function getConstituent(constituents, id) {
  return constituents?.find((c) => c.nutrientId === id)?.quantity ?? 0
}

function toFoodItem(nb, en) {
  const protein = getConstituent(nb.constituents, "Protein")
  const carbs = getConstituent(nb.constituents, "Karbo")
  const fat = getConstituent(nb.constituents, "Fett")
  const fiber = getConstituent(nb.constituents, "Fiber")
  const calories = nb.calories?.quantity ?? Math.round(protein * 4 + carbs * 4 + fat * 9)

  return {
    name: nb.foodName,
    name_nb: nb.foodName,
    name_en: en?.foodName ?? null,
    calories: Math.round(calories),
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

async function fetchFoods(locale) {
  console.log(`Lastar ned ${locale} data...`)
  const res = await fetch(`${BASE_URL}/${locale}/foods.json`)
  if (!res.ok) throw new Error(`Feil ved nedlasting (${locale}): ${res.status}`)
  const data = await res.json()
  console.log(`  ${data.foods.length} matvarer (${locale})`)
  return data.foods
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const [nbFoods, enFoods] = await Promise.all([fetchFoods("nb"), fetchFoods("en")])
const enMap = new Map(enFoods.map((f) => [f.foodId, f]))
const items = nbFoods.map((nb) => toFoodItem(nb, enMap.get(nb.foodId)))

console.log(`\nSlettar gammal Matvaretabellen-data...`)
const { error: deleteError } = await supabase.from("food_items").delete().eq("source", "matvaretabellen")
if (deleteError) { console.error(deleteError.message); process.exit(1) }

console.log(`Importerer ${items.length} matvarer...`)
let imported = 0
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const { error } = await supabase.from("food_items").insert(items.slice(i, i + BATCH_SIZE))
  if (error) { console.error(`Feil i batch ${i}: ${error.message}`); process.exit(1) }
  imported += Math.min(BATCH_SIZE, items.length - i)
  process.stdout.write(`\r  ${imported}/${items.length}`)
}

console.log(`\n\nFerdig! ${imported} matvarer frå Matvaretabellen er no i Supabase.`)
