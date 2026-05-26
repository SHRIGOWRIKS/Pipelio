# JobTrackr — Setup Guide

## 1. Supabase (Free Database)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to **Settings → Database → Connection string → URI**
4. Copy the connection string and paste it into `.env` as `DATABASE_URL`

## 2. Google OAuth (Free)

1. Go to https://console.cloud.google.com
2. Create a new project
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Set application type to **Web application**
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.vercel.app/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret into `.env`

## 3. Generate NextAuth Secret

Run this in your terminal:
```bash
openssl rand -base64 32
```
Paste the output as `NEXTAUTH_SECRET` in `.env`

## 4. Resend (Free Email)

1. Go to https://resend.com and create a free account
2. Create an API key
3. Paste it as `RESEND_API_KEY` in `.env`

## 5. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

## 6. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel (Free)

1. Push your code to GitHub
2. Go to https://vercel.com and import your repo
3. Add all environment variables from `.env` in Vercel project settings
4. Change `NEXTAUTH_URL` to your Vercel URL
5. Deploy!

## Google Analytics (Free)

1. Go to https://analytics.google.com
2. Create a new property
3. Get your Measurement ID (starts with G-)
4. Add it as `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel environment variables

## Google Search Console (Free)

1. Go to https://search.google.com/search-console
2. Add your Vercel URL as a property
3. Verify ownership via HTML tag (add to `src/app/layout.tsx` metadata)
4. Submit your sitemap: `https://yoursite.vercel.app/sitemap.xml`
