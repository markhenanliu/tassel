# Decision log

Each entry: the decision, the options considered, the reasoning, and what would cause a revisit. Reversals get a new entry that references the one they replace.

---

## D1. One account can hold both roles, with a mode switch

**Date:** 2026-09-18
**Decision:** A single `User` has an optional `PhotographerProfile`. A dual-role user switches between student mode and photographer mode in the UI, as Airbnb does between guest and host.
**Options considered:**
- Account type switch (Instagram): one mode at a time, switching changes the account itself
- One account, two profiles, mode switch in the UI (Airbnb, Upwork)
- Separate accounts per role (Uber rider and driver)
- One account, one combined view of both roles
**Why:** _Your words. Prompt: how common are graduating photographers, and what does each alternative cost them?_
**Revisit if:** _Your words._

---

## D2. Availability is a set of fixed slots, each with its own length

**Date:** 2026-09-18
**Decision:** A photographer publishes discrete slots. Each slot has a start time and a length set by the photographer. A student books one slot.
**Options considered:**
- Open ranges minus existing bookings, with the system computing conflicts
- Fixed slots of one platform-wide length
- Fixed slots, longer sessions consume consecutive slots
- Fixed slots, photographer defines the length of each
- Rules entered as ranges, split into slots for display (Calendly model)
**Why:** _Your words. Prompt: double-booking, per-slot pricing later, and what a photographer has to maintain._
**Revisit if:** _Your words. Prompt: what would you observe in the prototype walkthrough that tells you slot entry is too much work for photographers?_

---

## D3. A pending request holds its slot

**Date:** 2026-09-18
**Decision:** When a student submits a request, the slot is unavailable to other students until the photographer responds or the request lapses (D4).
**Options considered:**
- Pending request holds the slot
- Slot stays open until accepted; competing requests are possible and all but one are declined
**Why:** _Your words._
**Revisit if:** _Your words._

---

## D4. A pending request lapses after 24 hours without a response

**Date:** 2026-09-18
**Decision:** If the photographer neither accepts nor declines within 24 hours, the request moves to `expired` and the slot is released. Accepted bookings never expire.
**Options considered:**
- No expiry, accepting that an unresponsive photographer blocks the slot
- Expiry after a fixed window (24 hours chosen)
- Deposit or penalty: rejected as out of scope because the platform holds no funds; deposits address no-shows on accepted bookings, a separate problem
**Why:** _Your words._
**Revisit if:** _Your words._

---

## D5. Booking statuses and the cancellation record

**Date:** 2026-09-18
**Decision:** Statuses: `pending`, `accepted`, `declined`, `expired`, `cancelled`, `completed`, `no_show`. A cancellation records who cancelled, when, and a reason.
**Options considered:**
- The four request states from the README only (pending, accepted, declined, cancelled)
- No-show as a cancellation reason instead of its own status
**Why:** _Your words. Prompt: which metrics and guardrails need each status to exist?_
**Revisit if:** _Your words._

---

## D6. Completion: one side's mark stands unless the other contests it

**Date:** 2026-09-18
**Decision:** Either party can mark a session `completed` or `no_show`. The mark stands unless the other party contests it.
**Options considered:**
- Automatic completion when the session time passes
- Either party's mark stands, with no contest
- Both parties must confirm
- One mark stands unless contested
**Why:** _Your words. Prompt: completed count is displayed publicly and drives the North Star._
**Open:** contest window length; what a contested booking resolves to.
**Revisit if:** _Your words._

---

## D7. Reviews attach to the booking and the reviewer's role

**Date:** 2026-09-18
**Decision:** A review belongs to one booking and records whether the reviewer acted as student or photographer. A dual-role user's reputation as a photographer and as a client are computed separately.
**Options considered:**
- Reviews attached to the user
- Reviews attached to the booking plus reviewer role
**Why:** _Your words._
**Revisit if:** _Your words._

---

## D8. V0 covers all nine screens, demoed through one persona switcher

**Date:** 2026-09-18
**Decision:** V0 builds every screen in the README. A single persona switcher loads fixture data that puts the viewer in each required state. Marketplace-wide states (empty feed, peak week) are personas, not a second control.
**Options considered:**
- Discovery-only V0 (feed, search, profile, comparison) with booking stubbed
- Full V0
- Persona switcher and marketplace-world switcher as two controls
- One persona switcher
- URL parameters or a hidden demo panel to force states
**Why:** _Your words. Prompt: what the prototype walkthrough is meant to find out._
**Revisit if:** _Your words._
