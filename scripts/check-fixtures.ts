// Fixture consistency checks (A3, A4, D3, D4). Run: npm run check:fixtures
import { buildWorld } from "../fixtures/worlds";
import { personas } from "../fixtures/personas";
import { DEMO_NOW } from "../fixtures/clock";
const now = Date.parse(DEMO_NOW);
for (const w of ["standard", "peakWeek", "launchDay"] as const) {
  const d = buildWorld(w);
  const errs: string[] = [];
  const ids = new Set<string>();
  for (const b of d.bookings) {
    if (ids.has(b.id)) errs.push(`dup booking ${b.id}`); ids.add(b.id);
    const s = d.slots.find((x) => x.id === b.slotId);
    if (!s) { errs.push(`no slot ${b.slotId}`); continue; }
    if (s.photographerProfileId !== b.photographerProfileId) errs.push(`profile mismatch ${b.id}`);
    if (!d.users.find((u) => u.id === b.studentUserId)?.student) errs.push(`non-student booker ${b.id}`);
    const marked = b.status === "completed" || b.status === "no_show";
    if (marked !== !!b.completionMark) errs.push(`A4 mark mismatch ${b.id}`);
    if (b.status === "pending" && Date.parse(b.createdAt) + 864e5 < now) errs.push(`pending past 24h ${b.id}`);
    if (b.status === "cancelled" && !b.cancellation) errs.push(`cancel w/o record ${b.id}`);
    if (marked && Date.parse(s.start) > now) errs.push(`future session marked ${b.id}`);
  }
  const holds = d.bookings.filter((b) => b.status === "pending" || b.status === "accepted").map((b) => b.slotId);
  if (new Set(holds).size !== holds.length) errs.push("double-held slot");
  const sid = d.slots.map((s) => s.id); if (new Set(sid).size !== sid.length) errs.push("dup slot ids");
  for (const m of d.messages) if (!d.bookings.find((b) => b.id === m.bookingId)) errs.push(`orphan msg ${m.id}`);
  console.log(w, `bookings=${d.bookings.length} slots=${d.slots.length}`, errs.length ? errs : "OK");
}
for (const p of personas) if (p.viewerUserId && !buildWorld(p.world).users.find((u) => u.id === p.viewerUserId)) console.log("missing viewer", p.id);
