import Link from "next/link";
import { personas } from "@/fixtures/personas";
import { resetDemo, switchMode } from "@/app/actions";
import { getSession } from "@/lib/session";
import { PersonaSwitcher } from "./persona-switcher";

export async function Header() {
  const { persona, viewer, mode, dualRole, shortlist, data, viewerProfile, actionCount } = await getSession();
  const pendingForMe = viewerProfile
    ? data.bookings.filter((b) => b.photographerProfileId === viewerProfile.id && b.status === "pending").length
    : 0;

  const links =
    mode === "student"
      ? [
          { href: "/", label: "Feed" },
          { href: "/search", label: "Search" },
          { href: "/compare", label: `Compare${shortlist.length ? ` (${shortlist.length})` : ""}` },
          { href: "/bookings", label: "My bookings" },
        ]
      : [
          { href: "/inbox", label: `Requests${pendingForMe ? ` (${pendingForMe})` : ""}` },
          { href: "/availability", label: "Availability" },
          ...(viewerProfile ? [{ href: `/photographers/${viewerProfile.id}`, label: "My profile" }] : []),
          { href: "/", label: "Feed" },
        ];

  return (
    <header>
      <div className="bg-stone-900 text-stone-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-xs">
          <span className="font-medium text-amber-300">Demo data. Nothing is saved or sent.</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="hidden text-stone-400 sm:inline">Viewing as</span>
            <PersonaSwitcher current={persona.id} options={personas.map((p) => ({ id: p.id, label: p.label }))} />
            {actionCount > 0 && (
              <form action={resetDemo}>
                <button className="rounded border border-stone-600 px-2 py-1 hover:bg-stone-800">Reset ({actionCount})</button>
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/" className="text-lg font-semibold tracking-tight text-stone-900">
            Tassel
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm text-stone-700">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-stone-950">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {dualRole && (
              <form action={switchMode}>
                <button className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium hover:bg-stone-100">
                  Switch to {mode === "student" ? "photographer" : "student"} mode
                </button>
              </form>
            )}
            {viewer && (
              <span className="text-stone-600">
                {viewer.name} · <span className="capitalize">{mode}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
