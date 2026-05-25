# NutriSense

NutriSense er ein open-source helseapp som hjelper deg å spore mat, aktivitet og helse. Du loggar måltid – anten med tekst, bilete eller stemme – og får AI-analyse av kva du et.

Appen er bygd for det norske marknaden, støttar nynorsk som hovudspråk, og er gratis å bruke.

---

## Funksjonar

### Måltidslogging
- Logg måltid med tekst, foto, stemme eller strekkodeskanning
- Søk i Open Food Facts-databasen (over 3 millionar matvarer)
- Hurtigregistrering av tidlegare lagra måltid
- Logg medikament og symptom saman med måltid

### AI-analyse
- GPT-4o analyserer kva du et og gir næringsinnhald
- Tilpassa råd basert på kosthaldstype (keto, vegansk, middelhavsdiett m.fl.)
- AI-generering av oppskrifter ut frå ingrediensar og preferansar

### Oppskrifter
- Søk i eigne og offentlege oppskrifter
- Lag oppskrifter manuelt eller med AI
- Del oppskrifter med andre brukarar

### Helsesporinga
- Helsediagram som viser blodsukker, HRV, puls og aktivitet
- Korleis måltid påverkar helse over tid

### Integrasjonar
| Teneste | Type | Status |
|---------|------|--------|
| **Strava** | Aktivitet og treningsøkter | Fullt OAuth |
| **Dexcom** | Kontinuerleg glukosenivå (CGM) | Fullt OAuth |
| Withings | Vekt og søvn | Plasshaldrar |
| Stelo by Dexcom | OTC CGM | Plasshaldrar |
| WHOOP | Restitusjon og HRV | Plasshaldrar |

### Internasjonalisering
Appen støttar 8 språk: nynorsk, bokmål, engelsk, svensk, dansk, tysk, spansk og fransk.

---

## Teknologistack

| Lag | Teknologi |
|-----|-----------|
| Rammeverk | Next.js 15 (App Router) |
| Frontend | React 19, TypeScript, Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Autentisering | Supabase Auth |
| AI | OpenAI GPT-4o via Vercel AI SDK |
| Diagram | Recharts |
| Komponentar | shadcn/ui (Radix UI) |
| Skjemavalidering | Zod + React Hook Form |
| Matdatabase | Open Food Facts API |
| Oppskriftsdatabase | TheMealDB API |

---

## Kom i gang

### Krav

- Node.js 18+
- Ein [Supabase](https://supabase.com)-konto (gratis)
- Ein [OpenAI](https://platform.openai.com)-konto med API-nøkkel

### 1. Klon repoet

```bash
git clone https://github.com/tonelok1234/nutrisense.git
cd nutrisense
npm install
```

### 2. Set opp miljøvariablar

Lag ei fil `.env.local` i rota:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://din-prosjekt-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-nøkkel
SUPABASE_SERVICE_ROLE_KEY=din-service-role-nøkkel

# OpenAI
OPENAI_API_KEY=sk-...

# Strava OAuth (valfritt – berre viss du vil bruke Strava-integrasjon)
STRAVA_CLIENT_ID=din-client-id
STRAVA_CLIENT_SECRET=din-client-secret

# Dexcom OAuth (valfritt – berre viss du vil bruke Dexcom-integrasjon)
DEXCOM_CLIENT_ID=din-client-id
DEXCOM_CLIENT_SECRET=din-client-secret
```

### 3. Set opp databasen

Køyr SQL-skriptane i rekkefølge i Supabase SQL Editor:

```bash
scripts/001_create_tables.sql    # Alle tabellar
scripts/002_enable_rls.sql       # Row Level Security
scripts/003_create_triggers.sql  # Automatiske trigger
scripts/004_add_medications_symptoms.sql
scripts/005_add_glucose_logs.sql
```

### 4. Start utviklingsserveren

```bash
npm run dev
```

Appen køyrer på [http://localhost:3000](http://localhost:3000).

---

## Integrasjonar

### Strava

1. Gå til [strava.com/settings/api](https://www.strava.com/settings/api)
2. Opprett ein ny app
3. Set callback URL til `http://localhost:3000/api/integrations/strava/callback`
4. Kopier `Client ID` og `Client Secret` til `.env.local`

### Dexcom

1. Gå til [developer.dexcom.com](https://developer.dexcom.com)
2. Opprett ein ny applikasjon
3. Set redirect URI til `http://localhost:3000/api/integrations/dexcom/callback`
4. Kopier `Client ID` og `Client Secret` til `.env.local`

---

## Prosjektstruktur

```
nutrisense/
├── app/
│   ├── api/                    # API-ruter
│   │   ├── ai/                 # AI-analyse og oppskriftsgenerering
│   │   ├── integrations/       # Strava og Dexcom OAuth
│   │   ├── meals/              # Måltidslogging
│   │   ├── recipes/            # Oppskrifter
│   │   └── ...
│   ├── auth/                   # Innlogging og registrering
│   ├── meals/                  # Hovuddashboard
│   ├── profile/                # Brukarprofil
│   ├── recipes/                # Oppskriftsoversikt
│   └── meal-analyzer/          # AI-måltidsanalyse
│
├── components/
│   ├── meals/                  # Måltidskomponentar
│   │   ├── meal-log-view.tsx       # Hovudvisning
│   │   ├── ai-analysis-section.tsx # AI-analyse
│   │   ├── recipes-section.tsx     # Oppskrifter
│   │   ├── activity-section.tsx    # Aktivitetssporing
│   │   ├── health-analytics-section.tsx # Helsediagram
│   │   └── meal-overview-section.tsx    # Dagleg oversikt
│   ├── recipes/                # Oppskriftskomponentar
│   ├── profile/                # Profilkomponentar
│   └── ui/                     # shadcn/ui basiskomponentar
│
├── lib/
│   ├── types.ts                # TypeScript-typar for alle DB-entitetar
│   ├── rate-limit.ts           # Rate limiting for AI-endepunkt
│   ├── supabase/               # Supabase-klientar (server + browser)
│   └── i18n/                   # Omsetjingssystem (8 språk)
│
├── middleware.ts               # Rutebeskyting (Supabase Auth)
└── scripts/                    # SQL-migrasjonar
```

---

## Sikkerheit

- Alle ruter er beskytta av `middleware.ts` med Supabase-sesjonar
- Row Level Security (RLS) er aktivert på alle tabellar
- Alle POST-ruter validerer inndata med Zod
- AI-endepunkt har rate limiting (10 analysar/time, 5 genereringar/time)

---

## Bidra

Bidrag er velkomne. Opne ein issue eller send ein pull request.

---

## Lisens

MIT
