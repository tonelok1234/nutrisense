"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const analysisSchema = z.object({
  summary: z.string().describe("Kort oppsummering av mønster funne i perioden (2-3 setningar)"),
  correlations: z.array(z.object({
    trigger: z.string().describe("Mogleg utløysande faktor, t.d. ei matvare eller eit måltidsmønster"),
    symptom: z.string().describe("Symptom eller reaksjon som oppstod"),
    timePattern: z.string().describe("Tidsmønster, t.d. 'symptom oppstod 1-2 timar etter måltid'"),
    confidence: z.number().min(0).max(100).describe("Kor sikker mønstergjenkjenninga er (0-100), basert på kor mange gonger mønsteret vart observert"),
    evidenceBasis: z.string().describe("Kva ernæringsvitskapleg kunnskap støttar denne samanhengen"),
  })),
  optimalPatterns: z.array(z.string()).describe("Dagar eller måltidsmønster der brukaren rapporterte det bra – kva kjenneteiknar desse?"),
  suggestions: z.array(z.object({
    suggestion: z.string().describe("Konkret og handlingsretta anbefaling"),
    reasoning: z.string().describe("Grunngiving basert på logga data og ernæringsvitskap"),
  })),
  dataQuality: z.enum(["low", "medium", "high"]).describe("Kvalitet på datagrunnlaget – 'low' = for lite data for sikre konklusjonar"),
  disclaimer: z.string().describe("Kort og ærleg disclaimer om grensene for analysen"),
})

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Ikkje innlogga" }, { status: 401 })
  }

  const { startDate, endDate } = await request.json()

  // Hent måltidsloggar
  const { data: meals } = await supabase
    .from("meal_logs")
    .select("meal_date, meal_time, meal_type, notes, ai_analysis")
    .eq("user_id", user.id)
    .gte("meal_date", startDate)
    .lte("meal_date", endDate)
    .order("meal_date", { ascending: true })
    .order("meal_time", { ascending: true })

  // Hent symptomloggar
  const { data: symptoms } = await supabase
    .from("symptom_logs")
    .select("logged_at, description, severity, notes")
    .eq("user_id", user.id)
    .gte("logged_at", `${startDate}T00:00:00`)
    .lte("logged_at", `${endDate}T23:59:59`)
    .order("logged_at", { ascending: true })

  const mealCount = meals?.length ?? 0
  const symptomCount = symptoms?.length ?? 0

  if (mealCount === 0 && symptomCount === 0) {
    return NextResponse.json({ error: "Ingen logga data i denne perioden" }, { status: 400 })
  }

  // Bygg opp lesbar datasummary for AI
  const mealSummary = (meals ?? []).map(m => {
    const analysis = m.ai_analysis as any
    const cal = analysis?.total_calories ?? "ukjent"
    const protein = analysis?.total_protein ?? "?"
    const carbs = analysis?.total_carbs ?? "?"
    const fat = analysis?.total_fats ?? "?"
    const items = analysis?.items?.map((i: any) => i.name).join(", ") ?? m.notes ?? "ukjent"
    return `${m.meal_date} kl.${m.meal_time?.slice(0,5)} [${m.meal_type}]: ${items} (${cal} kcal, protein ${protein}g, karbo ${carbs}g, feitt ${fat}g)`
  }).join("\n")

  const symptomSummary = (symptoms ?? []).map(s => {
    const time = new Date(s.logged_at).toLocaleString("no-NO", { dateStyle: "short", timeStyle: "short" })
    return `${time}: ${s.description} (alvorlegheit ${s.severity}/10)${s.notes ? " – " + s.notes : ""}`
  }).join("\n")

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: analysisSchema,
      system: `Du er ein ernæringsassistent som hjelper brukarar å forstå samanhengar mellom mat og helse.

VIKTIGE PRINSIPP:
1. Baser deg KUN på faktisk logga data – dikta ikkje opp mønster
2. Ver ærleg om kor lite data som finst – er det under 7 dagar med data, sei tydeleg at grunnlaget er avgrensa
3. Bruk etablert ernæringsvitskap – ikkje spekuler
4. Ver konkret og handlingsretta, ikkje vag
5. Skill tydeleg mellom "observert mønster" og "mogleg samanheng"
6. Sei alltid at dette IKKJE er medisinsk diagnose og at lege bør kontaktast ved alvorlege symptom
7. Svar på nynorsk`,
      messages: [{
        role: "user",
        content: `Analyser desse helseloggar frå perioden ${startDate} til ${endDate}:

MÅLTID (${mealCount} logga):
${mealSummary || "Ingen måltid logga"}

SYMPTOM (${symptomCount} logga):
${symptomSummary || "Ingen symptom logga"}

Finn mønster, samanhengar og gi konkrete, evidensbaserte anbefalingar.`
      }]
    })

    return NextResponse.json({ analysis: object, mealCount, symptomCount })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
