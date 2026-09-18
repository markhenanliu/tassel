import Link from "next/link";
import type { BookingStatus } from "@/fixtures/types";

export const btn = {
  primary: "inline-flex items-center justify-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-40",
  secondary: "inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100",
  danger: "inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50",
};

export const input = "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none";
export const label = "mb-1 block text-sm font-medium text-stone-700";

const statusStyle: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  accepted: "bg-emerald-100 text-emerald-900",
  declined: "bg-stone-200 text-stone-700",
  expired: "bg-stone-200 text-stone-700",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-sky-100 text-sky-900",
  no_show: "bg-red-100 text-red-800",
};
const statusText: Record<BookingStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No-show",
};

export function StatusBadge({ status, contested }: { status: BookingStatus; contested?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[status]}`}>{statusText[status]}</span>
      {contested && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-900">Contested</span>}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: { href: string; label: string } }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
      <p className="font-medium text-stone-900">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-stone-600">{body}</p>
      {action && (
        <Link href={action.href} className={`${btn.secondary} mt-4`}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "success"; children: React.ReactNode }) {
  const styles = {
    info: "border-stone-200 bg-stone-50 text-stone-800",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };
  return <div className={`rounded-md border px-4 py-3 text-sm ${styles[tone]}`}>{children}</div>;
}

export function PageTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{children}</h1>
      {sub && <p className="mt-1 text-sm text-stone-600">{sub}</p>}
    </div>
  );
}

export function RoleGate({ need, children }: { need: string; children?: React.ReactNode }) {
  return (
    <EmptyState
      title={`This screen is for ${need}s`}
      body={children ? String(children) : `Switch to a ${need} persona or mode using the controls at the top of the page.`}
    />
  );
}
