# Product Requirements Document (PRD)
## ShramSetu — Cooperative-Owned Digital Service Marketplace

**Version:** 1.0
**Status:** Prototype / Hackathon MVP
**Owner:** Product Team, ShramSetu

---

## 1. Overview

### 1.1 Problem Statement
Labour Cooperative Federations and Societies across India possess a large, skilled workforce — electricians, plumbers, carpenters, painters, domestic helpers, caregivers, drivers, gardeners, cleaners, and technicians. However, these workers lack a structured digital platform to connect with households and institutions that need their services.

Private gig-economy platforms currently dominate the local services market. Cooperative workers, despite having verified skills, local presence, and organizational backing, remain underutilized and disconnected from digital demand.

### 1.2 Solution
ShramSetu is a **cooperative-owned digital service marketplace** that connects customers directly with verified cooperative workers — without displacing the cooperative structure, worker welfare protections, or fair-wage principles that private platforms typically erode.

### 1.3 Tagline
**"Skilled Hands. Trusted Services. Stronger Communities."**

### 1.4 Goals
- Give cooperative workers a modern, trustworthy digital storefront
- Give customers a transparent, verified alternative to private gig platforms
- Preserve fair wages, worker welfare, and cooperative ownership as core product pillars
- Demonstrate a credible path from prototype → production (mobile app, AI workforce allocation, geo-matching)

### 1.5 Non-Goals (for this phase)
- Real payment processing
- Real-time GPS tracking / live location
- Production-grade authentication or identity verification
- A live machine learning pipeline (AI features are simulated, structured for future integration)

---

## 2. Target Users & Personas

| Persona | Description | Core Need |
|---|---|---|
| **Customer (Household)** | Urban/semi-urban resident needing home services | Find a verified, fairly-priced worker quickly and book with confidence |
| **Customer (Institution)** | Small business, office, or institution | Recurring or bulk service bookings with reliable vendors |
| **Cooperative Worker** | Skilled tradesperson registered with a labour cooperative | Steady job requests, fair pay, welfare protection, dignity of work |
| **Cooperative Admin** | Federation/society staff managing worker networks | Verify workers, monitor bookings/revenue, manage cooperative reputation |

---

## 3. Key Value Propositions
1. **Verified Workers** — Identity + skill + cooperative verification, not just self-reported profiles
2. **Fair Wages** — Transparent, cooperative-set pricing (no algorithmic wage suppression)
3. **Cooperative Ownership** — Platform governed by labour cooperatives, not private investors
4. **Transparent Pricing** — Full cost visible before booking, no hidden fees
5. **Worker Welfare** — Insurance, welfare fund, emergency support built into the worker experience
6. **Secure, Simple Payments** — UPI / Card / Cash, tracked transparently

---

## 4. Features & Requirements

### 4.1 Landing Page
- Hero section with tagline, value proposition, and dual CTA (Find a Service / Become a Worker)
- Visual explanation of the Customer → ShramSetu → Verified Worker flow
- Service category grid (9 categories: Electrical, Plumbing, Carpentry, Painting, Cleaning, Caregiving, Driving, Gardening, Appliance Repair)
- Trust statistics (workers, services completed, cooperatives, rating)
- "Why ShramSetu" value pillars (6 cards)
- "How It Works" process (6 steps)
- Closing call-to-action

**Acceptance Criteria:** Page loads with no broken links; all CTAs route correctly; fully responsive from mobile to desktop.

### 4.2 Service Marketplace
- Search by worker name or skill
- Filters: category, rating, price, availability, location, emergency toggle
- Worker cards showing: avatar, name, skill, verification badge, rating, experience, jobs completed, location/distance, starting price, availability
- "Book Now" and "View Profile" actions

**Acceptance Criteria:** Search and all filters update results in real time with no page reload; empty state shown when no matches.

### 4.3 Worker Profile
- Full profile: identity, cooperative affiliation, experience, jobs completed, rating, certifications, reviews
- Three verification badges: Identity Verified, Skill Certified, Cooperative Verified
- Standard booking and Emergency Booking entry points

### 4.4 Booking Flow
- 6-step guided flow: Service → Date → Time → Address → Payment (UPI/Card/Cash, simulated) → Confirm
- Booking confirmation screen with Booking ID, full summary, and link to dashboard
- Booking record persisted for retrieval in Customer Dashboard

**Acceptance Criteria:** User cannot advance a step without completing required input; confirmed booking is retrievable after the flow ends.

### 4.5 Customer Dashboard
- Upcoming and previous bookings, grouped by status (Confirmed, In Progress, Completed, Cancelled)
- Total spending, saved/favourite workers, notifications
- Actions: Book Again, View Details, Rate Worker (1–5 stars + written review)

### 4.6 Worker Dashboard
- Daily overview: today's jobs, today's earnings, upcoming jobs, customer rating
- Job Requests queue with Accept/Reject actions
- My Jobs pipeline: Accepted → In Progress → Completed
- Earnings summary (today/week/month/total) with visual breakdown
- **Worker Welfare panel**: insurance status & coverage amount, welfare fund balance, cooperative membership status, emergency support availability

**Acceptance Criteria:** Accepting a job request moves it into "My Jobs"; job status can only progress forward through the defined pipeline.

### 4.7 Cooperative Admin Dashboard
- Overview KPIs: total workers, verified workers, active bookings, completed services, monthly revenue, worker earnings
- Worker Management table with Verify / Suspend actions (state-driven)
- Booking Management table with status filters
- Analytics: monthly bookings trend, revenue trend, worker utilization by skill, most-demanded services
- Cooperative Network view (member cooperatives, their worker counts, ratings)

### 4.8 AI Workforce Intelligence
- Demand forecast by skill category (7-day trend, % change)
- AI-generated recommendations (staffing suggestions, peak-time alerts, underutilized worker flags)
- Explicitly labeled as a **simulated prototype prediction**, not a live ML model
- Architected so a real prediction API can be substituted without UI changes

### 4.9 Nearby / Geo-Spatial Matching
- Stylized map view (no third-party maps dependency) showing customer position and nearby worker markers with distance
- Category filters
- "Find Workers Near Me" action

### 4.10 Emergency Services
- Dedicated emergency categories (Electrical, Plumbing, Caregiver, Appliance, Other)
- Shows nearest verified worker, distance, ETA, rating, and estimated cost
- One-tap request into the booking flow

### 4.11 Supporting Features
- **Role switcher**: Customer / Worker / Cooperative Admin views, no real authentication required for the prototype
- **Multilingual navigation**: English, Hindi, Marathi, Bengali, Tamil (core nav labels)
- **Notifications**: booking confirmations, job updates, payment confirmations, cooperative opportunities
- **Rating & review system**: 1–5 stars plus quality/punctuality/professionalism sub-ratings

---

## 5. User Flows (Primary)

**Customer:** Land → Search service → Select verified worker → View profile → Book → Select date/time → Enter address → Pay (UPI) → Confirmation → Dashboard

**Worker:** Dashboard → Receive job request → Accept → Mark In Progress → Mark Completed → View earnings → View welfare benefits

**Admin:** Dashboard → Worker Management → Verify worker → Booking Management → Analytics

**AI:** AI Insights → Demand Forecast → Recommendations → Workforce Allocation view

**Geo:** Nearby → Filter by category → Find Workers Near Me → Select nearby worker

---

## 6. Success Metrics (Post-Launch, Directional)
- % of bookings completed by verified workers
- Average time from search to booking confirmation
- Worker acceptance rate on job requests
- Customer repeat-booking rate
- Worker earnings growth quarter-over-quarter
- Cooperative-reported worker welfare fund utilization

*(Not measurable in the current prototype — included to guide the production roadmap.)*

---

## 7. Assumptions & Constraints
- Prototype uses simulated/mock data; no real users, workers, or transactions
- No production authentication — role switching is unauthenticated for demo purposes
- All data is stored client-side (browser) and is not shared across devices or users
- Payment methods are illustrative only; no real payment gateway is integrated

---

## 8. Future Roadmap (Out of Scope for Prototype)
- React Native mobile apps (customer + worker)
- Node.js / Express backend with MongoDB
- Real authentication & identity verification (Aadhaar-linked or cooperative ID–linked)
- Real-time geo-spatial matching (Google Maps / Mapbox)
- Live ML-based demand forecasting and workforce allocation
- Real payment gateway integration (UPI/cards)
- Cloud infrastructure and horizontal scaling
- Push notifications and SMS-based alerts for low-connectivity users

---

## 9. Open Questions
- Which cooperatives are the initial pilot partners?
- What is the verification process/SLA for onboarding a new worker?
- Who underwrites the worker welfare fund and insurance coverage at production scale?
- What is the commission/fee model between customer payment and worker payout?
