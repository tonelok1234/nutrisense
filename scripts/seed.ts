/**
 * Seed-script for NutriSense
 * Køyr med: npx tsx scripts/seed.ts
 *
 * Krev at NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY
 * er sett i .env.local
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as fs from "fs"
import * as path from "path"

// Last inn .env.local
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8")
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=")
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join("=").trim()
    }
  })
}

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("Åtvaring: SUPABASE_SERVICE_ROLE_KEY manglar – brukar anon-nøkkel (kan feile pga. RLS)")
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey
)

const recipes = [
  {
    title: "Laks med grønsaker og søtpotet",
    description: "Enkel og næringsrik middag med omega-3-rik laks og fargerike grønsaker.",
    ingredients: [
      { quantity: "150", unit: "g", name: "Laks" },
      { quantity: "200", unit: "g", name: "Søtpotet" },
      { quantity: "100", unit: "g", name: "Brokkoli" },
      { quantity: "1", unit: "ss", name: "Olivenolje" },
      { quantity: "1", unit: "ts", name: "Sitronpepar" },
    ],
    instructions: [
      "Sett omnen på 200 grader.",
      "Skjer søtpotet i terningar og ha på eit stekebrett med olivenolje.",
      "Stek søtpotet i 20 minutt.",
      "Legg laksen på brettet og dryss over sitronpepar.",
      "Stek vidare i 12–15 minutt til laksen er gjennomstekt.",
      "Damp brokkolien i 5 minutt og server alt saman.",
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 35,
    servings: 2,
    difficulty: "easy",
    tags: ["middag", "fisk", "omega-3", "glutenfri"],
    nutritional_info: { calories: 445, protein: 38, carbs: 32, fats: 16, fiber: 6 },
    is_ai_generated: false,
    is_public: true,
  },
  {
    title: "Havregraut med bær og nøtter",
    description: "Mettande frukost som gir deg energi heile morgonen.",
    ingredients: [
      { quantity: "80", unit: "g", name: "Havregryn" },
      { quantity: "250", unit: "ml", name: "Havremelk" },
      { quantity: "100", unit: "g", name: "Blandabær" },
      { quantity: "30", unit: "g", name: "Mandlar" },
      { quantity: "1", unit: "ts", name: "Honning" },
    ],
    instructions: [
      "Kok opp havremelk i ein kjele.",
      "Ha i havregryn og rør godt.",
      "La småkoke i 5 minutt til ynskt konsistens.",
      "Ha i ein bolle og topp med bær, mandlar og honning.",
    ],
    prep_time_minutes: 2,
    cook_time_minutes: 7,
    servings: 1,
    difficulty: "easy",
    tags: ["frukost", "vegansk", "fiber"],
    nutritional_info: { calories: 420, protein: 12, carbs: 58, fats: 14, fiber: 9 },
    is_ai_generated: false,
    is_public: true,
  },
  {
    title: "Kylling og quinoasalat",
    description: "Frisk og proteinrik lunsj med urter og sitron.",
    ingredients: [
      { quantity: "150", unit: "g", name: "Kyllingbryst" },
      { quantity: "80", unit: "g", name: "Quinoa" },
      { quantity: "50", unit: "g", name: "Rucola" },
      { quantity: "100", unit: "g", name: "Cherrytomatar" },
      { quantity: "0.5", unit: "stk", name: "Agurk" },
      { quantity: "2", unit: "ss", name: "Olivenolje" },
      { quantity: "1", unit: "stk", name: "Sitron (juice)" },
    ],
    instructions: [
      "Kok quinoa etter pakningsrettleiing (ca. 15 minutt).",
      "Grill eller stek kyllingen i 12–15 minutt.",
      "Del tomatar og agurk i bitar.",
      "Bland quinoa, grønsaker og rucola.",
      "Skjær kyllingen i strimlar og legg på toppen.",
      "Dryss over olivenolje og sitronsaft.",
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 2,
    difficulty: "easy",
    tags: ["lunsj", "kylling", "proteinrik", "glutenfri"],
    nutritional_info: { calories: 380, protein: 34, carbs: 28, fats: 14, fiber: 4 },
    is_ai_generated: false,
    is_public: true,
  },
  {
    title: "Vegetarisk grønsakscurry",
    description: "Krydra og næringsrik curry med kokosmelk og sesonggrønsaker.",
    ingredients: [
      { quantity: "400", unit: "ml", name: "Kokosmelk" },
      { quantity: "2", unit: "ss", name: "Raud curry-paste" },
      { quantity: "200", unit: "g", name: "Kikert" },
      { quantity: "150", unit: "g", name: "Spinat" },
      { quantity: "1", unit: "stk", name: "Søtpotet" },
      { quantity: "1", unit: "stk", name: "Paprika" },
      { quantity: "200", unit: "g", name: "Basmatiris" },
    ],
    instructions: [
      "Kok ris etter pakningsrettleiing.",
      "Stek curry-paste i ein gryte i 1 minutt.",
      "Ha i kokosmelk og la koke opp.",
      "Ha i søtpotet i terningar og paprika. Kok 15 minutt.",
      "Ha i kikert og spinat. Kok 5 minutt til.",
      "Server med ris.",
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 25,
    servings: 3,
    difficulty: "easy",
    tags: ["middag", "vegetar", "vegansk", "curry"],
    nutritional_info: { calories: 490, protein: 14, carbs: 68, fats: 18, fiber: 10 },
    is_ai_generated: false,
    is_public: true,
  },
  {
    title: "Pasta Primavera",
    description: "Lett og fargerik pasta med ferske grønsaker og parmesanost.",
    ingredients: [
      { quantity: "200", unit: "g", name: "Penne" },
      { quantity: "100", unit: "g", name: "Cherrytomatar" },
      { quantity: "1", unit: "stk", name: "Courgette" },
      { quantity: "1", unit: "stk", name: "Paprika" },
      { quantity: "2", unit: "fedd", name: "Kvitløk" },
      { quantity: "3", unit: "ss", name: "Olivenolje" },
      { quantity: "40", unit: "g", name: "Parmesan" },
    ],
    instructions: [
      "Kok pasta al dente.",
      "Stek kvitløk i olivenolje i 1 minutt.",
      "Ha i courgette og paprika. Stek 5 minutt.",
      "Ha i tomatar og stek 3 minutt til.",
      "Bland inn pasta og server med rive parmesan.",
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 2,
    difficulty: "easy",
    tags: ["middag", "pasta", "vegetar"],
    nutritional_info: { calories: 510, protein: 18, carbs: 72, fats: 16, fiber: 5 },
    is_ai_generated: false,
    is_public: true,
  },
]

async function seed() {
  console.log("Startar seed...")

  const { data: existing, error: checkError } = await supabase
    .from("recipes")
    .select("id")
    .eq("is_public", true)
    .limit(1)

  if (checkError) {
    console.error("Feil ved tilkobling til Supabase:", checkError.message)
    console.log("\nSjekk at NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY er riktige i .env.local")
    process.exit(1)
  }

  if (existing && existing.length > 0) {
    console.log("Det finst allereie offentlege oppskrifter. Hoppar over seed.")
    process.exit(0)
  }

  const { error } = await supabase.from("recipes").insert(
    recipes.map((r) => ({ ...r, user_id: null }))
  )

  if (error) {
    console.error("Feil ved innsetjing:", error.message)
    process.exit(1)
  }

  console.log(`✓ Lagt til ${recipes.length} oppskrifter`)
  console.log("Seed fullført!")
}

seed()
