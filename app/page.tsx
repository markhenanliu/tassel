import Link from "next/link";
import { DemoImage } from "@/components/demo-image";
import { EmptyState, PageTitle } from "@/components/ui";
import { openSlots, profileUser } from "@/lib/derive";
import { money } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function FeedPage() {
  const { data, mode } = await getSession();
  const items = data.profiles
    .flatMap((profile) => profile.portfolio.map((image) => ({ image, profile })))
    .sort((a, b) => Date.parse(b.image.postedAt) - Date.parse(a.image.postedAt));

  if (items.length === 0) {
    return (
      <>
        <PageTitle>Recent work</PageTitle>
        <EmptyState
          title="No photographers have joined yet"
          body={
            mode === "student"
              ? "Photographers are setting up their profiles. Check back closer to commencement."
              : "You could be the first photographer students see here."
          }
        />
      </>
    );
  }

  const openCount = new Map(data.profiles.map((p) => [p.id, openSlots(data, p.id).length]));

  return (
    <>
      <PageTitle sub="Newest portfolio work from LA student photographers.">Recent work</PageTitle>
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {items.map(({ image, profile }) => {
          const open = openCount.get(profile.id) ?? 0;
          return (
            <Link key={image.id} href={`/photographers/${profile.id}`} className="mb-4 block break-inside-avoid">
              <DemoImage image={image} />
              <div className="mt-2 flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium text-stone-900">{profileUser(data, profile).name}</span>
                <span className="text-stone-600">{money(profile.hourlyRate)}/hr</span>
              </div>
              <p className={`text-xs ${open ? "text-emerald-700" : "text-stone-500"}`}>
                {open ? `${open} open slots` : "Fully booked"}
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
