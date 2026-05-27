# CalmCut — AI Weight Loss & Nutrition Tracker

## Quick Start

### 1. Clone & Install
```bash
git clone <repo>
cd calmcut
npm install --legacy-peer-deps
```

### 2. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon public key**
3. Run the migration SQL from `supabase/migrations/001_initial_schema.sql` in the SQL Editor
4. Enable Google OAuth in Authentication → Providers

### 3. Configure Environment
```bash
cp .env.example .env.local
```
Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=optional_for_enhanced_ai  # Optional
```

### 4. Run
```bash
npm run dev
```

### 5. Deploy to Vercel
```bash
npx vercel --prod
```
Set the same env vars in Vercel dashboard.

---

## Features
- **Dashboard** — weight trend, calorie chart, hunger/craving trends, quick-add
- **Daily Log** — meal logging by category, hunger sliders, water tracking, notes
- **Progress** — weight history, BMI, deficit calculator, 7/30/all time charts
- **Weight** — dedicated weigh-in tracker with smoothed trend line
- **Meal Library** — 10 preset foods + custom food builder
- **AI Coach** — conversational chat + daily/weekly insights
- **Settings** — goals, calorie targets, theme

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- TailwindCSS + Framer Motion
- Recharts for all charts
- Supabase (Auth + Postgres + RLS)
- Zustand for client state
- Sonner for toasts

## Target User
Male, 39yo, office worker, sedentary lifestyle, 83kg → 75kg goal.
Daily calorie target: 1700 kcal (estimated ~400 kcal deficit/day).
