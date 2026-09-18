import Link from "next/link";
import type { Booking } from "@/fixtures/types";
import type { bookingView } from "@/lib/booking-view";
import { dayLabel, duration, money, timeLabel } from "@/lib/format";
import { StatusBadge } from "./ui";

export function BookingHeader({ b, v, active }: { b: Booking; v: ReturnType<typeof bookingView>; active: "details" | "messages" | "review" }) {
  const tabs = [
    { key: "details", href: `/bookings/${b.id}`, label: "Details" },
    { key: "messages", href: `/bookings/${b.id}/messages`, label: "Messages" },
    { key: "review", href: `/bookings/${b.id}/review`, label: "Review" },
  ];
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {v.role === "student" ? `Session with ${v.photographer.name}` : `Request from ${v.student.name}`}
        </h1>
        <StatusBadge status={b.status} contested={!!b.completionMark?.contestedAt} />
      </div>
      <p className="mt-1 text-sm text-stone-600">
        {dayLabel(v.slot.start)}, {timeLabel(v.slot.start)} · {duration(v.slot.durationMinutes)} · {v.location.name} · {money(v.price)}
      </p>
      <nav className="mt-4 flex gap-4 border-b border-stone-200 text-sm">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`-mb-px border-b-2 pb-2 ${active === t.key ? "border-stone-900 font-medium" : "border-transparent text-stone-600 hover:text-stone-900"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
