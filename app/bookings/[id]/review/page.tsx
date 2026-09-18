import { notFound } from "next/navigation";
import { submitReview } from "@/app/actions";
import { BookingHeader } from "@/components/booking-header";
import { btn, EmptyState, input, label, Notice } from "@/components/ui";
import type { Review } from "@/fixtures/types";
import { bookingView } from "@/lib/booking-view";
import { bookingById, reviewState } from "@/lib/derive";
import { dateTimeLabel } from "@/lib/format";
import { getSession } from "@/lib/session";

const criteria = {
  student: [
    ["photoQuality", "Photo quality"],
    ["communication", "Communication"],
    ["punctuality", "Punctuality"],
  ],
  photographer: [
    ["communication", "Communication"],
    ["punctuality", "Punctuality"],
  ],
} as const;

function ReviewCard({ title, r }: { title: string; r: Review }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-stone-600">
        {Object.entries(r.ratings).map(([k, v]) => `${k.replace(/([A-Z])/g, " $1").toLowerCase()} ${v}/5`).join(" · ")}
      </p>
      {r.body && <p className="mt-2">{r.body}</p>}
    </div>
  );
}

export default async function ReviewPage({ params, searchParams }: PageProps<"/bookings/[id]/review">) {
  const { id } = await params;
  const sp = await searchParams;
  const { data, viewer } = await getSession();
  const b = bookingById(data, id);
  if (!b) notFound();
  const v = bookingView(data, b, viewer);
  if (!v.role) {
    return <EmptyState title="This booking belongs to someone else" body="Switch to the student or photographer on this booking." />;
  }
  const role = v.role;
  const state = reviewState(data, b, role);
  const other = v.other.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-2xl">
      <BookingHeader b={b} v={v} active="review" />

      {state.kind === "not-eligible" && <EmptyState title="Not open for review" body={state.reason} />}

      {state.kind === "closed" && (
        <EmptyState title="The review window has closed" body="Reviews can be submitted for seven days after a session." />
      )}

      {state.kind === "submitted-waiting" && (
        <div className="space-y-4">
          <Notice tone="success">
            Your review is submitted. It publishes when {other} submits theirs, or on {dateTimeLabel(state.closes)}, whichever comes
            first. Neither side can see the other&apos;s review before then.
          </Notice>
          <ReviewCard title="Your review" r={state.review} />
        </div>
      )}

      {state.kind === "published" && (
        <div className="space-y-4">
          <Notice>Reviews for this session are published.</Notice>
          {state.mine && <ReviewCard title="Your review" r={state.mine} />}
          {state.theirs && <ReviewCard title={`${other}'s review of you`} r={state.theirs} />}
        </div>
      )}

      {state.kind === "eligible" && (
        <form action={submitReview} className="space-y-5">
          <input type="hidden" name="bookingId" value={b.id} />
          <p className="text-sm text-stone-600">
            Open until {dateTimeLabel(state.closes)}. {other} won&apos;t see your review until they submit theirs or the window closes.
          </p>
          {sp.missing && <Notice tone="warn">Rate every category before submitting.</Notice>}
          {criteria[role].map(([key, text]) => (
            <fieldset key={key}>
              <legend className={label}>{text}</legend>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} className="cursor-pointer">
                    <input type="radio" name={key} value={n} required className="peer sr-only" />
                    <span className="flex h-10 w-10 items-center justify-center rounded-md border border-stone-300 bg-white text-sm peer-checked:border-stone-900 peer-checked:bg-stone-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-stone-400">
                      {n}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div>
            <label className={label} htmlFor="body">Written review (optional)</label>
            <textarea id="body" name="body" rows={4} maxLength={280} className={input} />
          </div>
          <button className={btn.primary}>Submit review</button>
        </form>
      )}
    </div>
  );
}
