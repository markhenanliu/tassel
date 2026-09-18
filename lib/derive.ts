// A3: everything shown as a count, rate, hold, or visibility is computed here
// from bookings and reviews, never stored on the fixtures.
import { DEMO_NOW } from "@/fixtures/clock";
import type { Booking, Cents, Dataset, ID, PhotographerProfile, Review, Role, Slot } from "@/fixtures/types";

const HOUR = 3600000;
const DAY = 24 * HOUR;
export const now = () => Date.parse(DEMO_NOW);

export const PENDING_LAPSE_MS = 24 * HOUR; // D4
export const CONTEST_WINDOW_MS = 24 * HOUR; // D6
export const REVIEW_WINDOW_MS = 7 * DAY; // A10

// A2
export function slotPrice(profile: PhotographerProfile, slot: Slot): Cents {
  return Math.round((profile.hourlyRate * slot.durationMinutes) / 60);
}

export const slotEnd = (slot: Slot) => Date.parse(slot.start) + slot.durationMinutes * 60000;

// D3: a slot is unavailable while a booking on it is pending or accepted.
export function holdingBooking(data: Dataset, slotId: ID): Booking | undefined {
  return data.bookings.find((b) => b.slotId === slotId && (b.status === "pending" || b.status === "accepted"));
}

export function isOpen(data: Dataset, slot: Slot): boolean {
  return Date.parse(slot.start) > now() && !holdingBooking(data, slot.id);
}

export function openSlots(data: Dataset, profileId: ID, day?: string): Slot[] {
  return data.slots
    .filter((s) => s.photographerProfileId === profileId && (!day || s.start.startsWith(day)) && isOpen(data, s))
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}

export function futureSlots(data: Dataset, profileId: ID): Slot[] {
  return data.slots
    .filter((s) => s.photographerProfileId === profileId && Date.parse(s.start) > now())
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}

export const expiresAt = (b: Booking) => Date.parse(b.createdAt) + PENDING_LAPSE_MS;

// A11: response rate = requests answered within 24h / requests no longer pending.
export function profileStats(data: Dataset, profileId: ID) {
  const received = data.bookings.filter((b) => b.photographerProfileId === profileId && b.status !== "pending");
  const answeredInTime = received.filter(
    (b) => b.respondedAt && Date.parse(b.respondedAt) - Date.parse(b.createdAt) <= PENDING_LAPSE_MS,
  );
  // Contested marks count toward neither outcome until resolution is decided (D6).
  const completed = data.bookings.filter(
    (b) => b.photographerProfileId === profileId && b.status === "completed" && !b.completionMark?.contestedAt,
  );
  const aboutPhotographer = publishedReviews(data).filter(
    (r) => r.reviewerRole === "student" && bookingById(data, r.bookingId)?.photographerProfileId === profileId,
  );
  const avg = (key: "photoQuality" | "communication" | "punctuality") =>
    aboutPhotographer.length
      ? aboutPhotographer.reduce((sum, r) => sum + (r.ratings as Record<string, number>)[key], 0) / aboutPhotographer.length
      : null;
  const overall = aboutPhotographer.length
    ? aboutPhotographer.reduce((sum, r) => {
        const v = Object.values(r.ratings) as number[];
        return sum + v.reduce((a, c) => a + c, 0) / v.length;
      }, 0) / aboutPhotographer.length
    : null;
  return {
    responseRate: received.length ? answeredInTime.length / received.length : null,
    requestsReceived: received.length,
    completedSessions: completed.length,
    reviewCount: aboutPhotographer.length,
    rating: overall,
    photoQuality: avg("photoQuality"),
    communication: avg("communication"),
    punctuality: avg("punctuality"),
    reviews: aboutPhotographer,
  };
}

export const bookingById = (data: Dataset, id: ID) => data.bookings.find((b) => b.id === id);
export const slotById = (data: Dataset, id: ID) => data.slots.find((s) => s.id === id);
export const profileById = (data: Dataset, id: ID) => data.profiles.find((p) => p.id === id);
export const userById = (data: Dataset, id: ID | null | undefined) => data.users.find((u) => u.id === id);
export const locationById = (data: Dataset, id: ID) => data.locations.find((l) => l.id === id);
export const profileUser = (data: Dataset, p: PhotographerProfile) => userById(data, p.userId)!;

// A10: reviews publish when both sides submit or when the 7-day window closes.
export function reviewWindowCloses(data: Dataset, b: Booking): number | null {
  if (b.status !== "completed") return null;
  const slot = slotById(data, b.slotId);
  return slot ? slotEnd(slot) + REVIEW_WINDOW_MS : null;
}

export function isPublished(data: Dataset, r: Review): boolean {
  const b = bookingById(data, r.bookingId);
  if (!b) return false;
  const both = data.reviews.filter((x) => x.bookingId === b.id).length >= 2;
  const closes = reviewWindowCloses(data, b);
  return both || (closes !== null && now() > closes);
}

export function publishedReviews(data: Dataset): Review[] {
  return data.reviews.filter((r) => isPublished(data, r));
}

export type ReviewState =
  | { kind: "not-eligible"; reason: string }
  | { kind: "eligible"; closes: number }
  | { kind: "submitted-waiting"; review: Review; closes: number }
  | { kind: "published"; mine?: Review; theirs?: Review }
  | { kind: "closed" };

export function reviewState(data: Dataset, b: Booking, role: Role): ReviewState {
  if (b.status !== "completed") {
    return { kind: "not-eligible", reason: "Reviews open once a session is marked completed." };
  }
  const mine = data.reviews.find((r) => r.bookingId === b.id && r.reviewerRole === role);
  const theirs = data.reviews.find((r) => r.bookingId === b.id && r.reviewerRole !== role);
  const closes = reviewWindowCloses(data, b)!;
  if (mine && theirs) return { kind: "published", mine, theirs };
  if (now() > closes) return mine || theirs ? { kind: "published", mine, theirs } : { kind: "closed" };
  if (mine) return { kind: "submitted-waiting", review: mine, closes };
  return { kind: "eligible", closes };
}

// D6: the side that did not mark can contest within 24 hours.
export function canContest(b: Booking, role: Role): boolean {
  const m = b.completionMark;
  if (!m || m.contestedAt || m.by === role) return false;
  return now() - Date.parse(m.at) <= CONTEST_WINDOW_MS;
}

export function canMarkOutcome(data: Dataset, b: Booking): boolean {
  const slot = slotById(data, b.slotId);
  return b.status === "accepted" && !!slot && Date.parse(slot.start) < now();
}

// A9: threads become read-only once a request is declined, expired, or cancelled.
export const threadClosed = (b: Booking) => ["declined", "expired", "cancelled"].includes(b.status);
