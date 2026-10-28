# Dhaka Machine Ghar — Website

Next.js 15 (App Router) + Tailwind CSS v4. Blueprint: `../dhaka_machine_ghar_website_blueprint.md`.

```bash
npm install                    # also runs prisma generate
# .env → DATABASE_URL="postgresql://dmg:<password>@localhost:5432/dmg_ghar?schema=public"
npx prisma migrate deploy      # create tables (use `npm run db:migrate` when changing the schema)
npm run db:seed                # load the catalog (add `-- --demo` for a demo order + warranties)
npm run admin:create -- --email you@example.com --name "Owner"   # prints a generated password
npm run dev                    # http://localhost:3000  ·  admin: /admin
```

Local DB: its own PostgreSQL 16 cluster in `../postgres-dmg/` on **port 5433** (localhost only), separate from any other PostgreSQL on this PC. Database `dmg_ghar`, app role `dmg` (password in `.env`, never committed), superuser `dmg_admin`. Runs as the Windows service `postgresql-dmg-5433` (Automatic). If it is stopped, run `../postgres-dmg/start-service.cmd` (asks for admin). Never start a second copy with `pg_ctl start` while the service exists — it deletes the service's lock file and shuts the database down. `npm run db:studio` opens a table browser.
`.env` also holds `AUTH_SECRET` (signs admin sessions and customer document links), `SITE_URL` (public address used in SMS/document links — set to the real domain in production) and, optionally, `ANTHROPIC_API_KEY` (turns the chat assistant from basic keyword mode into Claude AI mode). Uploaded product photos are saved in `uploads/` — back it up together with the database.

## Brand theme (from DMG logo)
| Token | Hex | Use |
|---|---|---|
| `brand-600` | `#2E5E47` | Primary (logo green) — nav, prices, buttons |
| `accent-600` | `#98000F` | Accent (logo crimson) — CTAs, badges, discounts |
| `steel-600` | `#1570A8` | Secondary (logo blue) — reconditioned badge, icons |
| `ink` | `#111111` | Top bar |

Defined in `src/app/globals.css` (`@theme`).

## Structure
- `src/lib/site.ts` — business profile (address, phone, socials, advance %)
- `prisma/schema.prisma` — DB schema (catalog, orders + factory events, quotes, warranties, service requests); `prisma/seed-data/catalog.ts` — initial catalog
- `src/lib/catalog.ts` — catalog types; `src/lib/catalog-server.ts` — cached catalog query (`revalidateTag("catalog")` after edits); `src/lib/db.ts` — Prisma client
- `src/app/(site)/` — storefront pages (header/footer layout); `src/app/(landing)/` — ad landing pages (no site chrome)
- `src/components/` — header (mega menu), footer, mobile nav, product card, cart, hero slider
- `public/products/` — Baileigh product images; `public/brand/` — DMG logo

## Customer accounts & weekly email
- Buying never needs an account — checkout works for guests. Accounts exist for the **weekly product-update email** (plus order history, warranties, saved address).
- Register: name, mobile, **email (required)**, password, "weekly update" opt-in. The email must be confirmed (signed link, 3 days) before newsletters go to it. Phone OTP verification / password reset need the SMS gateway.
- Weekly email: Admin → Settings → "Weekly product-update email" (SMTP, weekday, note, test, preview, send now). The server checks hourly and sends once per ISO week from 10:00 Dhaka time on the chosen day; `NewsletterRun.weekKey` prevents double sends. On hosts that sleep, call `GET /api/cron/newsletter` hourly with `Authorization: Bearer $CRON_SECRET`.
- Every email carries an unsubscribe link (confirm page) and a one-click `List-Unsubscribe` header.

## Offers & product photos
- Admin → Offers: pick a machine, offer price (must be below the regular price), optional title and start/end dates. Live offers appear in the home sidebar's "অফার চলছে" box (empty → "এই মুহূর্তে কোনো অফার নেই"), on the product card/page, and are charged at checkout (`effectivePrice` in `lib/offers.ts`).
- Seeded product photos are freely licensed Wikimedia Commons images (`public/catalog/`, credits in `prisma/seed-data/image-credits.json`), marked "প্রতীকী ছবি" with attribution on the product page. Uploading a real photo in Admin → Products clears the credit.

## Roadmap
- [x] **1. Setup, theme & home page** — Medivila-style layout re-themed to logo colors, mega menu, category sidebar, product grid, cart context, WhatsApp/call buttons
- [x] **2. Shop & category pages** — sidebar filters (capacity, voltage, condition, price), search, sort, quick view, compare (`/shop`, `/category/[slug]`, `/compare`; filters live in the URL so links are shareable)
- [x] **3. Product detail page** — spec table, ROI calculator, video tab, Bangla one-step order form, JSON-LD (`/product/[slug]`; orders POST to `/api/orders`)
- [x] **4. Cart & checkout** — full payment / advance booking (bKash/Nagad/Bank), custom quotation form (`/checkout`, `/quotation`; quotes POST to `/api/quotes`)
- [x] **5. Machine landing pages** — ad-optimised one-page order flow at `/lp/<slug>` for products with `landing: true` (minimal header, sticky mobile CTA, ROI, FAQ, order form; `noindex` + canonical to product page)
- [x] **6. Order tracking (6-step factory) & warranty portal** — `/track` (invoice or phone; masked name/phone, no address), `/warranty` (serial check + service request), `/contact`. Try with `npm run db:seed -- --demo`
- [x] **7. Backend & database** — Prisma + PostgreSQL; catalog, orders, quotes, warranty & service in the DB; prices always taken from the DB (leads table comes with the chatbot in step 9)
- [x] **8. Admin dashboard** (`/admin`, owner/staff roles)
  - [x] 8a login (scrypt + signed httpOnly cookie, throttled), dashboard KPIs & factory pipeline
  - [x] 8b orders: search/filter, 6-step updates with customer notes, auto warranty serials at handover
  - [x] 8c products: create/edit/hide/delete, photo upload, ROI & landing copy, landing on/off
  - [x] 8d quotations & service requests (status + internal note), warranty register & manual serials
  - [x] 8e settings: business info/advance %/warranty terms, Meta Pixel + CAPI + GTM, password, team
  - [ ] Baileigh scrape importer (needs a scrape file with product data — current scrape has images only)
- [x] **9. Chatbot, CRM, SMS, documents**
  - [x] Chat assistant (Claude `claude-opus-5-5`, low effort, server-side refusal fallback; basic keyword mode without an API key) with WhatsApp/call handover; leads saved to the CRM
  - [x] Admin → Leads (CRM): status, notes, chat transcripts, manual leads, CSV export
  - [x] SMS on order placed / factory step (BulkSMSBD or any GET gateway), test button, SMS log
  - [x] Invoice, gate pass and delivery challan — printable A4 / Save as PDF; signed customer links (SMS at handover, tracking by invoice no.)
  - [x] Theme colours editable in Settings

## Notes
- Baileigh scrape contained only images, so specs in `catalog.ts` are reference values from model numbers — verify before launch. Prices are placeholders in ৳.
- Products without a photo show a branded placeholder until real images are uploaded.
- Blueprint email `www.dhakamachineghar@yahoo.com` is used as `dhakamachineghar@yahoo.com` (an email address can't start with `www.`).

## Deploying (Vercel + Neon)
- Database: a Neon Postgres project. `DATABASE_URL` = pooled connection string, `DIRECT_URL` = direct (non-pooler) string, used by `prisma migrate deploy`.
- Vercel runs `npm run vercel-build` (migrations, then `next build`).
- Environment variables: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `CRON_SECRET`, `SITE_URL`, `SSLCZ_STORE_ID`, `SSLCZ_STORE_PASSWORD`, optional `SSLCZ_LIVE=true` (live gateway) and `ANTHROPIC_API_KEY`.
- Admin photo uploads: connect a Vercel Blob store to the project (adds `BLOB_READ_WRITE_TOKEN`). Without it, uploads are saved to `./uploads` (local/VPS only).
- Weekly email: `vercel.json` runs `/api/cron/newsletter` daily at 04:30 UTC (10:30 Dhaka); Vercel sends `CRON_SECRET` automatically. The in-process scheduler is off on Vercel.

## Online payment (SSLCommerz)
- After an order with an advance/full payment, the customer sees "pay online"; `/api/payments/sslcommerz/start` opens the SSLCommerz page for the amount still due.
- SSLCommerz returns to `/api/payments/sslcommerz/return` and calls `/api/payments/sslcommerz/ipn`; both confirm with SSLCommerz's validation API before marking the order paid (amount and currency checked). Result page: `/payment`.
- Without `SSLCZ_STORE_ID`/`SSLCZ_STORE_PASSWORD` the online option is hidden. Sandbox test store: `testbox` / `qwerty`. Set `SSLCZ_LIVE=true` with the live credentials.
- Policy pages required by SSLCommerz: `/terms`, `/privacy`, `/refund` (linked in the footer).
