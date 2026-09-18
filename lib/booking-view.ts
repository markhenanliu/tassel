import type { Booking, Dataset, Role, User } from "@/fixtures/types";
import { locationById, profileById, profileUser, slotById, slotPrice, userById } from "./derive";

// Resolves everything a booking screen shows, plus the viewer's role in this booking.
export function bookingView(data: Dataset, b: Booking, viewer: User | null) {
  const slot = slotById(data, b.slotId)!;
  const profile = profileById(data, b.photographerProfileId)!;
  const photographer = profileUser(data, profile);
  const student = userById(data, b.studentUserId)!;
  const role: Role | null =
    viewer?.id === student.id ? "student" : viewer?.photographerProfileId === profile.id ? "photographer" : null;
  return {
    slot,
    profile,
    photographer,
    student,
    location: locationById(data, b.locationId)!,
    price: slotPrice(profile, slot),
    role,
    other: role === "student" ? photographer : student,
  };
}

export const LATE_CANCEL_MS = 48 * 3600000; // README guardrail: cancellation within 48h of the session
