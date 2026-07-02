# MazinXSA Analytics Dashboard

A premium executive reporting dashboard that reads live data from your Google Sheet and auto-refreshes every 30 seconds.

---

## Quick Start

```bash
cd mazinxsa-dashboard
npm install
npm run dev
```

Open http://localhost:3000

---

## Setup

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` (already done) and fill in:

```env
NEXT_PUBLIC_SHEET_ID=1MC35b4aooXQNZJL4NVFZUtHz2sjtQV-impyRVpFqH4Q
NEXT_PUBLIC_SHEET_GID=656440254
NEXT_PUBLIC_REFRESH_INTERVAL=30000
NEXT_PUBLIC_COMPANY_NAME=MazinXSA
```

### 2. Google Sheet Access

**Public sheet (no API key needed):**
Your sheet must be set to "Anyone with the link can view."
The dashboard fetches data via the CSV export endpoint — no API key required.

**Private sheet (optional):**
Add `GOOGLE_SHEETS_API_KEY=your_key` to `.env.local` and update `src/app/api/sheets/route.ts` to use the Sheets API v4 endpoint instead of the CSV export URL.

---

## Dashboard Pages

| Page | Description |
|------|-------------|
| Executive Overview | 12 KPI cards, area chart, donut chart, platform bars, auto-insights |
| Performance | Area, Line, Bar, Composed, Radar, Scatter charts |
| Brand Analytics | Rankings, completion bars, scorecard table |
| Platform Analytics | Per-platform cards, comparison charts |
| Service Analytics | Per-service cards, hours breakdown, radar |
| Financial | Hours-based workload analysis, variance chart |
| Trends | Moving avg, MoM bars, growth/decline tables |
| Data Table | Sortable, searchable, paginated, CSV/Excel export |

---

## Filters

- **Date presets**: All Time, This Month, Last Month, This Quarter, This Year, Last 30 Days, Last 7 Days
- **Multi-select**: Brand, Platform, Service — all with search
- **Global search**: Searches across brand, service, platform, month, type

All filters update every chart and metric instantly.

---

## Data Auto-Refresh

Data refreshes every 30 seconds (configurable via `NEXT_PUBLIC_REFRESH_INTERVAL`).
The "Updated X ago" timestamp in the header shows when data was last fetched.

---

## Google Sheet Column Format

| Column | Description |
|--------|-------------|
| Compeny | Client/brand name |
| Month | Month name (e.g. "November") |
| Service | Service type |
| Platform | Social platform |
| Type | Content type |
| Deliverbles | Planned deliverables count |
| Delivered | Actual delivered count |
| Extra | Extra/bonus deliverables |
| H Deliverbles | Planned hours |
| H Delivered | Actual hours |
| H Extra | Extra hours |

**To unlock financial analytics:** Add `Revenue` and `Cost` columns to your sheet.

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_SHEET_ID
# NEXT_PUBLIC_SHEET_GID
# NEXT_PUBLIC_REFRESH_INTERVAL
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + custom brand tokens
- **Recharts** — Area, Bar, Line, Pie, Radar, Scatter, Composed
- **Framer Motion** — page transitions, card animations
- **Zustand** — global filter state
- **TanStack Query** — data fetching with auto-refresh
- **Radix UI** — accessible dropdown, popover, tooltip primitives
- **next-themes** — dark/light mode
- **xlsx** — Excel export
- **sonner** — toast notifications
