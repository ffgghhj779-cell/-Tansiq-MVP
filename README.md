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

## Phase status

| Phase | Focus | Status |
|-------|--------|--------|
| 1 | Prisma foundation, product/order/seller APIs | Done |
| 2 | OTP abstraction, stock decrement, national address, confirmation + DB tracking | Done |
| 3 | Trust / disputes / richer admin | Next |
| 4 | Style engine in DB | Planned |
| 5 | Pilot launch (legal + city + support) | Planned |

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
