import Link from "next/link";
import { respondToRequest } from "@/app/actions";
import { btn, EmptyState, PageTitle, RoleGate, StatusBadge } from "@/components/ui";
import type { BookingStatus } from "@/fixtures/types";
import { bookingView } from "@/lib/booking-view";
import { expiresAt } from "@/lib/derive";
import { dateTimeLabel, dayLabel, relative, timeLabel } from "@/lib/format";
import { getSession } from "@/lib/session";

const TABS: { key: BookingStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "declined", label: "Declined" },
  { key: "expired", label: "Expired" },
  { key: "cancelled", label: "Cancelled" },
  { key: "completed", label: "Completed" },
  { key: "no_show", label: "No-show" },
];

export default async function InboxPage({ searchParams }: PageProps<"/inbox">) {
  const sp = await searchParams;
  const { data, viewer, viewerProfile, mode } = await getSession();
  if (mode !== "photographer" || !viewerProfile) return <RoleGate need="photographer" />;

  const all = data.bookings
    .filter((b) => b.photographerProfileId === viewerProfile.id)
    .map((b) => ({ b, v: bookingView(data, b, viewer) }));
  const tab = TABS.find((t) => t.key === sp.status)?.key ?? "pending";
  const items = all
    .filter(({ b }) => b.status === tab)
    .sort((x, y) =>
      tab === "pending"
        ? expiresAt(x.b) - expiresAt(y.b)
        : Date.parse(x.v.slot.start) - Date.parse(y.v.slot.start),
    );

  return (
    <>
      <PageTitle sub="Requests expire if you don't reply within 24 hours.">Requests</PageTitle>
      <nav className="mb-4 flex gap-2 overflow-x-auto pb-1 text-sm">
        {TABS.map((t) => {
          const n = all.filter(({ b }) => b.status === t.key).length;
          return (
            <Link
              key={t.key}
              href={`/inbox?status=${t.key}`}
              className={`shrink-0 rounded-full border px-3 py-1 ${
                t.key === tab ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white hover:bg-stone-100"
              }`}
            >
              {t.label} {n > 0 && <span className="opacity-70">{n}</span>}
            </Link>
          );
        })}
      </nav>

      {all.length === 0 ? (
        <EmptyState
          title="No requests yet"
          body="Students see your profile in the feed and in search. A complete portfolio and open slots on commencement weekend get the most views."
          action={{ href: `/photographers/${viewerProfile.id}`, label: "View your profile" }}
        />
      ) : items.length === 0 ? (
        <EmptyState title={`No ${TABS.find((t) => t.key === tab)!.label.toLowerCase()} requests`} body="Other tabs have your remaining requests." />
      ) : (
        <ul className="space-y-3">
          {items.map(({ b, v }) => (
            <li key={b.id} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/bookings/${b.id}`} className="font-medium hover:underline">{v.student.name}</Link>
                  <p className="text-sm text-stone-600">
                    {dayLabel(v.slot.start)}, {timeLabel(v.slot.start)} · {v.location.name}
                  </p>
                </div>
                <StatusBadge status={b.status} contested={!!b.completionMark?.contestedAt} />
              </div>
              {b.notes && <p className="mt-2 text-sm text-stone-800">“{b.notes}”</p>}
              <p className="mt-2 text-xs text-stone-500">
                Sent {dateTimeLabel(b.createdAt)}
                {b.status === "pending" && ` · expires ${relative(expiresAt(b))}`}
                {b.cancellation && ` · cancelled by ${b.cancellation.by}: ${b.cancellation.reason}`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {b.status === "pending" && (
                  <form action={respondToRequest} className="flex gap-2">
                    <input type="hidden" name="bookingId" value={b.id} />
                    <button name="decision" value="accepted" className={btn.primary}>Accept</button>
                    <button name="decision" value="declined" className={btn.secondary}>Decline</button>
                  </form>
                )}
                <Link href={`/bookings/${b.id}`} className={btn.secondary}>Details</Link>
                <Link href={`/bookings/${b.id}/messages`} className={btn.secondary}>Messages</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
