import type { Cents } from "@/fixtures/types";
import { now } from "./derive";

const TZ = "America/Los_Angeles";

export const money = (c: Cents) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(c / 100);

export const dayLabel = (iso: string | number) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" }).format(new Date(iso));

export const timeLabel = (iso: string | number) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(new Date(iso));

export const dateTimeLabel = (iso: string | number) => `${dayLabel(iso)}, ${timeLabel(iso)}`;

export const duration = (min: number) => (min % 60 === 0 ? `${min / 60} hr` : min > 60 ? `${Math.floor(min / 60)} hr ${min % 60} min` : `${min} min`);

// "in 14 hours", "3 days ago", relative to the demo clock
export function relative(ms: number): string {
  const diff = ms - now();
  const abs = Math.abs(diff);
  const h = Math.round(abs / 3600000);
  const text = h < 1 ? `${Math.max(1, Math.round(abs / 60000))} min` : h < 48 ? `${h} hr` : `${Math.round(h / 24)} days`;
  return diff >= 0 ? `in ${text}` : `${text} ago`;
}

export const percent = (x: number | null) => (x === null ? "No data" : `${Math.round(x * 100)}%`);
export const stars = (x: number | null) => (x === null ? "No reviews" : x.toFixed(1));
