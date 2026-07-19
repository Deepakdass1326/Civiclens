# CivicLens AI

AI-powered civic issue detection, prioritization & complaint routing.

## Structure

```
civiclens/
  backend/     Node.js + Express + MongoDB + Gemini AI
  frontend/    React + Vite + Redux Toolkit + Tailwind + Leaflet
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, GEMINI_API_KEY
npm run dev             # http://localhost:5000
```

Run tests (pure logic — impact score, JSON extraction, routing — no network needed):
```bash
npm test
```

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL if backend isn't on localhost:5000
npm run dev             # http://localhost:5173
```

## Architecture

**Backend (layered):**
- `config/` — env + DB connection
- `models/` — Mongoose schemas (Complaint, with 2dsphere geo index)
- `services/` — pure business logic: Gemini calls, impact score engine, routing table, duplicate detection, geo lookups
- `controllers/` — request/response orchestration
- `routes/` — endpoint definitions
- `middlewares/` — centralized error handling

**Frontend (4-layer):**
- `api/` — raw axios calls, the only layer that knows endpoint shapes
- `store/` — Redux Toolkit slices + async thunks (state layer)
- `hooks/` — custom hooks wrapping redux + browser APIs (geolocation, speech-to-text)
- `features/` + `components/` — UI layer, organized by feature (report, result, dashboard, track) with shared components in `components/ui` and `components/layout`

Navigation uses React Router (`Link`/`NavLink`/`useNavigate`) throughout — no full page reloads.

## What's tested vs. what needs live keys

Already verified in this environment (no external API access required):
- Impact score formula (severity/report-count/proximity weighting, live score increase on new reports)
- Gemini JSON response extraction (handles markdown fences, stray prose, malformed output)
- Gemini service fallback path (never crashes without an API key)
- Department routing table
- Express server boot, health check, 404/error handling
- Full frontend production build + dev server boot

Needs real credentials to fully exercise end-to-end (fill in `backend/.env`):
- `MONGO_URI` — MongoDB Atlas connection (for persistence + geospatial duplicate queries)
- `GEMINI_API_KEY` — actual image classification + complaint generation
- `GOOGLE_PLACES_API_KEY` — optional, only affects the hospital/school proximity sub-score (defaults to false if absent)

## Phase 2 additions (this round)

- **Fixed impact-score recompute accuracy**: `nearHospitalOrSchool` and `roadType` are now persisted on the complaint at creation time and reused exactly on every "support" recompute — no more guessing from the previous impact band.
- **Cloudinary photo persistence** (`services/upload.service.js`): photos are uploaded and given a permanent URL; gracefully returns `null` (never crashes) if credentials aren't configured, same fail-safe pattern as the Gemini service.
- **Lightweight admin gate** (`middlewares/requireAdmin.js`): a shared-secret `x-admin-token` header protects the status-update endpoint. Set `ADMIN_PASSWORD` in `.env`; the dashboard has a password prompt that unlocks status-change controls. This is intentionally simple (no sessions/JWT) — appropriate for a hackathon/pilot, not production-grade auth.
- **Seed script** (`backend/scripts/seedData.js`): generates 18 realistic sample complaints scattered around a center point (defaults to Delhi), with a believable mix of severities, statuses, and report counts, so the dashboard/heatmap is never demoed empty. Run with `node scripts/seedData.js` once `MONGO_URI` is set.
- **Frontend error states**: classify/submit failures now show a visible error banner instead of silently doing nothing.

Run `node scripts/seedData.js` after connecting to a real MongoDB instance to populate the dashboard.

## Round 3 additions (demo-impact + robustness)

**A. Demo-impact features (now complete on both citizen AND authority views, per PRD 6.2)**
- Impact badge pulses/scales on value change — wired into both `ComplaintCard` (citizen result page) and `ComplaintsTable` (authority dashboard), sharing the same `AnimatedImpactBadge` component.
- Manual "Refresh" button on the dashboard pulls the latest complaints/summary/heatmap on demand — this is what makes the live-score-change moment demoable on the authority side without needing real-time sockets.
- Before/After comparison table on the dashboard (`BeforeAfterComparison`).
- Simulated citizen notification toasts (`react-hot-toast`) on status change to in-progress/resolved.

**B. Functional gaps closed**
- **Rate limiting** (`express-rate-limit`): AI-calling/write endpoints capped at 10/min, read endpoints at 60/min. Verified live — 11th rapid request returns HTTP 429.
- **Status history/timeline**: every complaint now tracks a `statusHistory` array (pure `appendStatusHistory`/`shouldRecordStatusChange` helpers, fully unit tested); shown as a timeline on the result page.
- **Low-confidence photo detection**: classify responses now include a `lowConfidence` flag (confidence < 0.55); the report flow shows a "consider retaking this photo" hint without blocking submission.

**D. Performance**
- Route-level code splitting via `React.lazy` + `Suspense` — initial bundle dropped from one 998KB chunk to a ~184KB main bundle with per-route chunks (Dashboard's Leaflet/Recharts-heavy chunk only loads when visited).

## Recent reliability upgrades

- API-boundary validation for classify, submit, support, and status requests.
- Complaint provenance fields: official, citizen report, field survey, imported, or demo seed.
- Backend-verified admin unlock with production fail-closed behavior when `ADMIN_PASSWORD` is missing.
- GPS retry, manual coordinate entry, and Delhi demo-location fallback in the report flow.
- Persisted impact-score breakdown shown on the complaint result page.
- Live-only dashboard mode excludes `demo_seed` records, while a separate toggle can include demo data for presentations.
- Configurable department forwarding webhook records `not_configured`, `sent`, or `failed` instead of claiming a complaint was forwarded when it was not.

## Full test coverage (37 tests)

Impact score engine + complaint-doc helper, JSON extraction, routing table, Gemini fallback, Cloudinary fallback, admin auth middleware (open + protected), seed-data generation (schema/radius/status-history consistency), status-history helpers, and low-confidence detection — all pass without live external credentials. Rate limiting and admin-gate 401/429 behavior additionally verified against a live-booted server in this environment.
