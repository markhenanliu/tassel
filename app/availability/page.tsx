import Link from "next/link";
import { addSlot, closeSlot } from "@/app/actions";
import { dayRange } from "@/fixtures/clock";
import { btn, input, label, Notice, PageTitle, RoleGate } from "@/components/ui";
import { canCloseSlot, futureSlots, holdingBooking, slotPrice, userById } from "@/lib/derive";
import { dayLabel, duration, money, timeLabel } from "@/lib/format";
import { getSession } from "@/lib/session";

const DAYS = dayRange("06-05", "06-20").map((md) => `2027-${md}`);
const noon = (d: string) => `${d}T12:00:00-07:00`;
const TIMES = Array.from({ length: 53 }, (_, i) => {
  const m = 7 * 60 + i * 15; // 7:00 to 20:00
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});
const errors: Record<string, string> = {
  overlap: "That time overlaps a slot you already offer.",
  past: "That time has already passed.",
  invalid: "Pick a date, a start time, and a length.",
  full: "The demo has reached its limit of recorded actions. Use Reset in the top bar.",
};

// D12: photographers set their own availability. Minimal editor: add a slot, close an open one.
export default async function AvailabilityPage({ searchParams }: PageProps<"/availability">) {
  const sp = await searchParams;
  const { data, viewerProfile, mode } = await getSession();
  if (mode !== "photographer" || !viewerProfile) return <RoleGate need="photographer" />;

  const slots = futureSlots(data, viewerProfile.id, true);
  const days = DAYS.map((d) => ({ d, slots: slots.filter((s) => s.start.startsWith(d)) }));
  const selectedDate = typeof sp.date === "string" && DAYS.includes(sp.date) ? sp.date : DAYS[0];

  return (
    <>
      <PageTitle sub="Students can request any open slot. Close a slot to stop offering it; slots with a request or booking can't be closed.">
        Availability
      </PageTitle>

      <form action={addSlot} className="mb-6 grid grid-cols-2 gap-3 rounded-lg border border-stone-200 bg-white p-4 md:grid-cols-4">
        <div>
          <label className={label} htmlFor="date">Date</label>
          <select id="date" name="date" defaultValue={selectedDate} className={input}>
            {DAYS.map((d) => (
              <option key={d} value={d}>{dayLabel(noon(d))}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="time">Start</label>
          <select id="time" name="time" defaultValue="17:00" className={input}>
            {TIMES.map((t) => (
              <option key={t} value={t}>{timeLabel(`2027-06-05T${t}:00-07:00`)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="duration">Length</label>
          <select id="duration" name="duration" defaultValue="60" className={input}>
            {[30, 45, 60, 90, 120].map((m) => (
              <option key={m} value={m}>{duration(m)} · {money(Math.round((viewerProfile.hourlyRate * m) / 60))}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button className={`${btn.primary} w-full`}>Add slot</button>
        </div>
      </form>

      {typeof sp.error === "string" && errors[sp.error] && (
        <div className="mb-4"><Notice tone="warn">{errors[sp.error]}</Notice></div>
      )}
      {sp.added && <div className="mb-4"><Notice tone="success">Slot added. Students can request it now.</Notice></div>}

      <div className="space-y-4">
        {days.map(({ d, slots: daySlots }) => (
          <section key={d} className="rounded-lg border border-stone-200 bg-white">
            <h2 className="border-b border-stone-100 px-4 py-2 text-sm font-semibold">{dayLabel(noon(d))}</h2>
            {daySlots.length === 0 ? (
              <p className="px-4 py-3 text-sm text-stone-400">No slots offered.</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {daySlots.map((s) => {
                  const hold = holdingBooking(data, s.id);
                  return (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
                      <span className={s.closedAt ? "text-stone-400 line-through" : ""}>
                        {timeLabel(s.start)} · {duration(s.durationMinutes)} · {money(slotPrice(viewerProfile, s))}
                      </span>
                      {s.closedAt ? (
                        <span className="text-stone-400">Closed</span>
                      ) : hold ? (
                        <Link href={`/bookings/${hold.id}`} className="text-stone-600 hover:underline">
                          {hold.status === "pending" ? "Requested" : "Booked"} by {userById(data, hold.studentUserId)?.name}
                        </Link>
                      ) : canCloseSlot(data, s) ? (
                        <form action={closeSlot} className="flex items-center gap-3">
                          <span className="text-emerald-700">Open</span>
                          <input type="hidden" name="slotId" value={s.id} />
                          <button className="rounded border border-stone-300 px-2 py-1 text-xs hover:bg-stone-100">Close</button>
                        </form>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
