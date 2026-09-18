// A6: fixed demo clock. Every fixture time is written relative to this.
// College commencement is listed as June 11-13, 2027 (tentative).
export const DEMO_NOW = "2027-06-04T10:00:00-07:00";
export const COMMENCEMENT_DAYS = ["2027-06-11", "2027-06-12", "2027-06-13"];

// at("06-12", "16:00") -> "2027-06-12T16:00:00-07:00"
export function at(monthDay: string, time: string): string {
  return `2027-${monthDay}T${time}:00-07:00`;
}

export function dayRange(from: string, to: string): string[] {
  const out: string[] = [];
  const d = new Date(`2027-${from}T12:00:00-07:00`);
  const end = new Date(`2027-${to}T12:00:00-07:00`);
  while (d <= end) {
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    out.push(`${m}-${day}`);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}
