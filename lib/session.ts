import "server-only";
import { cookies } from "next/headers";
import { getPersona } from "@/fixtures/personas";
import { buildWorld } from "@/fixtures/worlds";
import type { Role } from "@/fixtures/types";
import { applyActions, decodeActions } from "./demo-actions";

export const COOKIE = {
  persona: "tassel_persona",
  mode: "tassel_mode",
  shortlist: "tassel_shortlist",
  actions: "tassel_actions",
} as const;

export async function getSession() {
  const store = await cookies();
  const persona = getPersona(store.get(COOKIE.persona)?.value);
  const actions = decodeActions(store.get(COOKIE.actions)?.value);
  const data = applyActions(buildWorld(persona.world), actions);
  const viewer = data.users.find((u) => u.id === persona.viewerUserId) ?? null;

  // D1: a user holding both roles can switch; everyone else stays in the persona's mode.
  const dualRole = !!viewer?.student && !!viewer?.photographerProfileId;
  const savedMode = store.get(COOKIE.mode)?.value as Role | undefined;
  const mode: Role = dualRole && savedMode ? savedMode : persona.mode;

  const rawShortlist = store.get(COOKIE.shortlist)?.value;
  const shortlist = (rawShortlist !== undefined ? rawShortlist.split(",").filter(Boolean) : persona.shortlist ?? []).filter(
    (id) => data.profiles.some((p) => p.id === id),
  );

  const viewerProfile = viewer?.photographerProfileId
    ? data.profiles.find((p) => p.id === viewer.photographerProfileId) ?? null
    : null;

  return { persona, data, viewer, viewerProfile, mode, dualRole, shortlist, actionCount: actions.length };
}

export type Session = Awaited<ReturnType<typeof getSession>>;
