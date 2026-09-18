# Tassel

A booking platform connecting graduating UCLA students with student photographers in the LA area.

**Status:** WIP. V0, a visual prototype with synthetic data, is deployed at https://tassel-eight.vercel.app.

---

## Motivation

I have worked in photography and videography for several years and have shot graduation sessions in both high school and undergraduate settings. I have also spoken with a number of photographers who do the same work.

Three problems recur:

1. **Scheduling.** Sessions are arranged over direct messages with no shared calendar. Double-booking and last-minute rescheduling are common on the photographer side.
2. **Pricing.** Rates are negotiated individually each time. Photographers have no reference point for what comparable sessions go for, and students have no way to tell whether a quoted price is reasonable.
3. **Coordination.** Location, session length, and deliverables are agreed informally and often late. There is no record either party can refer back to.

The larger problem is discovery. Photographers are distributed across Instagram, personal sites, university group chats, and referral networks, with no shared index. A student looking for a photographer cannot assemble the set of available options, let alone compare them on price, availability, and style. The search cost falls entirely on the student, and the outcome depends on whose network they happen to sit in.

Photographers face the inverse. Visibility is bounded by an existing social graph. A photographer whose work is competitive but whose reach is limited does not get found.

The platform addresses discovery first. Scheduling and pricing structure follow from having a consolidated directory.

---

## Users

**Photographers.** Students in the LA area who shoot portraits. Client acquisition runs through referrals and social media. Rates are set without a reference distribution.

**Graduating students.** Booking one or more sessions within a short window, typically for the first time, often coordinating with visiting family. The date is fixed.

**Both roles.** Some student photographers are also graduating. A single account can hold both roles.

---

## V0: visual prototype

A navigable front end with no backend. Every screen renders from synthetic fixture data. Nothing persists, nothing sends.

The purpose is to establish the interaction model and get something in front of photographers and students before committing to the data model.

**Screens**
- Feed: image-led grid of recent work
- Search and filter: date availability, price range, location, style tags
- Photographer profile: portfolio, rate, availability calendar, response rate, review summary
- Comparison view: shortlisted photographers side by side on price, availability, and location
- Booking request form: date, time, location, session length, notes
- Request inbox, photographer side: accept and decline states
- Booking confirmation
- Message thread
- Review submission

**States to render explicitly**
- Empty feed, no search results, no availability on the requested date
- Request pending, accepted, declined, cancelled
- Profile with no reviews

All profiles, portfolios, and reviews in V0 are synthetic and labeled as demo data in the interface.

---

## V1: functional

### Accounts
- Registration as student, photographer, or both
- University email verification for the student role
- Profile with name, graduation year, program

### Photographer profile
- Portfolio upload with ordering and captions
- Base rate, session length options, shooting locations
- Availability calendar
- Style and equipment notes
- Response rate and completed session count, displayed publicly

### Discovery
- Feed ordered by recency, weighted by availability
- Search and filter on date, price, location, style tags
- Comparison view for shortlisted photographers

### Booking
- Request specifying date, time, location, session length, notes
- Photographer accepts or declines, with an optional message
- Confirmation to both parties by email and in-app
- `.ics` calendar export on confirmation
- Cancellation flow with a stated window and a reason field

### Messaging
- Thread scoped to a single booking, opened when the request is sent
- Available before confirmation, for coordinating details
- No messaging outside a booking context

### Reviews
- Post-session, in both directions
- Student rates photo quality, communication, punctuality
- Photographer rates punctuality and communication
- Published once both parties submit, or after seven days

Photographer profiles are opt-in. Photographers create their own accounts and upload their own work; portfolio images remain theirs and are licensed to the platform for display only.

---

## Deferred

| Deferred | Reason |
|---|---|
| Dynamic pricing | Requires rate distribution data that does not exist yet. Scoped below |
| Market rate analysis | Input to pricing. Defers with it |
| Payment processing | KYC, chargeback handling, and dispute resolution are disproportionate to current scope. Sessions settle directly between parties |
| Two-way calendar sync | Export meets the requirement; sync requires OAuth against multiple providers and ongoing token maintenance |
| General messaging | Booking-scoped threads cover the coordination need |
| Native iOS and Android | An installable PWA reaches both platforms without app store review |
| Multi-campus | Trust signals are institution-specific and do not transfer |
| Identity verification beyond email | Portfolio and review history serve as signals at pilot scale. Revisit if abuse appears |
| Feed ranking model | No interaction data exists. Recency and availability is the baseline |

---

## Deferred scope: dynamic pricing

Retained here as a specification, not as work in progress.

The booking window has the structure of a revenue management problem. Inventory is perishable, since a slot on the weekend before commencement has no value afterward. Short-run supply is fixed. Demand concentrates into a narrow window. Slot desirability varies by day of week and time of day.

**Inputs required before this can be built**
- Rate and supply distribution for LA-area portrait photographers, from publicly listed sources
- Booking outcomes from the pilot: which slots filled, at what price, which requests went unmatched

**Intended approach.** A season simulation with synthetic students arriving over the booking window, carrying willingness-to-pay drawn from the observed rate distribution. Photographers carry capacity limits and reservation prices. Three policies compared: flat rate, static tiering by day and time, and a dynamic multiplier as a function of days to commencement, slot desirability, and photographer utilization. Measured on match rate, slot utilization, photographer earnings, and price dispersion across comparable sessions.

**Intended product surface.** The photographer sets a base rate. The platform proposes a per-slot multiplier with a stated reason. The photographer accepts or overrides, and the override is recorded as a labeled observation against the recommendation.

---

## Success metrics

Defined now, instrumented at V1. V0 carries no analytics.

**North Star:** completed sessions per week during the booking window.

Requests submitted and accounts created both measure activity that may not result in a session.

**Guardrails**
- Photographer response rate within 24 hours
- No-show rate, either party
- Cancellation within 48 hours of the session
- Review submission rate

**Diagnostics**
- Feed view to profile view
- Profile view to request submitted
- Request to accepted
- Accepted to completed
- Time from request to first response
- Requests per student; sessions per photographer
- Requests for dates with no available photographer

Event schema in `docs/events.md`.

---

## Trust and safety

Applies from V1, when the platform begins arranging meetings between people who have not previously met.

**Product**
- Sessions default to public campus and park locations selected from a curated list
- Confirmation details shareable in one action
- Reporting available on every profile and booking thread
- Booking history and message threads retained
- Response rate and completed session count displayed as behavioral signals

**Policy**
- Terms stating that the platform facilitates introductions and does not employ, supervise, or vet photographers beyond email verification
- Conduct policy with a defined account removal process
- Pre-session guidance covering meeting locations, sharing plans with a third party, and reporting

**Open**
- Whether a phone number should be required after a first completed booking
- Whether identity verification becomes necessary at scale, and its cost to supply-side signup
- Policy covering minors present at a session as family members

Reasoning in `docs/trust-and-safety.md`.

---

## Sequencing

1. **V0 prototype.** Front end on synthetic data, deployed and shareable.
2. **Prototype feedback.** Walk photographers and students through the prototype. Record where the flow breaks and what is missing.
3. **V1 build.** Backend, accounts, booking, messaging, reviews. Instrumented from the start.
4. **Pilot.** A single graduating cohort, limited photographer pool.
5. **Iteration.** `docs/changelog.md` records each change and the observation that prompted it.
6. **Market rate analysis and pricing model.** Built on pilot booking data.
7. **Scale launch.** A full commencement window.
8. **Retrospective.**

Decisions and reversals are logged in `docs/decisions.md` as they occur.

---

## Tech stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js, App Router | Server components for the feed, API routes for booking logic, single deployment target |
| Language | TypeScript | |
| Styling | Tailwind | |
| Database | Postgres via Supabase | Relational structure fits the booking model; row-level security handles access control. V1 |
| Auth | Supabase Auth, email OTP | No password storage; email domain check for the student role. V1 |
| Image storage | Supabase Storage with transform pipeline | Portfolio images are the primary surface and require optimization at serve time. V1 |
| Email | Resend | Booking confirmations and reminders. V1 |
| Analytics | PostHog | Funnel and event tracking. V1 |
| Hosting | Vercel | |
| Distribution | PWA via web app manifest and service worker | Installable on both platforms without app store review |

V0 uses the framework, language, styling, and hosting rows only. Everything marked V1 is added when the backend is built.

---

## Repo structure

```
tassel/
├── README.md
├── app/                          # Next.js application
├── fixtures/                     # Synthetic data driving V0
├── docs/
│   ├── decisions.md              # Decision log
│   ├── events.md                 # Analytics event schema
│   ├── trust-and-safety.md       # Safety design and policy
│   ├── changelog.md              # Changes and the observations behind them
│   └── wireframes/
└── supabase/                     # V1
    ├── migrations/
    └── seed/
```

---

## Open questions

- Whether a request can be sent to multiple photographers simultaneously. Reduces student search cost, degrades photographer experience, and changes the matching model
- How to handle photographers who are themselves graduating and unavailable during the peak window
- Whether reviews at pilot volume carry information
- What recourse exists when a session goes badly, given that the platform holds no funds
- Whether the pricing suggestion, once built, is visible to students or only to photographers

---

## Limitations

V0 demonstrates an interaction model on synthetic data and supports no conclusions about demand. Pilot cohort size will limit most metrics to directional readings. The platform holds no funds, which removes payment risk and also removes payments from the scope of the design problem.
