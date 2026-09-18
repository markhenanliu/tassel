// A7: actions taken during a walkthrough, replayed on top of the fixture world.
import { DEMO_NOW } from "@/fixtures/clock";
import type { Dataset, ID, Rating, Role } from "@/fixtures/types";

export type DemoAction =
  | { t: "req"; id: ID; slotId: ID; locationId: ID; notes?: string; by: ID }
  | { t: "resp"; id: ID; decision: "accepted" | "declined"; message?: string; by: ID; closeSlot?: boolean }
  | { t: "slot-add"; id: ID; profileId: ID; start: string; durationMinutes: number }
  | { t: "slot-close"; id: ID }
  | { t: "cancel"; id: ID; role: Role; reason: string }
  | { t: "mark"; id: ID; outcome: "completed" | "no_show"; role: Role }
  | { t: "contest"; id: ID }
  | { t: "rev"; id: ID; role: Role; by: ID; ratings: Record<string, Rating>; body?: string }
  | { t: "msg"; id: ID; by: ID; body: string };

export const MAX_ACTIONS = 25;

// Each action happens one minute after the previous one, starting at the demo clock.
const stamp = (i: number) => new Date(Date.parse(DEMO_NOW) + (i + 1) * 60000).toISOString();

export function applyActions(base: Dataset, actions: DemoAction[]): Dataset {
  const data: Dataset = {
    ...base,
    slots: base.slots.map((x) => ({ ...x })),
    bookings: base.bookings.map((b) => ({ ...b })),
    messages: [...base.messages],
    reviews: [...base.reviews],
  };
  actions.forEach((a, i) => {
    const at = stamp(i);
    if (a.t === "req") {
      const slot = data.slots.find((s) => s.id === a.slotId);
      if (!slot) return;
      data.bookings.push({
        id: a.id, slotId: a.slotId, studentUserId: a.by, photographerProfileId: slot.photographerProfileId,
        locationId: a.locationId, notes: a.notes, status: "pending", createdAt: at,
      });
      return;
    }
    if (a.t === "slot-add") {
      data.slots.push({ id: a.id, photographerProfileId: a.profileId, start: a.start, durationMinutes: a.durationMinutes });
      return;
    }
    if (a.t === "slot-close") {
      const slot = data.slots.find((x) => x.id === a.id);
      const held = data.bookings.some((x) => x.slotId === a.id && (x.status === "pending" || x.status === "accepted"));
      if (slot && !held) slot.closedAt = at;
      return;
    }
    const b = data.bookings.find((x) => x.id === a.id);
    if (!b) return;
    switch (a.t) {
      case "resp":
        if (b.status !== "pending") return;
        b.status = a.decision;
        b.respondedAt = at;
        b.responseMessage = a.message;
        if (a.message) data.messages.push({ id: `dm-${i}`, bookingId: b.id, senderUserId: a.by, sentAt: at, body: a.message });
        if (a.decision === "declined" && a.closeSlot) {
          const slot = data.slots.find((x) => x.id === b.slotId);
          if (slot) slot.closedAt = at;
        }
        return;
      case "cancel":
        if (b.status !== "pending" && b.status !== "accepted") return;
        b.status = "cancelled";
        b.cancellation = { by: a.role, at, reason: a.reason };
        return;
      case "mark":
        if (b.status !== "accepted") return;
        b.status = a.outcome;
        b.completionMark = { by: a.role, at };
        return;
      case "contest":
        if (b.completionMark && !b.completionMark.contestedAt) b.completionMark = { ...b.completionMark, contestedAt: at };
        return;
      case "rev":
        if (data.reviews.some((r) => r.bookingId === b.id && r.reviewerRole === a.role)) return;
        data.reviews.push({
          id: `dr-${i}`, bookingId: b.id, reviewerUserId: a.by, reviewerRole: a.role,
          ratings: a.ratings, body: a.body, submittedAt: at,
        } as Dataset["reviews"][number]);
        return;
      case "msg":
        data.messages.push({ id: `dm-${i}`, bookingId: b.id, senderUserId: a.by, sentAt: at, body: a.body });
        return;
    }
  });
  return data;
}

export function encodeActions(actions: DemoAction[]): string {
  return Buffer.from(JSON.stringify(actions)).toString("base64url");
}

export function decodeActions(raw: string | undefined): DemoAction[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString());
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
