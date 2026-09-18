// V0 fixture types. This is a draft data model, not the V1 schema.
// Decision references (D1, D2, ...) point to docs/decisions.md.

export type ID = string;
export type ISODateTime = string; // e.g. "2027-06-12T17:00:00-07:00"
export type Cents = number; // money as integer cents, never floats

export type Role = "student" | "photographer";

// D1: one User; each role's details live on an optional part.
// A1: a user without `student` cannot book.
export interface User {
  id: ID;
  name: string;
  email: string;
  student?: {
    graduationYear: number;
    program: string;
  };
  photographerProfileId?: ID;
}

export interface PhotographerProfile {
  id: ID;
  userId: ID;
  bio: string;
  hourlyRate: Cents;
  locationIds: ID[]; // where they are willing to shoot
  styleTags: string[];
  equipmentNotes?: string;
  portfolio: PortfolioImage[]; // array order = display order
  // Not stored: completed session count, response rate, review summary.
  // These are computed from bookings and reviews so fixtures cannot contradict themselves.
}

// D11: stock photos stand in for portfolio work, credited to their real photographers.
export interface PortfolioImage {
  id: ID;
  src: string;
  width: number;
  height: number;
  caption?: string;
  credit: { name: string; unsplashId: string };
  postedAt: ISODateTime; // feed orders by this
}

// Curated list of public meeting locations (trust and safety).
export interface Location {
  id: ID;
  name: string;
  area: "UCLA campus" | "Westwood" | "Santa Monica" | "Griffith Park";
}

// D2: fixed slots, each with its own length.
// Not stored: whether the slot is held. A slot is unavailable when a booking
// on it is pending or accepted (D3).
// D12: a closed slot is kept (bookings still reference it) but hidden from students.
export interface Slot {
  id: ID;
  photographerProfileId: ID;
  start: ISODateTime;
  durationMinutes: number;
  closedAt?: ISODateTime;
}

// D5: request and booking are one object; status moves through the lifecycle.
export type BookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired" // D4: no response within 24h of createdAt
  | "cancelled"
  | "completed"
  | "no_show";

export interface Booking {
  id: ID;
  slotId: ID;
  studentUserId: ID;
  photographerProfileId: ID;
  locationId: ID;
  notes?: string;
  status: BookingStatus;
  createdAt: ISODateTime;
  respondedAt?: ISODateTime;
  responseMessage?: string; // optional note with accept or decline
  cancellation?: {
    by: Role;
    at: ISODateTime;
    reason: string;
  };
  // D6: one side's mark stands unless contested within 24h. Resolution deferred.
  completionMark?: {
    by: Role;
    at: ISODateTime;
    contestedAt?: ISODateTime;
  };
}

export interface Message {
  id: ID;
  bookingId: ID; // threads exist only inside a booking
  senderUserId: ID;
  sentAt: ISODateTime;
  body: string;
}

// D7: reviews attach to a booking and the reviewer's role in it.
export type Review =
  | (ReviewBase & {
      reviewerRole: "student";
      ratings: { photoQuality: Rating; communication: Rating; punctuality: Rating };
    })
  | (ReviewBase & {
      reviewerRole: "photographer";
      ratings: { communication: Rating; punctuality: Rating };
    });

interface ReviewBase {
  id: ID;
  bookingId: ID;
  reviewerUserId: ID;
  submittedAt: ISODateTime;
  body?: string;
}

export type Rating = 1 | 2 | 3 | 4 | 5;

// D8: a persona sets who is viewing, in which mode, and which fixture world loads.
export type World = "standard" | "launchDay" | "peakWeek";

export interface Persona {
  id: ID;
  label: string;
  description: string;
  viewerUserId: ID | null; // null = signed-out visitor
  mode: Role;
  world: World;
  demonstrates: string[]; // states this persona exists to show
  home: string; // route the switcher opens
  shortlist?: ID[]; // photographer profile ids pre-shortlisted
}

export interface Dataset {
  users: User[];
  profiles: PhotographerProfile[];
  locations: Location[];
  slots: Slot[];
  bookings: Booking[];
  messages: Message[];
  reviews: Review[];
}
