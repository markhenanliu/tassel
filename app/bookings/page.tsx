import Link from "next/link";
import { EmptyState, PageTitle, RoleGate, StatusBadge } from "@/components/ui";
import { bookingView } from "@/lib/booking-view";
import { now, reviewState } from "@/lib/derive";
import { dayLabel, timeLabel } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function MyBookingsPage() {
  const { data, viewer, mode } = await getSession();
  if (mode !== "student" || !viewer) return <RoleGate need="student" />;

  const mine = data.bookings
    .filter((b) => b.studentUserId === viewer.id)
    .map((b) => ({ b, v: bookingView(data, b, viewer) }))
    .sort((x, y) => Date.parse(x.v.slot.start) - Date.parse(y.v.slot.start));

  if (mine.length === 0) {
    return (
      <>
        <PageTitle>My bookings</PageTitle>
        <EmptyState
          title="No requests yet"
          body="When you request a session, it shows up here with its status and a message thread."
          action={{ href: "/search", label: "Find a photographer" }}
        />
      </>
    );
  }

  const groups = [
    { title: "Upcoming", items: mine.filter(({ b, v }) => (b.status === "pending" || b.status === "accepted") && Date.parse(v.slot.start) > now()) },
    { title: "Past sessions", items: mine.filter(({ b, v }) => ["completed", "no_show"].includes(b.status) || (b.status === "accepted" && Date.parse(v.slot.start) <= now())) },
    { title: "Closed requests", items: mine.filter(({ b }) => ["declined", "expired", "cancelled"].includes(b.status)) },
  ];

  return (
    <>
      <PageTitle>My bookings</PageTitle>
      <div className="space-y-8">
        {groups.map((g) =>
          g.items.length === 0 ? null : (
            <section key={g.title}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">{g.title}</h2>
              <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
                {g.items.map(({ b, v }) => {
                  const review = reviewState(data, b, "student");
                  return (
                    <li key={b.id}>
                      <Link href={`/bookings/${b.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-stone-50">
                        <span>
                          <span className="font-medium">{v.photographer.name}</span>
                          <span className="block text-sm text-stone-600">
                            {dayLabel(v.slot.start)}, {timeLabel(v.slot.start)} · {v.location.name}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          {review.kind === "eligible" && <span className="text-xs font-medium text-sky-800">Review due</span>}
                          <StatusBadge status={b.status} contested={!!b.completionMark?.contestedAt} />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ),
        )}
      </div>
    </>
  );
}
