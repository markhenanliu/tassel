// World variants built from the standard dataset (D8).
import { at } from "./clock";
import { buildStandard, fillerStudents } from "./standard";
import type { Booking, Dataset, World } from "./types";

// Launch day: no photographers have joined yet.
function buildLaunchDay(): Dataset {
  const base = buildStandard();
  return {
    ...base,
    users: base.users.filter((u) => !u.photographerProfileId),
    profiles: [],
    slots: [],
    bookings: [],
    messages: [],
    reviews: [],
  };
}

// Peak week: every slot from June 9 to 14 is taken, and two of every three
// slots on other future dates. Searching commencement weekend finds nothing open.
function buildPeakWeek(): Dataset {
  const base = buildStandard();
  const busy = new Set(
    base.bookings.filter((b) => b.status === "pending" || b.status === "accepted").map((b) => b.slotId),
  );
  const extra: Booking[] = [];
  let i = 0;
  for (const s of base.slots) {
    if (busy.has(s.id) || Date.parse(s.start) < Date.parse(at("06-04", "10:00"))) continue;
    const day = s.start.slice(5, 10);
    const inPeak = day >= "06-09" && day <= "06-14";
    const fill = inPeak || i % 3 !== 0;
    i++;
    if (!fill) continue;
    const studentUser = fillerStudents[extra.length % fillerStudents.length];
    extra.push({
      id: `b-peak-${s.id}`, slotId: s.id, studentUserId: studentUser.id, photographerProfileId: s.photographerProfileId,
      locationId: "loc-royce", status: "accepted", createdAt: at("05-22", "12:00"), respondedAt: at("05-22", "16:00"),
    });
  }
  return { ...base, bookings: [...base.bookings, ...extra] };
}

export function buildWorld(world: World): Dataset {
  if (world === "launchDay") return buildLaunchDay();
  if (world === "peakWeek") return buildPeakWeek();
  return buildStandard();
}
