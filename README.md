# تنسيق · Tansiq

Premium, mobile-first fashion marketplace for Via Consulting’s **Tansiq** concept: *style first, then shop*. **English default**, Arabic RTL toggle.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + SQLite (local) → Postgres for serverless
- IBM Plex Sans Arabic + Cormorant Garamond

## Run locally

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://127.0.0.1:4327](http://127.0.0.1:4327).

## Deploy on Vercel

1. Import the GitHub repo and deploy.
2. **Without `DATABASE_URL`:** Style hub + catalog work via static fallback (demo mode). Orders/admin persistence need a DB.
3. **For full pilot:** create Neon/Supabase Postgres → set `DATABASE_URL` in Vercel env → redeploy → run migrations against that URL (`npx prisma migrate deploy`) and seed.

SQLite (`file:…`) does **not** work on Vercel serverless.

## Phase status

| Phase | Focus | Status |
|-------|--------|--------|
| 1 | Prisma foundation, product/order/seller APIs | Done |
| 2 | OTP abstraction, stock decrement, national address, confirmation + DB tracking | Done |
| 3 | Trust: admin, returns+refund, disputes, SLA, WhatsApp + tickets | Done |
| 4 | Style engine in DB (rules, feedback, kill switch) | Done |
| 5 | Pilot readiness (legal drafts, city/COD, health, backups, smoke) | Done |

### Phase 5 pilot ops

```bash
npm run db:backup      # sqlite snapshot → prisma/backups/
npm run test:pilot     # usability smoke against :4327
```

- `/legal` — draft terms/privacy + entity placeholders (Via)
- `/pilot` — readiness checklist + launch city / COD / legal status
- `/api/health` — DB + version + pilot city
- `/api/errors` — client error ingest (ErrorReporter)
- Footer shows pilot city, version, legal status from config |

### Phase 4 style engine

- `GET /api/style/suggest?tool=match|complete|budget|color`
- `POST /api/style/feedback` (`good` / `not_for_me`)
- `GET|PATCH /api/style/settings` — kill switch `style_engine_enabled`
- Admin → Style tab toggles the engine

### Phase 2 checkout flow

1. Enter phone → `POST /api/otp/send` (mock returns `devCode`; demo also accepts `1234`)
2. Verify → `POST /api/otp/verify` → OTP token
3. City + district (+ optional short / national address)
4. `POST /api/orders` with OTP token → stock decremented in a transaction → confirmation notifications queued
5. Track at `/orders/[id]` from the database

Env hooks: `OTP_PROVIDER`, `SMS_API_KEY`, `WHATSAPP_API_KEY` (see `.env.example`).

## What’s included

1. Marketing landing (brand-first hero)
2. Dense buyer home
3. Style hub (match / complete / budget / color)
4. Catalog search + product detail
5. Cart + COD checkout with real OTP challenge + address fields
6. Orders / tracking from DB + returns entry
7. Account + closet stub
8. Seller upload demo + seller orders inbox
9. Admin moderation shell
10. Buyer protection + legal footer placeholders

## Out of scope for now

Live SMS gateway, production image AI, BNPL, Salla/Zid import, thobe module.
