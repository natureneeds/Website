# Kisan OS (किसान ओएस) — The Operating System for Indian Farmers

Kisan OS is a high-performance, mobile-first Progressive Web Application (PWA) and agricultural operating system designed specifically for Indian smallholders and commercial farmers. It unites end-to-end farm operations: from crop planning, telemetry, and leaf disease diagnosis, to an input marketplace, machinery rental, community advice, and double-entry farm accounting.

---

## Key Features

1. **Agronomic Crop Planner (`/plan`)**:
   - Auto-detects current agricultural season (*Kharif*, *Rabi*, or *Zaid*) based on real-time calendar dates.
   - Deterministic agronomic scoring factoring in soil type, water source, mandi price trends, and expected profit per acre.
   - Auto-generates dated calendar tasks (sowing, basal fertilizer, irrigation, pest checks, harvesting).
   - Input checklist matched with marketplace seed & fertilizer packages.

2. **Crop Care & AI Diagnosis (`/care`)**:
   - Leaf disease photo scanner with AI vision model integration and deterministic agronomy fallback.
   - Instant agronomic diagnosis with severity, pathogen cause, chemical & organic treatments, and direct "Buy recommended treatment" product links.
   - Weather forecasts with spray condition advisories (rain, wind drift, humidity risk).
   - Bilingual agronomic knowledge library (Hindi & English).

3. **Input Marketplace & Checkout (`/market`, `/find`, `/checkout`)**:
   - Authoritative catalog with category filters, brand filters, and full-text search.
   - Persisted cart and multi-address book.
   - Server-verified checkout with Razorpay online payment (HMAC SHA-256 signature verification) and Cash on Delivery (COD).
   - Atomic Postgres stock decrement preventing overselling.
   - Real-time order status timeline (Placed, Packed, Shipped, Delivered).

4. **Equipment Rental & Farm Labour (`/rent`, `/labour`)**:
   - District-filtered listings for tractors, drone sprayers, harvesters, and labour groups.
   - Booking requests, owner approval workflows, in-app coordination chats, and ratings.

5. **Sell Produce & Mandi Prices (`/sell`, `/storage`)**:
   - Live mandi APMC commodity price trends with 30-day sparklines.
   - Farmer produce listings with buyer offer negotiation threads.
   - Warehouse & cold storage reservation booking.

6. **Farmer Accounting & Crop Ledger (`/ledger`)**:
   - Auto-logs input marketplace orders as crop expenses and produce sales as income.
   - Manual cost voucher logging (diesel, labour, electricity, equipment rent).
   - Per-crop net profit/loss summary cards, expense breakdown donuts, and timeline.
   - Offline ledger entry queuing with automatic sync when connectivity resumes.
   - Instant PDF and CSV export for bank loan and KCC applications.

7. **Finance Hub & Eligibility Checker (`/finance`)**:
   - State, land size, and crop-filtered government schemes (PM-KISAN, PMFBY, KCC).
   - Document checklists, EMI calculator, and insurance premium estimator.

8. **Support & Community (`/support`)**:
   - Expert support ticket creation with voice input, photo attachments, and real-time chat.
   - Farmer community forum with upvotes, comments, and crop tag filtering.

---

## Architecture & Technology Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v7, TanStack React Query, Lucide Icons, i18next (Hindi & English).
- **Styling**: Vanilla CSS tokens in `src/styles/tokens.css` with strict Design Lock enforcement (zero raw hex/rgb outside `tokens.css`, single lime accent, 44px+ touch targets).
- **Backend / Database**: Supabase PostgreSQL with strict Row Level Security (RLS) on all 22+ tables.
- **Edge Functions**: Deno TypeScript serverless functions with CORS, rate limiting, and input validation.
- **PWA**: Native Web App Manifest (`manifest.json`), service worker (`sw.js`) with cache-first assets, network-first API fallback, and IndexedDB/localStorage offline write-queue.
- **Testing**: Playwright End-to-End Smoke Test Suite.

---

## Design Lock & Aesthetics

Kisan OS adheres to a strict Design Lock:
- **Page Background**: Pure White (`#FFFFFF`, `--bg-page`) across every single page.
- **Cards & Surfaces**: Alternating Cream (`--surface`) and Ink/Black (`--ink`).
- **Single Accent**: Lime (`--lime` / `--lime-strong`) exclusively used for buttons, badges, highlights, and active states.
- **Supporting Accents**: Forest green (`--forest`) for links and botanical badges; Danger (`--danger`) and Warning (`--warning`) for alerts only.
- **Tokens**: Exactly 13 authorized CSS variable tokens. Zero raw hex or rgb color codes permitted outside `tokens.css`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase project keys:

```bash
cp .env.example .env
```

### Client Environment Variables (`.env`)

| Variable | Required | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Yes | Supabase Project URL (e.g., `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public anonymous API key |
| `VITE_AUTH_MOCK` | Optional | Set to `true` to run with offline mock database and mock OTP (`123456`) without SMS provider credentials |
| `VITE_ENABLE_LLM_RERANK` | Optional | Set to `true` to enable Gemini-based product recommendation reranking |

### Supabase Edge Functions Secrets

Set these in your Supabase project via CLI: `supabase secrets set KEY=VALUE`

| Variable | Required | Description |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Yes | Supabase Project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role secret key (for administrative DB queries) |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for vision-based crop disease diagnosis |
| `RAZORPAY_KEY_ID` | Optional | Razorpay Key ID (defaults to test dev mode if omitted) |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay Key Secret (used for server-side HMAC SHA-256 signature verification) |

---

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5175/` (or your configured Vite dev port).

---

## Supabase Database & Migrations

Kisan OS includes 15 modular SQL migrations in `supabase/migrations/`:
- `20260928000001_profiles_and_farms.sql`: Profiles, farms, and RLS policies.
- `20260928000002_marketplace.sql`: Categories, sellers, products, cart, and orders.
- `20260928000003_planner.sql`: Crops catalog, crop plans, and crop tasks.
- `20260928000004_rentals.sql`: Rental listings, labour listings, and bookings.
- `20260928000005_finance.sql`: Government schemes catalog.
- `20260928000006_storage_sales.sql`: Mandi prices, produce listings, warehouses.
- `20260928000007_ledger.sql`: Farm ledger entries.
- `20260928000008_support.sql`: Support tickets, ticket messages, community posts.
- `20260928000009_phase6_checkout.sql`: User addresses and atomic order creation RPC.
- `20260928000011_phase9_crop_care.sql`: Notifications, diagnoses, knowledge articles.
- `20260928000012_phase10_rentals_labour.sql`: Booking coordination chat & reviews.
- `20260928000013_phase11_finance.sql`: Finance application help tickets.
- `20260928000014_phase12_sell_storage.sql`: Produce offer negotiation & warehouse bookings.
- `20260928000015_phase13_ledger.sql`: Double-entry transaction triggers & RLS.
- `20260928000016_phase14_support_community.sql`: Community comments, likes, and ticket chat.

### Applying Migrations to Live Supabase Project

```bash
supabase link --project-ref your-project-ref
supabase db push
```

---

## Supabase Edge Functions Deployment

Deploy each Edge Function using the Supabase CLI:

```bash
# 1. Vision-based Crop Disease Diagnosis
supabase functions deploy diagnose-crop --no-verify-jwt

# 2. Razorpay Order Creation (Server-side price verification)
supabase functions deploy create-razorpay-order

# 3. Razorpay Payment Verification (HMAC SHA-256 verification & stock decrement)
supabase functions deploy verify-razorpay-payment

# 4. Crop Agronomic Scoring Engine
supabase functions deploy recommend-crops --no-verify-jwt

# 5. Product Recommendation Engine
supabase functions deploy recommend-products --no-verify-jwt

# 6. Weather Forecast & Spray Advisory
supabase functions deploy weather-forecast --no-verify-jwt

# 7. Mandi Price Agmarknet Ingestion Stub
supabase functions deploy ingest-mandi-prices
```

---

## Progressive Web App (PWA) & Offline Mode

- **Manifest**: Located at `public/manifest.json`, configured for standalone display, portrait orientation, and theme color `#FFFFFF`.
- **Service Worker**: `public/sw.js` caches critical core routes (`/`, `/plan`, `/ledger`, `/market`, `/find`, `/support`).
- **Offline Ledger Queue**: In `src/lib/pwa/offlineQueue.ts`, ledger entries recorded while disconnected are queued in local offline storage and automatically synchronized when the browser emits the `online` event.
- **Last-Viewed Products**: Viewed marketplace products are cached for instant offline inspection.

---

## Running Smoke Tests

Playwright smoke tests cover the 5 critical user flows:
1. **Login**: Phone OTP authentication flow.
2. **Find Product**: Marketplace search and product detail routing.
3. **Checkout (Test Mode)**: Cart, Cash on Delivery / Razorpay test mode, order creation.
4. **Start a Crop**: Recommendation browsing and crop plan initiation.
5. **Add a Ledger Entry**: Logging farm costs and verifying timeline updates.

Run the test suite:

```bash
npx playwright test
```

To run tests with UI:

```bash
npx playwright test --ui
```

---

## Production Build & Deployment

### 1. Build the Application

```bash
npm run build
```

This runs TypeScript type checking (`tsc`) followed by Vite's production bundler, producing optimized, code-split chunks in `dist/`.

### 2. Deploy to Static Host (Vercel / Cloudflare / Netlify)

Deploy the `dist/` directory with standard SPA routing fallback (`index.html` on 404).

**Sample `vercel.json`**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        { "key": "Content-Type", "value": "application/manifest+json" }
      ]
    }
  ]
}
```

---

## License

Proprietary © Kisan OS Team. Built with pride for Indian agriculture.
