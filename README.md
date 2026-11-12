# PawPath Manila — Centralized Animal Adoption, Nutrition & Healthcare System

A responsive, full-stack Metro Manila civic animal welfare platform built with **React + TypeScript + Tailwind CSS**, **Google Maps Platform (`@vis.gl/react-google-maps`)**, and **Supabase (PostgreSQL, Auth, Realtime, Storage)** — with an automatic **Hybrid `localStorage` Demo Mode** so every feature works immediately out of the box.

## 1. Supabase Setup

1. Create a new project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire contents of `supabase/schema.sql`.
   - This creates all 9 tables (`profiles`, `pets`, `adoption_applications`, `ra10631_agreements`, `messages`, `health_centers`, `food_shops`, `supply_orders`, `contact_messages`), Row Level Security (RLS) policies, Realtime publications, the `pet-photos` Storage bucket, and Metro Manila seed data.
4. Go to **Project Settings → API** and copy your `Project URL` and `anon public` key.

## 2. Environment Variables

Copy `.env.example` to `.env` (for local development) or configure these in **Vercel → Project Settings → Environment Variables**:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

## 3. Deploy to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the repository into [Vercel](https://vercel.com).
3. Framework Preset: **Vite** (`npm run build`, output directory `dist`).
4. Add the environment variables above and click **Deploy**.
5. `vercel.json` automatically handles SPA client-side routing and security headers.

## 4. Legal & Welfare Compliance

- **RA 10631 (Animal Welfare Act of the Philippines):** Adoption flows enforce a mandatory digital evaluation and RA 10631 compliance agreement before transitioning a pet to `Ongoing Adoption` or `Pet Adopted`.
- **Supply-Only Reservations:** Pet food and supply reservations strictly exclude live animal delivery.
- **Emergency Triage Notice:** Veterinary tele-guidance clearly directs critical emergencies to physical Manila clinics.
