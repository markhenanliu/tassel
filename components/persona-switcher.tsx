"use client";

import { switchPersona } from "@/app/actions";

export function PersonaSwitcher({ current, options }: { current: string; options: { id: string; label: string }[] }) {
  return (
    <form action={switchPersona}>
      <label className="sr-only" htmlFor="persona">Persona</label>
      <select
        id="persona"
        name="persona"
        defaultValue={current}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="max-w-[16rem] rounded-md border border-stone-600 bg-stone-800 px-2 py-1 text-xs text-white"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </form>
  );
}
