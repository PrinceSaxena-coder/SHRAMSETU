# Technical Requirements Document (TRD)
## ShramSetu — Cooperative-Owned Digital Service Marketplace

**Version:** 1.0
**Status:** Prototype (Client-Only, No Backend)
**Scope:** Covers the current prototype implementation and the technical path to a production backend

---

## 1. Architecture Overview

### 1.1 Current State (Prototype)
A fully client-side single-page application. There is no server, no database, and no real network calls. All "persistence" happens in the browser via `localStorage`, accessed through a mock API layer that mimics REST semantics (async, promise-based, simulated latency).

```
Browser
 ├── React Router (client-side routing)
 ├── Pages (Home, Services, ServiceDetails, Booking, CustomerDashboard,
 │           WorkerDashboard, AdminDashboard, AIInsights, Nearby)
 ├── Components (Navbar, Sidebar, ServiceCard, WorkerCard, UI primitives)
 ├── src/api/*  (mock REST-shaped functions)
 │      └── localStorage  (browser-only persistence)
 └── src/data/mockData.js (seed/reference data)
```

### 1.2 Target State (Production, Out of Scope for Prototype)
```
React Web  +  React Native Mobile
        │
        ▼
   Node.js / Express REST API
        │
        ▼
     MongoDB (primary datastore)
        │
        ├── AI/ML Service (demand forecasting, workforce allocation)
        ├── Geo-Spatial Service (worker matching, distance/ETA)
        ├── Digital Payments Gateway (UPI/Card)
        └── Cloud Infrastructure (hosting, storage, CDN, monitoring)
```
This is an architectural target only. No backend services are implemented in the current prototype.

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Build tool | Vite 5 | Fast dev server, ES modules, production build |
| UI framework | React 18 | Functional components + hooks only |
| Routing | React Router 6 | Client-side routing, `BrowserRouter` |
| Styling | Tailwind CSS 3 | Utility-first; custom theme (navy/coop-green/saffron palette) |
| Icons | lucide-react | Single icon library across the app |
| Language | JavaScript (ES2020+) | No TypeScript, per prototype constraints |
| Persistence | `localStorage` (via mock API layer) | No backend/database |
| Package manager | npm | Standard `npm install` / `npm run dev` |

**Explicitly excluded:** TypeScript, Next.js, Bootstrap/React-Bootstrap, Material UI, Chakra UI, Ant Design, Firebase, Supabase, MongoDB (client-side), Express, external APIs, Google Maps API, payment gateway SDKs, auth providers.

---

## 3. Project Structure

```
shramsetu/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.jsx                # App entry, BrowserRouter mount
    ├── App.jsx                 # Route table + layout shell (Navbar/Footer)
    ├── index.css                # Tailwind directives + shared component classes
    ├── api/                     # Mock REST-shaped data layer (see Section 5)
    │   ├── client.js
    │   ├── bookings.js
    │   ├── workerJobs.js
    │   ├── adminWorkers.js
    │   ├── ratings.js
    │   ├── notifications.js
    │   └── index.js              # Barrel export
    ├── data/
    │   └── mockData.js          # Seed data: workers, services, cooperatives, etc.
    ├── components/
    │   ├── Navbar.jsx           # Nav, language selector, notifications, role switcher
    │   ├── Sidebar.jsx           # Tabbed sidebar (used in Admin Dashboard)
    │   ├── ServiceCard.jsx       # Category tile (landing page)
    │   ├── WorkerCard.jsx        # Worker summary card (marketplace)
    │   └── UI.jsx                # Button, Badge, StatCard, RatingStars, Modal, etc.
    └── pages/
        ├── Home.jsx
        ├── Services.jsx
        ├── ServiceDetails.jsx
        ├── Booking.jsx
        ├── CustomerDashboard.jsx
        ├── WorkerDashboard.jsx
        ├── AdminDashboard.jsx
        ├── AIInsights.jsx
        └── Nearby.jsx
```

---

## 4. Routing

| Route | Component | Purpose |
|---|---|---|
| `/` | Home | Landing page |
| `/services` | Services | Marketplace, search + filters |
| `/service/:id` | ServiceDetails | Individual worker profile |
| `/booking` | Booking | Multi-step booking flow (`?workerId=`, `?emergency=1`) |
| `/dashboard` | CustomerDashboard | Customer view |
| `/worker-dashboard` | WorkerDashboard | Worker view |
| `/admin` | AdminDashboard | Cooperative admin view |
| `/ai-insights` | AIInsights | Demand forecasting & recommendations |
| `/nearby` | Nearby | Geo-spatial worker matching + emergency services |
| `*` | Home | Fallback |

Role switching (Customer/Worker/Admin) is implemented as plain navigation between these routes — there is no auth guard or session concept in the prototype.

---

## 5. Data Layer (Mock API)

### 5.1 Design Principle
Every function in `src/api/` is written **as if it were a real REST call**: it is `async`, returns a `Promise`, and includes a simulated network delay (`delay()`, ~350ms). Pages never touch `localStorage` directly — they only import from `src/api`. This means the storage mechanism can be replaced (mock → real backend) without changing any page component.

### 5.2 Modules & Mapped Future Endpoints

| Module | Future REST resource | Functions |
|---|---|---|
| `bookings.js` | `/api/bookings` | `listBookings()`, `createBooking(payload)`, `updateBookingStatus(id, status)` |
| `workerJobs.js` | `/api/worker-jobs` | `listJobs()`, `updateJobStatus(id, status)` |
| `adminWorkers.js` | `/api/admin/workers` | `listWorkers()`, `verifyWorker(id)`, `suspendWorker(id)` |
| `ratings.js` | `/api/ratings` | `listRatings()`, `submitRating(payload)` |
| `notifications.js` | `/api/notifications` | `listNotifications()`, `markAllRead()` |
| `client.js` | — (shared utility) | `delay(ms)`, `readTable(key, fallback)`, `writeTable(key, value)` |

### 5.3 localStorage Keys (Current Persistence)

| Key | Description | Scope |
|---|---|---|
| `ss_bookings` | Customer bookings | Per-browser |
| `ss_worker_jobs` | Worker job request/pipeline state | Per-browser |
| `ss_admin_workers` | Admin worker verification/suspension state | Per-browser |
| `ss_ratings` | Submitted ratings/reviews | Per-browser |
| `ss_notifications` | Notification read/unread state | Per-browser |
| `ss_lang` | Selected UI language | Per-browser |

**Known limitation:** all data is local to a single browser/device. It is not shared across users, does not sync across devices, and is cleared if browser storage is cleared. This is expected and by design for the prototype phase.

### 5.4 Migration Path to a Real Backend
1. Stand up Node.js/Express REST API with the endpoints listed in Section 5.2.
2. Replace `readTable`/`writeTable` calls inside each `src/api/*.js` file with `fetch()` calls to the corresponding endpoint.
3. Add error handling (network failure, 4xx/5xx) inside the same functions.
4. No changes required in `pages/` or `components/` — they already consume the API layer asynchronously.
5. Introduce real authentication (see Section 8) and pass an auth token through a shared `fetch` wrapper in `client.js`.

---

## 6. Component Architecture

- **Presentational primitives** live in `UI.jsx`: `Button`, `Badge`, `StatCard`, `RatingStars`, `VerificationBadge`, `Modal`, `StatusPill`. All pages compose from these rather than redefining styles.
- **Domain cards**: `WorkerCard` (marketplace listing) and `ServiceCard` (category tile) encapsulate their own navigation behavior via `useNavigate`.
- **Navbar** owns cross-cutting concerns: language selection (`localStorage`-backed `useLocalStorage` hook, UI preference only — not part of the mock API layer), notifications (via `src/api`), and the role switcher (plain route navigation).
- **Sidebar** is a generic tab list used by `AdminDashboard`; it is intentionally decoupled from routing (`onClick` handlers, not `NavLink`s) since it drives in-page tab state, not URL state.

---

## 7. Non-Functional Requirements

### 7.1 Responsiveness
- Mobile-first Tailwind breakpoints (`sm`, `lg`) applied throughout
- Navbar collapses to a mobile menu below `lg`
- Tables (Admin Dashboard) become horizontally scrollable on narrow viewports
- No horizontal page overflow at any breakpoint from 360px to desktop

### 7.2 Performance
- Single-bundle Vite production build (current bundle ≈ 975KB JS / ≈200KB gzipped)
- Simulated API latency (350ms) is intentionally visible via loading states (`Loader2` spinners) so the UI already demonstrates real-world async behavior
- **Recommendation for production:** introduce route-based code-splitting (`React.lazy` + `Suspense`) once a real backend is attached, since bundle size will grow with additional dependencies (maps, payments SDKs, charting libraries)

### 7.3 Accessibility (Baseline)
- Semantic HTML elements used for buttons/links/tables
- Color contrast follows the defined navy/coop-green/saffron palette at AA-appropriate weights for primary text
- **Not yet implemented:** full keyboard navigation audit, ARIA labeling pass, screen-reader testing — recommended before production launch

### 7.4 Browser Support
- Modern evergreen browsers (Chrome, Edge, Firefox, Safari — last 2 versions)
- No IE11 or legacy browser support targeted

### 7.5 Security (Prototype Scope)
- No sensitive data is handled (no real PII, no real payment data)
- `localStorage` is not encrypted — acceptable for prototype/demo data only
- **Production requirement:** all real user/worker PII, payment data, and identity documents must move server-side with proper encryption at rest and in transit (TLS), and must not touch client storage

---

## 8. Production Backend Requirements (Forward-Looking)

These are not implemented in the current prototype but define the technical contract the frontend already assumes:

- **Auth:** Token-based (e.g., JWT) session for Customer/Worker/Admin roles, replacing the current unauthenticated role switcher
- **API:** REST endpoints matching Section 5.2's shape (resource-based, standard HTTP verbs, JSON payloads)
- **Database:** MongoDB collections mirroring `mockData.js` shapes: `workers`, `bookings`, `cooperatives`, `services`, `reviews`, `notifications`
- **Geo-spatial:** Real coordinate-based worker matching (MongoDB geospatial queries or a dedicated service), replacing the stylized CSS map
- **AI/ML:** A prediction service exposing demand-forecast and recommendation endpoints that the existing `AIInsights.jsx` page can consume with no UI changes (the page already treats this data as an external feed)
- **Payments:** UPI/card gateway integration (e.g., Razorpay/PayU) behind the existing `payment` field already captured in the booking flow
- **Infrastructure:** Containerized deployment (Docker), CI/CD pipeline, cloud hosting (AWS/GCP/Azure), CDN for static assets, monitoring/logging (e.g., Sentry, CloudWatch)

---

## 9. Testing Strategy (Recommended for Production)
- **Unit tests:** API layer functions (`src/api/*`) once backed by real HTTP — mock `fetch` responses
- **Component tests:** Booking flow step validation, dashboard state transitions (React Testing Library)
- **E2E tests:** Primary demo flows from the PRD (Customer booking journey, Worker job pipeline, Admin verification) via Playwright or Cypress
- **Manual QA checklist:** See the Final Test Checklist maintained alongside the prototype delivery (navbar, search/filter, booking, dashboards, AI insights, nearby, emergency booking, language selector, notifications, ratings, mobile responsiveness)

---

## 10. Build & Deployment (Current Prototype)

```bash
npm install
npm run dev       # local dev server (Vite)
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

No environment variables, secrets, or backend configuration are required to run the prototype — it is fully self-contained and runs entirely in the browser.
