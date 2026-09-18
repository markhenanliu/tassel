import Link from "next/link";
import { dayRange } from "@/fixtures/clock";
import { styleTags } from "@/fixtures/standard";
import { DemoImage } from "@/components/demo-image";
import { ShortlistButton } from "@/components/shortlist-button";
import { btn, EmptyState, input, label, PageTitle } from "@/components/ui";
import { openSlots, profileStats, profileUser } from "@/lib/derive";
import { dayLabel, money, stars, timeLabel } from "@/lib/format";
import { getSession } from "@/lib/session";

const DAYS = dayRange("06-05", "06-20").map((md) => `2027-${md}`);
const noon = (d: string) => `${d}T12:00:00-07:00`;

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const one = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : "");
  const date = DAYS.includes(one("date")) ? one("date") : "";
  const maxRate = Number(one("maxRate")) || 0;
  const locationId = one("location");
  const style = one("style");

  const { data, shortlist, mode } = await getSession();

  const matching = data.profiles.filter(
    (p) =>
      (!maxRate || p.hourlyRate <= maxRate * 100) &&
      (!locationId || p.locationIds.includes(locationId)) &&
      (!style || p.styleTags.includes(style)),
  );
  const available = date ? matching.filter((p) => openSlots(data, p.id, date).length > 0) : matching;

  // No-availability state: nearest dates on which a matching photographer has an opening.
  const nearby =
    date && available.length === 0 && matching.length > 0
      ? DAYS.filter((d) => d !== date && matching.some((p) => openSlots(data, p.id, d).length > 0))
          .sort((a, b) => Math.abs(Date.parse(a) - Date.parse(date)) - Math.abs(Date.parse(b) - Date.parse(date)))
          .slice(0, 4)
          .sort()
      : [];

  const withDate = (d: string) => {
    const q = new URLSearchParams({ date: d, maxRate: maxRate ? String(maxRate) : "", location: locationId, style });
    for (const [key, val] of [...q.entries()]) if (!val) q.delete(key);
    return `/search?${q}`;
  };

  return (
    <>
      <PageTitle sub="Filter by the date you need, what you want to spend, where, and the style you like.">
        Find a photographer
      </PageTitle>

      <form className="mb-8 grid grid-cols-2 gap-3 rounded-lg border border-stone-200 bg-white p-4 md:grid-cols-5">
        <div>
          <label className={label} htmlFor="date">Date</label>
          <select id="date" name="date" defaultValue={date} className={input}>
            <option value="">Any date</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>{dayLabel(noon(d))}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="maxRate">Max rate per hour</label>
          <select id="maxRate" name="maxRate" defaultValue={maxRate ? String(maxRate) : ""} className={input}>
            <option value="">Any</option>
            {[75, 100, 150, 200, 250].map((r) => (
              <option key={r} value={r}>${r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="location">Location</label>
          <select id="location" name="location" defaultValue={locationId} className={input}>
            <option value="">Anywhere</option>
            {data.locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="style">Style</label>
          <select id="style" name="style" defaultValue={style} className={input}>
            <option value="">Any style</option>
            {styleTags.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 flex items-end gap-2 md:col-span-1">
          <button className={`${btn.primary} flex-1`}>Search</button>
          <Link href="/search" className={btn.secondary}>Clear</Link>
        </div>
      </form>

      {data.profiles.length === 0 ? (
        <EmptyState title="No photographers yet" body="Nobody has created a photographer profile, so there is nothing to search." />
      ) : matching.length === 0 ? (
        <EmptyState
          title="No photographers match these filters"
          body="Try a higher rate limit, a different location, or any style."
          action={{ href: "/search", label: "Clear filters" }}
        />
      ) : available.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title={`No one is available on ${dayLabel(noon(date))}`}
            body={`${matching.length} photographer${matching.length === 1 ? " matches" : "s match"} your other filters, but every slot that day is booked or held by a pending request.`}
          />
          {nearby.length > 0 && (
            <div className="text-sm">
              <p className="mb-2 font-medium text-stone-800">Openings on nearby dates</p>
              <div className="flex flex-wrap gap-2">
                {nearby.map((d) => (
                  <Link key={d} href={withDate(d)} className={btn.secondary}>
                    {dayLabel(noon(d))}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-stone-600">
            {available.length} photographer{available.length === 1 ? "" : "s"}
            {date ? ` with openings on ${dayLabel(noon(date))}` : ""}
          </p>
          <ul className="space-y-4">
            {available.map((p) => {
              const stats = profileStats(data, p.id);
              const slotsThatDay = date ? openSlots(data, p.id, date) : [];
              const totalOpen = openSlots(data, p.id).length;
              const href = `/photographers/${p.id}${date ? `?date=${date}` : ""}`;
              return (
                <li key={p.id} className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-4 sm:flex-row">
                  <Link href={href} className="grid w-full shrink-0 grid-cols-3 gap-1 sm:w-64">
                    {p.portfolio.slice(0, 3).map((img) => (
                      <DemoImage key={img.id} image={{ ...img, aspect: "square" }} showCaption={false} />
                    ))}
                  </Link>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link href={href} className="font-semibold hover:underline">
                        {profileUser(data, p).name}
                      </Link>
                      <span className="text-sm text-stone-700">{money(p.hourlyRate)}/hr</span>
                    </div>
                    <p className="mt-1 text-sm text-stone-600">
                      {stats.rating !== null ? `★ ${stars(stats.rating)} (${stats.reviewCount})` : "No reviews yet"} ·{" "}
                      {stats.completedSessions} sessions · {p.styleTags.join(", ")}
                    </p>
                    <p className="mt-2 text-sm">
                      {date ? (
                        <span className="text-emerald-800">Open: {slotsThatDay.map((s) => timeLabel(s.start)).join(", ")}</span>
                      ) : (
                        <span className="text-stone-600">{totalOpen} open slots in the next two weeks</span>
                      )}
                    </p>
                    {mode === "student" && (
                      <div className="mt-3">
                        <ShortlistButton profileId={p.id} active={shortlist.includes(p.id)} />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
