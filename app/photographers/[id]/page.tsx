import Link from "next/link";
import { notFound } from "next/navigation";
import { dayRange } from "@/fixtures/clock";
import { DemoImage } from "@/components/demo-image";
import { ShortlistButton } from "@/components/shortlist-button";
import { EmptyState, Notice } from "@/components/ui";
import { futureSlots, holdingBooking, locationById, openSlots, profileById, profileStats, profileUser, slotPrice, userById } from "@/lib/derive";
import { dayLabel, duration, money, percent, stars, timeLabel } from "@/lib/format";
import { getSession } from "@/lib/session";

const DAYS = dayRange("06-05", "06-20").map((md) => `2027-${md}`);
const noon = (d: string) => `${d}T12:00:00-07:00`;

export default async function ProfilePage({ params, searchParams }: PageProps<"/photographers/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const { data, viewer, mode, shortlist } = await getSession();
  const profile = profileById(data, id);
  if (!profile) notFound();

  const person = profileUser(data, profile);
  const stats = profileStats(data, profile.id);
  const isSelf = viewer?.photographerProfileId === profile.id;
  const upcoming = futureSlots(data, profile.id);
  const firstOpen = openSlots(data, profile.id)[0]?.start.slice(0, 10);
  const requested = typeof sp.date === "string" && DAYS.includes(sp.date) ? sp.date : undefined;
  const selected = requested ?? firstOpen ?? DAYS[0];
  const slotsOnDay = upcoming.filter((s) => s.start.startsWith(selected));
  const openOnDay = slotsOnDay.filter((s) => !holdingBooking(data, s.id));
  const nextOpenAfter = openSlots(data, profile.id).find((s) => s.start.slice(0, 10) > selected);

  return (
    <div className="space-y-10">
      {isSelf && <Notice>This is your public profile, as students see it.</Notice>}

      <section className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{person.name}</h1>
          <p className="text-sm text-stone-600">
            {person.student ? `${person.student.program}, class of ${person.student.graduationYear}` : "Independent photographer"}
          </p>
          <p className="mt-3 max-w-2xl text-stone-800">{profile.bio}</p>
        </div>
        <div className="shrink-0 rounded-lg border border-stone-200 bg-white p-4 text-sm md:w-72">
          <p className="text-xl font-semibold">{money(profile.hourlyRate)}<span className="text-sm font-normal text-stone-600"> / hour</span></p>
          <dl className="mt-3 grid grid-cols-2 gap-y-2">
            <dt className="text-stone-600">Rating</dt>
            <dd>{stats.rating !== null ? `★ ${stars(stats.rating)} (${stats.reviewCount})` : "No reviews yet"}</dd>
            <dt className="text-stone-600">Completed</dt>
            <dd>{stats.completedSessions} sessions</dd>
            <dt className="text-stone-600">Replies in 24h</dt>
            <dd>{stats.requestsReceived ? `${percent(stats.responseRate)} of ${stats.requestsReceived}` : "No requests yet"}</dd>
          </dl>
          {mode === "student" && !isSelf && (
            <div className="mt-4">
              <ShortlistButton profileId={profile.id} active={shortlist.includes(profile.id)} />
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Portfolio</h2>
        {profile.portfolio.length < 4 && (
          <p className="mb-3 text-sm text-stone-600">{profile.portfolio.length} images so far.</p>
        )}
        <div className="columns-2 gap-3 md:columns-3">
          {profile.portfolio.map((img) => (
            <DemoImage key={img.id} image={img} className="mb-3 break-inside-avoid" />
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">Locations</h2>
          <ul className="text-sm">
            {profile.locationIds.map((l) => (
              <li key={l}>{locationById(data, l)?.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">Style</h2>
          <p className="text-sm">{profile.styleTags.join(", ")}</p>
        </div>
        {profile.equipmentNotes && (
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">Equipment and delivery</h2>
            <p className="text-sm">{profile.equipmentNotes}</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Availability</h2>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {DAYS.map((d) => {
            const offered = upcoming.filter((s) => s.start.startsWith(d)).length;
            const open = openSlots(data, profile.id, d).length;
            const active = d === selected;
            return (
              <Link
                key={d}
                href={`/photographers/${profile.id}?date=${d}`}
                scroll={false}
                className={`min-w-[4.5rem] shrink-0 rounded-md border px-2 py-2 text-center text-xs ${
                  active ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white hover:border-stone-400"
                }`}
              >
                <span className="block font-medium">{dayLabel(noon(d))}</span>
                <span className={active ? "text-stone-300" : open ? "text-emerald-700" : "text-stone-400"}>
                  {offered === 0 ? "—" : open ? `${open} open` : "Full"}
                </span>
              </Link>
            );
          })}
        </div>

        {slotsOnDay.length === 0 ? (
          <EmptyState
            title={`No sessions offered on ${dayLabel(noon(selected))}`}
            body={nextOpenAfter ? `Next opening: ${dayLabel(nextOpenAfter.start)} at ${timeLabel(nextOpenAfter.start)}.` : "No later openings are listed."}
          />
        ) : (
          <>
            {openOnDay.length === 0 && (
              <div className="mb-3">
                <Notice tone="warn">
                  No availability on {dayLabel(noon(selected))}. Every slot is booked or held by a pending request.
                  {nextOpenAfter && ` Next opening: ${dayLabel(nextOpenAfter.start)} at ${timeLabel(nextOpenAfter.start)}.`}
                </Notice>
              </div>
            )}
            <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
              {slotsOnDay.map((s) => {
                const hold = holdingBooking(data, s.id);
                return (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <span>
                      <span className="font-medium">{timeLabel(s.start)}</span>
                      <span className="text-stone-600"> · {duration(s.durationMinutes)} · {money(slotPrice(profile, s))}</span>
                    </span>
                    {hold ? (
                      <span className="text-stone-500">
                        {hold.status === "pending" ? "Requested, awaiting reply" : "Booked"}
                        {isSelf && ` · ${userById(data, hold.studentUserId)?.name}`}
                      </span>
                    ) : isSelf ? (
                      <span className="text-emerald-700">Open</span>
                    ) : (
                      <Link href={`/book/${s.id}`} className="rounded-md bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-700">
                        Request
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Reviews</h2>
        {stats.reviewCount === 0 ? (
          <EmptyState
            title="No reviews yet"
            body={
              isSelf
                ? "Reviews appear after your first completed session, once both sides submit or seven days pass."
                : `${person.name.split(" ")[0]} has not completed a reviewed session on Tassel yet. Portfolio and reply rate are the signals available.`
            }
          />
        ) : (
          <>
            <div className="mb-4 grid grid-cols-3 gap-3 text-sm sm:max-w-md">
              {([
                ["Photo quality", stats.photoQuality],
                ["Communication", stats.communication],
                ["Punctuality", stats.punctuality],
              ] as const).map(([k, v]) => (
                <div key={k} className="rounded-md border border-stone-200 bg-white p-3">
                  <p className="text-stone-600">{k}</p>
                  <p className="text-lg font-semibold">{stars(v)}</p>
                </div>
              ))}
            </div>
            <ul className="space-y-3">
              {stats.reviews.map((r) => (
                <li key={r.id} className="rounded-lg border border-stone-200 bg-white p-4 text-sm">
                  <p className="flex justify-between text-stone-600">
                    <span>{userById(data, r.reviewerUserId)?.name}</span>
                    <span>{dayLabel(r.submittedAt)}</span>
                  </p>
                  <p className="mt-1 text-stone-500">
                    {Object.entries(r.ratings).map(([k, v]) => `${k.replace(/([A-Z])/g, " $1").toLowerCase()} ${v}`).join(" · ")}
                  </p>
                  {r.body && <p className="mt-2 text-stone-800">{r.body}</p>}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
