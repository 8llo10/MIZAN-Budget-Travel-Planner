# MIZAN — Budget-First Travel Planner

MIZAN is a travel-planning product that starts with the user's real constraint: **how much can I spend?** Instead of showing only airfare, it calculates a whole-trip estimate across flights, accommodation, food, local transport, experiences, party size, trip length, flexible dates, and currency conversion.

## Product modes

- **I have a budget** — discover destinations that fit a total budget.
- **I know my destination** — compare nearby travel dates and find the strongest total-trip option for a chosen destination.

## Scope

Saudi Arabia, GCC destinations, and major destinations across the Arab world. Costs are normalized to SAR while preserving each destination's local currency and exchange-rate context.

## What the engine does

- Flexible-date search: exact dates, ±1, ±3, or ±7 days.
- Family-aware pricing: adults, children, and room count.
- Whole-trip cost model: flight + stay + food + local transport + activities.
- Spend profiles: Smart, Balanced, Comfort.
- Multi-currency conversion using daily open exchange-rate data with an internal fallback snapshot.
- Budget-fit ranking and per-traveler totals.
- Optional live flight pricing through Amadeus Self-Service APIs.
- Safe reference-pricing mode when flight credentials are not configured.

## Stack

- Next.js 16.3.3
- React 19.2
- TypeScript
- Next.js Route Handlers
- Amadeus Flight Offers integration (optional)
- Open ExchangeRate-API feed with fallback rates
- Vercel-ready

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment variables

Copy `.env.example` to `.env.local`.

```env
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
AMADEUS_BASE_URL=https://test.api.amadeus.com
```

The app does not require Amadeus credentials to run. Without them it uses deterministic reference fares and labels them clearly in the UI.

## Health check

`GET /api/health`

## Deployment

Connect this repository to Vercel and deploy the `main` branch. No custom build command is required.
