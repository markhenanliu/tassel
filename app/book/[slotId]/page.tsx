import Link from "next/link";
import { notFound } from "next/navigation";
import { requestBooking } from "@/app/actions";
import { btn, EmptyState, input, label, Notice, PageTitle } from "@/components/ui";
import { holdingBooking, locationById, now, profileById, profileUser, slotById, slotPrice } from "@/lib/derive";
import { dayLabel, duration, money, timeLabel } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function BookPage({ params, searchParams }: PageProps<"/book/[slotId]">) {
  const { slotId } = await params;
  const sp = await searchParams;
  const { data, viewer, mode, dualRole } = await getSession();
  const slot = slotById(data, slotId);
  if (!slot) notFound();
  const profile = profileById(data, slot.photographerProfileId)!;
  const person = profileUser(data, profile);
  const back = { href: `/photographers/${profile.id}?date=${slot.start.slice(0, 10)}`, label: `Back to ${person.name}` };

  const blocked = (() => {
    if (Date.parse(slot.start) < now()) return { title: "This slot has passed", body: "Pick a later time from the profile." };
    if (viewer?.photographerProfileId === profile.id)
      return { title: "You can't book yourself", body: "This slot is on your own photographer profile." };
    if (mode !== "student")
      return dualRole
        ? { title: "Switch to student mode to book", body: "You are in photographer mode. Use the mode switch at the top of the page." }
        : { title: "Booking is for students", body: "Photographer-only accounts can't send requests. Add a verified student role to book." };
    if (!viewer?.student)
      return { title: "Student verification needed", body: "Booking requires a verified university email." };
    const hold = holdingBooking(data, slot.id);
    if (hold)
      return hold.status === "pending"
        ? { title: "Someone has already requested this slot", body: "It's held while the photographer decides, for up to 24 hours. Pick another time, or check back." }
        : { title: "This slot is booked", body: "Pick another time from the profile." };
    return null;
  })();

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle sub={`${person.name} · ${money(profile.hourlyRate)}/hr`}>Request a session</PageTitle>

      <div className="mb-6 rounded-lg border border-stone-200 bg-white p-4 text-sm">
        <p className="text-base font-medium">{dayLabel(slot.start)}, {timeLabel(slot.start)}</p>
        <p className="text-stone-600">{duration(slot.durationMinutes)} · {money(slotPrice(profile, slot))}, paid directly to the photographer</p>
      </div>

      {sp.full && (
        <div className="mb-4">
          <Notice tone="warn">The demo has reached its limit of recorded actions. Use Reset in the top bar to continue.</Notice>
        </div>
      )}

      {blocked ? (
        <EmptyState title={blocked.title} body={blocked.body} action={back} />
      ) : (
        <form action={requestBooking} className="space-y-4">
          <input type="hidden" name="slotId" value={slot.id} />
          <div>
            <label className={label} htmlFor="locationId">Location</label>
            <select id="locationId" name="locationId" required className={input} defaultValue={profile.locationIds[0]}>
              {profile.locationIds.map((l) => (
                <option key={l} value={l}>{locationById(data, l)?.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-stone-500">Public campus and park locations only.</p>
          </div>
          <div>
            <label className={label} htmlFor="notes">Notes for {person.name.split(" ")[0]}</label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              maxLength={280}
              className={input}
              placeholder="Who's coming, shots you want, anything the photographer should know."
            />
          </div>
          <Notice>
            The slot is held for you while {person.name.split(" ")[0]} decides. If there&apos;s no reply within 24 hours, the request
            expires and the slot opens again. A message thread opens when you send.
          </Notice>
          <div className="flex gap-2">
            <button className={btn.primary}>Send request</button>
            <Link href={back.href} className={btn.secondary}>Cancel</Link>
          </div>
        </form>
      )}
    </div>
  );
}
