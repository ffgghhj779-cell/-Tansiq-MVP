# تنسيق · Tansiq

Premium, mobile-first fashion marketplace MVP for Via Consulting’s **Tansiq** concept: *style first, then shop*. Arabic RTL by default, English secondary.

This slice is a complete-feeling demo with mock catalog data — no real payments, OTP SMS, database, or production image AI.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- IBM Plex Sans Arabic + Cormorant Garamond

## Run locally

```bash
npm install
cp .env.example .env   # DATABASE_URL=file:./prisma/dev.db
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://127.0.0.1:4327](http://127.0.0.1:4327).

### Phase 1 data layer

- Prisma + SQLite locally (`npm run db:seed`)
- APIs under `/api/products`, `/api/orders`, `/api/sellers`, `/api/admin/reports`
- New screens: `/onboarding`, `/protection`, `/seller/orders`, `/admin`
- For Vercel production DB later: set `DATABASE_URL` to Postgres (Phase 2)

## What’s included

1. Marketing landing (brand-first hero)
2. Buyer home (looks, budget, indie labels, seasonal, trust)
3. Style hub (match / complete look / budget / color finder)
4. Catalog + product detail (gallery, swatches, size, wear-it-with, fabric, seller trust)
5. Cart + checkout shell (COD + OTP feel, multi-seller parcels)
6. Orders / tracking + returns entry
7. Account (size/style profile, favorites, closet stub)
8. Seller phone-first upload demo (steps + quality score)
9. Loading / empty / error states on product list

## Scripts

| Command        | Description                |
|----------------|----------------------------|
| `npm run dev`  | Dev server on port **4327** |
| `npm run build`| Production build           |
| `npm run start`| Production server on 4327  |
| `npm run lint` | ESLint                     |

## Notes for Via Consulting

Open decisions (name legal, pilot city, COD support owner, individual sellers, etc.) remain with the product docs — this MVP does not invent strategy beyond the design spec.
