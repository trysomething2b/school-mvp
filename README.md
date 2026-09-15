This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## M2 login

Card-code and email login against Supabase Auth + `profiles`.

### How to run

1. Copy `.env.local.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL` — project URL (`https://<ref>.supabase.co`, no `/rest/v1`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon (publishable) key
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only; never `NEXT_PUBLIC_`)
2. `npm run dev` then open [http://localhost:3000](http://localhost:3000). Logged-out visits to `/` redirect to `/login?returnTo=%2F`.
3. Production: set the same three variables on Vercel.

### Card-code workflow

1. Seed admins with `stepC_seed_admin.sql` (after creating Auth users and adding the `superadmin` role).
2. The verify query prints each `card_token` (example shape: `KD-7391`).
3. On `/login`, choose **Card code**, type the printed code, submit. The server looks up `profiles.card_token` + `is_card_active`, signs in with that row's email + `sso_secret`, writes `login_events`, and sets the session cookie.
4. Email tab posts to `/api/auth/email-login` instead.

### QR / NFC URL pattern

Encode a URL on the card:

```
https://<your-app>/verify/<CARD-CODE>?returnTo=/math/wk03
```

Example: `https://your-app.vercel.app/verify/KD-7391?returnTo=/math/wk03`

`/verify/[code]` is public. It POSTs `/api/auth/code-login`, then `window.location.replace(returnTo || '/dashboard')`.

Protected routes send logged-out users to `/login?returnTo=<path>`. After login the client honours the `Location` header.

### Curl examples

```bash
# Card code (add _debug_log for server console + debug.profile)
curl -X POST http://localhost:3000/api/auth/code-login \
  -H 'Content-Type: application/json' \
  -d '{"code":"KD-7391","ip":"127.0.0.1","user_agent":"curl/8.0","_debug_log":true}'

# Email
curl -X POST http://localhost:3000/api/auth/email-login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@ccs.edu.hk","password":"<CCS-PWD>"}'
```

