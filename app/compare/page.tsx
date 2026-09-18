import Link from "next/link";
import { COMMENCEMENT_DAYS } from "@/fixtures/clock";
import { DemoImage } from "@/components/demo-image";
import { ShortlistButton } from "@/components/shortlist-button";
import { EmptyState, Notice, PageTitle, RoleGate } from "@/components/ui";
import { locationById, openSlots, profileById, profileStats, profileUser } from "@/lib/derive";
import { dayLabel, money, percent, stars, timeLabel } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function ComparePage() {
  const { data, shortlist, mode } = await getSession();
  if (mode !== "student") return <RoleGate need="student" />;

  const profiles = shortlist.map((id) => profileById(data, id)!).filter(Boolean);

  if (profiles.length === 0) {
    return (
      <>
        <PageTitle>Compare photographers</PageTitle>
        <EmptyState
          title="Your comparison list is empty"
          body="Use “Add to compare” on search results or a profile. You can compare up to four photographers."
          action={{ href: "/search", label: "Search photographers" }}
        />
      </>
    );
  }

  const rows: { label: string; cell: (id: string) => React.ReactNode }[] = [
    { label: "Hourly rate", cell: (id) => money(profileById(data, id)!.hourlyRate) },
    {
      label: "Rating",
      cell: (id) => {
        const s = profileStats(data, id);
        return s.rating !== null ? `★ ${stars(s.rating)} (${s.reviewCount})` : "No reviews";
      },
    },
    { label: "Completed sessions", cell: (id) => profileStats(data, id).completedSessions },
    { label: "Replies in 24h", cell: (id) => percent(profileStats(data, id).responseRate) },
    ...COMMENCEMENT_DAYS.map((d) => ({
      label: `Open ${dayLabel(`${d}T12:00:00-07:00`)}`,
      cell: (id: string) => {
        const open = openSlots(data, id, d);
        return open.length ? open.map((s) => timeLabel(s.start)).join(", ") : <span className="text-stone-400">None</span>;
      },
    })),
    {
      label: "Next opening",
      cell: (id) => {
        const s = openSlots(data, id)[0];
        return s ? `${dayLabel(s.start)}, ${timeLabel(s.start)}` : <span className="text-stone-400">None listed</span>;
      },
    },
    { label: "Locations", cell: (id) => profileById(data, id)!.locationIds.map((l) => locationById(data, l)?.name).join(", ") },
    { label: "Style", cell: (id) => profileById(data, id)!.styleTags.join(", ") },
  ];

  return (
    <>
      <PageTitle sub="Commencement weekend openings shown first, since those dates fill earliest.">Compare photographers</PageTitle>
      {profiles.length === 1 && (
        <div className="mb-4">
          <Notice>Add at least one more photographer to compare side by side.</Notice>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 align-top">
              <th className="w-40 p-3" />
              {profiles.map((p) => (
                <th key={p.id} className="p-3 font-normal">
                  <DemoImage image={{ ...p.portfolio[0], aspect: "landscape" }} showCaption={false} />
                  <Link href={`/photographers/${p.id}`} className="mt-2 block font-semibold hover:underline">
                    {profileUser(data, p).name}
                  </Link>
                  <div className="mt-2">
                    <ShortlistButton profileId={p.id} active />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-stone-100 last:border-0">
                <th className="p-3 font-medium text-stone-600">{r.label}</th>
                {profiles.map((p) => (
                  <td key={p.id} className="p-3">{r.cell(p.id)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
