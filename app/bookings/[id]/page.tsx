import Link from "next/link";
import { notFound } from "next/navigation";
import { cancelBooking, contestOutcome, markOutcome, respondToRequest } from "@/app/actions";
import { BookingHeader } from "@/components/booking-header";
import { btn, EmptyState, input, label, Notice } from "@/components/ui";
import { bookingView, LATE_CANCEL_MS } from "@/lib/booking-view";
import { bookingById, canContest, canMarkOutcome, CONTEST_WINDOW_MS, expiresAt, now, reviewState } from "@/lib/derive";
import { dateTimeLabel, dayLabel, duration, money, relative, timeLabel } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function BookingPage({ params, searchParams }: PageProps<"/bookings/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const { data, viewer } = await getSession();
  const b = bookingById(data, id);
  if (!b) notFound();
  const v = bookingView(data, b, viewer);
  if (!v.role) {
    return <EmptyState title="This booking belongs to someone else" body="Switch to the student or photographer on this booking to see it." />;
  }
  const role = v.role;
  const first = (name: string) => name.split(" ")[0];
  const start = Date.parse(v.slot.start);
  const upcoming = start > now();
  const review = reviewState(data, b, role);
  const searchSameDay = `/search?date=${v.slot.start.slice(0, 10)}`;

  const shareText = [
    `Graduation photo session (Tassel)`,
    `${dayLabel(v.slot.start)}, ${timeLabel(v.slot.start)}, ${duration(v.slot.durationMinutes)}`,
    `Location: ${v.location.name}`,
    `Photographer: ${v.photographer.name}`,
    `Student: ${v.student.name}`,
  ].join("\n");

  return (
    <div className="mx-auto max-w-2xl">
      <BookingHeader b={b} v={v} active="details" />

      <div className="space-y-6">
        {sp.sent && b.status === "pending" && (
          <Notice tone="success">Request sent. The slot is held for you until {first(v.photographer.name)} replies or 24 hours pass.</Notice>
        )}

        {/* ---------- Status panel ---------- */}
        {b.status === "pending" && role === "student" && (
          <Notice tone="warn">
            Waiting for {first(v.photographer.name)} to reply. The request expires {relative(expiresAt(b))} if there is no answer.
          </Notice>
        )}

        {b.status === "pending" && role === "photographer" && (
          <form action={respondToRequest} className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              Reply {relative(expiresAt(b))}. After that the request expires, the slot reopens, and it counts against your reply rate.
            </p>
            <input type="hidden" name="bookingId" value={b.id} />
            <div>
              <label className={label} htmlFor="message">Message to {first(v.student.name)} (optional)</label>
              <textarea id="message" name="message" rows={2} maxLength={280} className={input} />
            </div>
            <div className="flex gap-2">
              <button name="decision" value="accepted" className={btn.primary}>Accept</button>
              <button name="decision" value="declined" className={btn.secondary}>Decline</button>
            </div>
          </form>
        )}

        {b.status === "accepted" && upcoming && (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h2 className="font-semibold text-emerald-900">Booking confirmed</h2>
            <dl className="mt-3 grid grid-cols-[8rem_1fr] gap-y-1 text-sm">
              <dt className="text-stone-600">When</dt>
              <dd>{dayLabel(v.slot.start)}, {timeLabel(v.slot.start)} ({duration(v.slot.durationMinutes)})</dd>
              <dt className="text-stone-600">Where</dt>
              <dd>{v.location.name}, {v.location.area}</dd>
              <dt className="text-stone-600">Price</dt>
              <dd>{money(v.price)}, settled directly between you</dd>
              <dt className="text-stone-600">{role === "student" ? "Photographer" : "Student"}</dt>
              <dd>{v.other.name}</dd>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled className={btn.secondary} title="Calendar export is part of V1">Add to calendar (.ics, V1)</button>
            </div>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-stone-700">Share details with family or a friend</summary>
              <textarea readOnly rows={5} className={`${input} mt-2 font-mono text-xs`} defaultValue={shareText} />
            </details>
          </section>
        )}

        {canMarkOutcome(data, b) && (
          <form action={markOutcome} className="space-y-3 rounded-lg border border-stone-200 bg-white p-4">
            <p className="text-sm">
              The session time has passed. Mark what happened. {first(v.other.name)} can contest your mark within 24 hours.
            </p>
            <input type="hidden" name="bookingId" value={b.id} />
            <div className="flex gap-2">
              <button name="outcome" value="completed" className={btn.primary}>Session completed</button>
              <button name="outcome" value="no_show" className={btn.danger}>
                {role === "student" ? "Photographer didn't show" : "Student didn't show"}
              </button>
            </div>
          </form>
        )}

        {b.status === "declined" && (
          <EmptyState
            title={`${first(v.photographer.name)} declined this request`}
            body={b.responseMessage ? `“${b.responseMessage}”` : "No message was included."}
            action={role === "student" ? { href: searchSameDay, label: `Find someone else on ${dayLabel(v.slot.start)}` } : undefined}
          />
        )}

        {b.status === "expired" && (
          <EmptyState
            title="This request expired"
            body={`${first(v.photographer.name)} didn't reply within 24 hours of ${dateTimeLabel(b.createdAt)}, so the slot was released.`}
            action={role === "student" ? { href: searchSameDay, label: `Find someone else on ${dayLabel(v.slot.start)}` } : undefined}
          />
        )}

        {b.status === "cancelled" && b.cancellation && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
            <p className="font-semibold text-red-900">
              Cancelled by {b.cancellation.by === role ? "you" : b.cancellation.by === "student" ? v.student.name : v.photographer.name}
            </p>
            <p className="mt-1 text-red-900">“{b.cancellation.reason}”</p>
            <p className="mt-2 text-red-800">
              {dateTimeLabel(b.cancellation.at)}
              {start - Date.parse(b.cancellation.at) < LATE_CANCEL_MS && " · within 48 hours of the session"}
            </p>
            {role === "student" && (
              <Link href={searchSameDay} className={`${btn.secondary} mt-3`}>Find someone else on {dayLabel(v.slot.start)}</Link>
            )}
          </div>
        )}

        {(b.status === "completed" || b.status === "no_show") && b.completionMark && (
          <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm">
            <p>
              Marked <strong>{b.status === "completed" ? "completed" : "no-show"}</strong> by{" "}
              {b.completionMark.by === role ? "you" : first(b.completionMark.by === "student" ? v.student.name : v.photographer.name)} on{" "}
              {dateTimeLabel(b.completionMark.at)}.
            </p>
            {b.completionMark.contestedAt ? (
              <div className="mt-3">
                <Notice tone="warn">
                  Contested by {b.completionMark.by === "student" ? v.photographer.name : v.student.name} on{" "}
                  {dateTimeLabel(b.completionMark.contestedAt)}. How contested sessions are resolved is not decided yet (D6), so this
                  booking counts toward neither completed sessions nor no-shows in this prototype.
                </Notice>
              </div>
            ) : canContest(b, role) ? (
              <form action={contestOutcome} className="mt-3 flex flex-wrap items-center gap-3">
                <input type="hidden" name="bookingId" value={b.id} />
                <button className={btn.danger}>Contest this</button>
                <span className="text-stone-600">
                  Open until {dateTimeLabel(Date.parse(b.completionMark.at) + CONTEST_WINDOW_MS)}
                </span>
              </form>
            ) : (
              <p className="mt-1 text-stone-500">The contest window has closed. The mark stands.</p>
            )}
          </div>
        )}

        {review.kind === "eligible" && (
          <Notice tone="info">
            Review {first(v.other.name)} before {dateTimeLabel(review.closes)}.{" "}
            <Link href={`/bookings/${b.id}/review`} className="font-medium underline">Write a review</Link>
          </Notice>
        )}

        {/* ---------- Request details ---------- */}
        <section className="rounded-lg border border-stone-200 bg-white p-4 text-sm">
          <h2 className="mb-2 font-semibold">Request</h2>
          <dl className="grid grid-cols-[8rem_1fr] gap-y-1">
            <dt className="text-stone-600">Sent</dt>
            <dd>{dateTimeLabel(b.createdAt)}</dd>
            {b.respondedAt && (
              <>
                <dt className="text-stone-600">Answered</dt>
                <dd>{dateTimeLabel(b.respondedAt)}</dd>
              </>
            )}
            <dt className="text-stone-600">Notes</dt>
            <dd>{b.notes ?? <span className="text-stone-400">None</span>}</dd>
          </dl>
        </section>

        {(b.status === "pending" || (b.status === "accepted" && upcoming)) && (
          <details className="rounded-lg border border-stone-200 bg-white p-4 text-sm">
            <summary className="cursor-pointer font-medium text-red-700">
              {b.status === "pending" ? "Withdraw request" : "Cancel booking"}
            </summary>
            <form action={cancelBooking} className="mt-3 space-y-3">
              <input type="hidden" name="bookingId" value={b.id} />
              {start - now() < LATE_CANCEL_MS && (
                <Notice tone="warn">The session is less than 48 hours away. This will be recorded as a late cancellation.</Notice>
              )}
              <div>
                <label className={label} htmlFor="reason">Reason (shared with {first(v.other.name)})</label>
                <input id="reason" name="reason" required maxLength={200} className={input} />
              </div>
              <button className={btn.danger}>{b.status === "pending" ? "Withdraw" : "Cancel booking"}</button>
            </form>
          </details>
        )}
      </div>
    </div>
  );
}
