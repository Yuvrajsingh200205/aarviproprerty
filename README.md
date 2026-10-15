# Aarvi Property – Frontend

Next.js 16 (App Router) + Tailwind CSS website and admin panel (`/admin`).
It talks to the Express API in the **aarviproperty_backend** repo.

## Run locally
```bash
cp .env.example .env.local     # set API_URL to your running backend
npm install
npm run dev                    # http://localhost:3000
```

## Environment variables
| Name | Example | Purpose |
|------|---------|---------|
| `API_URL` | `https://your-backend.onrender.com` | Public URL of the backend. Used by server rendering and by the `/api` + `/uploads` rewrites. **Required at build time too.** |
| `NEXT_PUBLIC_SITE_URL` | `https://your-site.vercel.app` | Used for sitemap / canonical URLs |

## Deploy to Vercel
1. Import this repo in Vercel (framework: Next.js, nothing else to configure).
2. Add the two environment variables above (the backend must already be live).
3. Deploy. Admin panel: `https://<your-site>/admin`.

## Tests
```bash
npx playwright install chromium
npm run test:e2e               # needs the API + site running and a seeded database
```
