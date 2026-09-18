import { toggleShortlist } from "@/app/actions";

export function ShortlistButton({ profileId, active }: { profileId: string; active: boolean }) {
  return (
    <form action={toggleShortlist}>
      <input type="hidden" name="profileId" value={profileId} />
      <button
        className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
          active ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-800 hover:bg-stone-100"
        }`}
      >
        {active ? "In comparison" : "Add to compare"}
      </button>
    </form>
  );
}
