# NUTVORA

Premium NUTVORA storefront built with Next.js, Supabase Auth, and PostgreSQL-compatible SQL.

## Local development

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000` to see the storefront.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the project URL and anon key into `.env.local`.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Enable Email and Google providers in Supabase Authentication.
5. Add `http://localhost:3000/auth/callback` to Supabase redirect URLs.

For Google, create OAuth credentials in Google Cloud and use the callback URL shown in Supabase Authentication provider settings.

## Vercel deployment

Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD` to the Vercel project, then add `https://your-domain.vercel.app/auth/callback` to Supabase redirect URLs. Never expose the service role key or Gmail app password with a `NEXT_PUBLIC_` prefix. The SQL schema works with Supabase PostgreSQL and a local PostgreSQL-compatible database.

## Orders and email

The checkout posts to `/api/orders`. The server recalculates prices from the catalog, saves the order and line items in Supabase, and emails `saberbradaiset23@gmail.com` through Gmail SMTP. Gmail requires 2-Step Verification and a 16-character App Password; your normal Gmail password will not work.

## Checks

```bash
npm run lint
npm run build
```
