"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPersona } from "@/fixtures/personas";
import type { Rating, Role } from "@/fixtures/types";
import { decodeActions, encodeActions, MAX_ACTIONS, type DemoAction } from "@/lib/demo-actions";
import { getSession, COOKIE } from "@/lib/session";
import { bookingById, canCloseSlot, holdingBooking, now, overlappingSlot, slotById } from "@/lib/derive";
import { bookingView } from "@/lib/booking-view";

const text = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

// The viewer's role on a specific booking, taken from the booking itself rather than the UI mode.
async function roleOn(bookingId: string) {
  const { data, viewer } = await getSession();
  const b = bookingById(data, bookingId);
  return b && viewer ? { viewer, role: bookingView(data, b, viewer).role } : { viewer, role: null };
}

async function record(action: DemoAction) {
  const store = await cookies();
  const actions = decodeActions(store.get(COOKIE.actions)?.value);
  if (actions.length >= MAX_ACTIONS) return false;
  store.set(COOKIE.actions, encodeActions([...actions, action]), { path: "/", sameSite: "lax" });
  return true;
}

export async function switchPersona(formData: FormData) {
  const persona = getPersona(text(formData.get("persona"), 40));
  const store = await cookies();
  const previous = getPersona(store.get(COOKIE.persona)?.value);
  store.set(COOKIE.persona, persona.id, { path: "/", sameSite: "lax" });
  store.delete(COOKIE.mode);
  store.delete(COOKIE.shortlist);
  // Actions carry over between personas in the same world, so one side's
  // request can be answered by the other side.
  if (previous.world !== persona.world) store.delete(COOKIE.actions);
  redirect(persona.home);
}

export async function resetDemo() {
  const { persona } = await getSession();
  const store = await cookies();
  store.delete(COOKIE.mode);
  store.delete(COOKIE.shortlist);
  store.delete(COOKIE.actions);
  redirect(persona.home);
}

export async function switchMode() {
  const { mode, dualRole } = await getSession();
  if (!dualRole) return;
  const next: Role = mode === "student" ? "photographer" : "student";
  (await cookies()).set(COOKIE.mode, next, { path: "/", sameSite: "lax" });
  redirect(next === "photographer" ? "/inbox" : "/");
}

export async function toggleShortlist(formData: FormData) {
  const id = text(formData.get("profileId"), 40);
  const { shortlist } = await getSession();
  const next = shortlist.includes(id) ? shortlist.filter((x) => x !== id) : [...shortlist, id].slice(-4);
  (await cookies()).set(COOKIE.shortlist, next.join(","), { path: "/", sameSite: "lax" });
}

export async function requestBooking(formData: FormData) {
  const { data, viewer, mode } = await getSession();
  const slotId = text(formData.get("slotId"), 60);
  const slot = slotById(data, slotId);
  if (!viewer?.student || mode !== "student" || !slot) redirect(`/book/${slotId}`);
  if (slot.closedAt || holdingBooking(data, slotId) || viewer.photographerProfileId === slot.photographerProfileId) redirect(`/book/${slotId}`);
  const id = `b-demo-${Date.now().toString(36)}`;
  const ok = await record({
    t: "req", id, slotId, by: viewer.id,
    locationId: text(formData.get("locationId"), 40),
    notes: text(formData.get("notes"), 280) || undefined,
  });
  redirect(ok ? `/bookings/${id}?sent=1` : `/book/${slotId}?full=1`);
}

export async function respondToRequest(formData: FormData) {
  const { viewer, role } = await roleOn(text(formData.get("bookingId"), 60));
  if (!viewer || role !== "photographer") return;
  const raw = formData.get("decision");
  const decision = raw === "accepted" ? "accepted" : "declined";
  await record({
    t: "resp", id: text(formData.get("bookingId"), 60), decision, by: viewer.id,
    message: text(formData.get("message"), 280) || undefined,
    closeSlot: raw === "declined_close" || undefined,
  });
}

export async function cancelBooking(formData: FormData) {
  const id = text(formData.get("bookingId"), 60);
  const { role } = await roleOn(id);
  if (!role) return;
  await record({ t: "cancel", id, role, reason: text(formData.get("reason"), 200) || "No reason given." });
  redirect(`/bookings/${id}`);
}

export async function markOutcome(formData: FormData) {
  const id = text(formData.get("bookingId"), 60);
  const { role } = await roleOn(id);
  if (!role) return;
  const outcome = formData.get("outcome") === "no_show" ? "no_show" : "completed";
  await record({ t: "mark", id, outcome, role });
}

export async function contestOutcome(formData: FormData) {
  if (!(await roleOn(text(formData.get("bookingId"), 60))).role) return;
  await record({ t: "contest", id: text(formData.get("bookingId"), 60) });
}

export async function submitReview(formData: FormData) {
  const id = text(formData.get("bookingId"), 60);
  const { viewer, role } = await roleOn(id);
  if (!viewer || !role) return;
  const keys = role === "student" ? ["photoQuality", "communication", "punctuality"] : ["communication", "punctuality"];
  const ratings: Record<string, Rating> = {};
  for (const k of keys) {
    const n = Number(formData.get(k));
    if (!(n >= 1 && n <= 5)) redirect(`/bookings/${id}/review?missing=1`);
    ratings[k] = n as Rating;
  }
  await record({ t: "rev", id, role, by: viewer.id, ratings, body: text(formData.get("body"), 280) || undefined });
  redirect(`/bookings/${id}/review`);
}

export async function sendMessage(formData: FormData) {
  const id = text(formData.get("bookingId"), 60);
  const { viewer, role } = await roleOn(id);
  const body = text(formData.get("body"), 280);
  if (!viewer || !role || !body) return;
  await record({ t: "msg", id, by: viewer.id, body });
}

// D12: photographers manage their own availability.
export async function addSlot(formData: FormData) {
  const { data, viewerProfile } = await getSession();
  if (!viewerProfile) return;
  const date = text(formData.get("date"), 10);
  const time = text(formData.get("time"), 5);
  const durationMinutes = Number(formData.get("duration"));
  if (!/^2027-\d\d-\d\d$/.test(date) || !/^\d\d:\d\d$/.test(time) || ![30, 45, 60, 90, 120].includes(durationMinutes)) {
    redirect("/availability?error=invalid");
  }
  const start = `${date}T${time}:00-07:00`;
  if (Date.parse(start) <= now()) redirect("/availability?error=past");
  if (overlappingSlot(data, viewerProfile.id, Date.parse(start), durationMinutes)) redirect(`/availability?error=overlap&date=${date}`);
  const ok = await record({ t: "slot-add", id: `s-demo-${Date.now().toString(36)}`, profileId: viewerProfile.id, start, durationMinutes });
  redirect(ok ? `/availability?added=1&date=${date}` : "/availability?error=full");
}

export async function closeSlot(formData: FormData) {
  const { data, viewerProfile } = await getSession();
  const slot = slotById(data, text(formData.get("slotId"), 60));
  if (!viewerProfile || !slot || slot.photographerProfileId !== viewerProfile.id || !canCloseSlot(data, slot)) return;
  await record({ t: "slot-close", id: slot.id });
}
