// D8: one persona switcher. Each persona exists to show specific states.
import type { Persona } from "./types";

export const personas: Persona[] = [
  {
    id: "maya",
    label: "Maya, first-time student",
    description: "Graduating this June, has not booked anyone yet.",
    viewerUserId: "u-maya", mode: "student", world: "standard", home: "/",
    demonstrates: ["Feed", "Search results", "No results", "Profile", "Empty comparison", "Booking request form", "Slot held by another request"],
  },
  {
    id: "priya",
    label: "Priya, mid-booking",
    description: "Shortlisted three photographers. One request pending, one declined, one expired.",
    viewerUserId: "u-priya", mode: "student", world: "standard", home: "/bookings",
    shortlist: ["p-aiden", "p-noor", "p-theo"],
    demonstrates: ["Comparison view", "Pending", "Declined", "Expired", "Message thread"],
  },
  {
    id: "ethan",
    label: "Ethan, after his session",
    description: "One completed session to review. One booking the photographer cancelled.",
    viewerUserId: "u-ethan", mode: "student", world: "standard", home: "/bookings",
    demonstrates: ["Completed", "Review submission", "Cancelled by photographer", "Read-only thread"],
  },
  {
    id: "maya-peak",
    label: "Maya, peak week",
    description: "Most photographers are booked. Searches for commencement weekend come back empty.",
    viewerUserId: "u-maya", mode: "student", world: "peakWeek", home: "/search?date=2027-06-12",
    demonstrates: ["No availability on requested date", "Fully booked profiles"],
  },
  {
    id: "launch",
    label: "Maya, launch day",
    description: "No photographers have joined yet.",
    viewerUserId: "u-maya", mode: "student", world: "launchDay", home: "/",
    demonstrates: ["Empty feed", "Search with no photographers"],
  },
  {
    id: "jordan",
    label: "Jordan, new photographer",
    description: "Three portfolio images, no reviews, no requests yet.",
    viewerUserId: "u-jordan", mode: "photographer", world: "standard", home: "/photographers/p-jordan",
    demonstrates: ["Profile with no reviews", "Empty inbox", "Viewing own profile"],
  },
  {
    id: "lena",
    label: "Lena, established photographer",
    description: "Fully booked commencement weekend. Inbox has a request in every status.",
    viewerUserId: "u-lena", mode: "photographer", world: "standard", home: "/inbox",
    demonstrates: ["Inbox: pending, accepted, declined, cancelled by student", "Accept and decline", "Contested no-show", "Review awaiting the other side"],
  },
  {
    id: "sam",
    label: "Sam, graduating photographer",
    description: "Holds both roles. Shooting the week before and after commencement, booked someone else for their own graduation photos.",
    viewerUserId: "u-sam", mode: "photographer", world: "standard", home: "/inbox",
    demonstrates: ["Mode switch", "Self-booking blocked", "Accepted booking as a student"],
  },
];

export const DEFAULT_PERSONA_ID = "maya";

export function getPersona(id: string | undefined): Persona {
  return personas.find((p) => p.id === id) ?? personas.find((p) => p.id === DEFAULT_PERSONA_ID)!;
}
