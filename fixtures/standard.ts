// Standard world: the marketplace one week before commencement.
// All people, work, and reviews here are synthetic.
import { at, dayRange } from "./clock";
import type {
  Booking,
  Dataset,
  ID,
  Location,
  Message,
  PhotographerProfile,
  PortfolioImage,
  Rating,
  Review,
  Slot,
  User,
} from "./types";

export const locations: Location[] = [
  { id: "loc-royce", name: "Royce Hall quad", area: "UCLA campus" },
  { id: "loc-janss", name: "Janss Steps", area: "UCLA campus" },
  { id: "loc-powell", name: "Powell Library", area: "UCLA campus" },
  { id: "loc-inverted", name: "Inverted Fountain", area: "UCLA campus" },
  { id: "loc-murphy", name: "Murphy Sculpture Garden", area: "UCLA campus" },
  { id: "loc-westwood", name: "Westwood Village", area: "Westwood" },
  { id: "loc-palisades", name: "Palisades Park", area: "Santa Monica" },
  { id: "loc-griffith", name: "Griffith Observatory lawn", area: "Griffith Park" },
];

export const styleTags = [
  "candid",
  "editorial",
  "film",
  "golden hour",
  "family groups",
  "flash",
  "black and white",
];

// ---------- Users ----------

const student = (graduationYear: number, program: string) => ({ graduationYear, program });

const people: User[] = [
  // Photographers
  { id: "u-lena", name: "Lena Ortiz", email: "lena@example.com", photographerProfileId: "p-lena" },
  { id: "u-jordan", name: "Jordan Kim", email: "jordan@ucla.edu", student: student(2029, "Film and Television"), photographerProfileId: "p-jordan" },
  { id: "u-sam", name: "Sam Rivera", email: "sam@ucla.edu", student: student(2027, "Design Media Arts"), photographerProfileId: "p-sam" },
  { id: "u-aiden", name: "Aiden Park", email: "aiden@example.com", photographerProfileId: "p-aiden" },
  { id: "u-noor", name: "Noor Haddad", email: "noor@ucla.edu", student: student(2028, "Art History"), photographerProfileId: "p-noor" },
  { id: "u-theo", name: "Theo Nguyen", email: "theo@ucla.edu", student: student(2028, "Computer Science"), photographerProfileId: "p-theo" },
  { id: "u-chloe", name: "Chloe Martin", email: "chloe@example.com", photographerProfileId: "p-chloe" },
  // Students with a persona
  { id: "u-maya", name: "Maya Chen", email: "maya@ucla.edu", student: student(2027, "Economics") },
  { id: "u-priya", name: "Priya Shah", email: "priya@ucla.edu", student: student(2027, "Psychobiology") },
  { id: "u-ethan", name: "Ethan Brooks", email: "ethan@ucla.edu", student: student(2027, "Mechanical Engineering") },
  // Other students who appear in photographers' inboxes
  { id: "u-grace", name: "Grace Liu", email: "grace@ucla.edu", student: student(2027, "Sociology") },
  { id: "u-omar", name: "Omar Farouk", email: "omar@ucla.edu", student: student(2027, "Political Science") },
  { id: "u-hana", name: "Hana Sato", email: "hana@ucla.edu", student: student(2027, "Linguistics") },
  { id: "u-leo", name: "Leo Martinez", email: "leo@ucla.edu", student: student(2027, "History") },
  { id: "u-kai", name: "Kai Johnson", email: "kai@ucla.edu", student: student(2027, "Statistics") },
  { id: "u-ava", name: "Ava Thompson", email: "ava@ucla.edu", student: student(2027, "English") },
];

// Filler students for past sessions and fully booked slots.
const fillerNames = [
  "Diego Alvarez", "Sofia Rossi", "Marcus Lee", "Isabel Cruz", "Nate Wilson",
  "Yuna Park", "Ben Carter", "Amara Okafor", "Luis Romero", "Hannah Weiss",
  "Ravi Patel", "Emma Novak", "Jamal Greene", "Lucy Tran", "Owen Walsh",
  "Mei Lin", "Carlos Vega", "Zoe Adams", "Sana Mir", "Tyler Reed",
];
export const fillerStudents: User[] = fillerNames.map((name, i) => ({
  id: `u-f${i + 1}`,
  name,
  email: `student${i + 1}@ucla.edu`,
  student: student(2027, "Undeclared"),
}));

// ---------- Profiles ----------

let seedCounter = 1;
function portfolio(profileKey: string, captions: string[], firstPosted: string): PortfolioImage[] {
  const aspects: PortfolioImage["aspect"][] = ["portrait", "landscape", "square", "portrait", "portrait", "landscape"];
  return captions.map((caption, i) => {
    const day = new Date(`2027-${firstPosted}T12:00:00-07:00`);
    day.setUTCDate(day.getUTCDate() + i * 3);
    const md = `${String(day.getUTCMonth() + 1).padStart(2, "0")}-${String(day.getUTCDate()).padStart(2, "0")}`;
    return {
      id: `img-${profileKey}-${i + 1}`,
      seed: seedCounter++,
      aspect: aspects[i % aspects.length],
      caption,
      postedAt: at(md, "12:00"),
    };
  });
}

const profiles: PhotographerProfile[] = [
  {
    id: "p-lena",
    userId: "u-lena",
    bio: "Portrait photographer in LA for six years. Most of my spring work is graduation sessions with families. I plan the route around light and crowds on commencement weekend.",
    hourlyRate: 22000,
    locationIds: ["loc-royce", "loc-janss", "loc-powell", "loc-murphy", "loc-palisades"],
    styleTags: ["candid", "golden hour", "family groups"],
    equipmentNotes: "Two bodies, 35mm and 85mm primes. Reflector and an assistant for groups over six.",
    portfolio: portfolio("lena", ["Royce Hall at 6pm", "Family on Janss Steps", "Cap toss, Class of 2026", "Powell reading room", "Grandparents and graduate", "Palisades Park at sunset"], "04-20"),
  },
  {
    id: "p-jordan",
    userId: "u-jordan",
    bio: "Second-year film student. I shoot portraits between classes and I'm building a graduation portfolio this year.",
    hourlyRate: 8000,
    locationIds: ["loc-royce", "loc-inverted", "loc-westwood"],
    styleTags: ["candid", "flash"],
    portfolio: portfolio("jordan", ["Flash portrait, Westwood", "Inverted Fountain", "Friends on Bruin Walk"], "05-20"),
  },
  {
    id: "p-sam",
    userId: "u-sam",
    bio: "Graduating in Design Media Arts this June, so I'm not shooting commencement weekend itself. Open the week before and the week after.",
    hourlyRate: 10000,
    locationIds: ["loc-murphy", "loc-powell", "loc-westwood"],
    styleTags: ["editorial", "black and white"],
    equipmentNotes: "Medium format digital. Sessions run a little slower.",
    portfolio: portfolio("sam", ["Sculpture garden, black and white", "Editorial portrait, Powell", "Westwood rooftop", "Studio-style outdoor"], "05-02"),
  },
  {
    id: "p-aiden",
    userId: "u-aiden",
    bio: "I shoot on 35mm and medium format film, with a digital backup. Scans delivered in two weeks.",
    hourlyRate: 16000,
    locationIds: ["loc-janss", "loc-royce", "loc-griffith"],
    styleTags: ["film", "candid", "golden hour"],
    equipmentNotes: "Film scans in two weeks; digital previews in two days.",
    portfolio: portfolio("aiden", ["Portra 400, Janss Steps", "Griffith lawn", "Royce arches on film", "Double exposure"], "04-28"),
  },
  {
    id: "p-noor",
    userId: "u-noor",
    bio: "I only shoot the last two hours of daylight. Short sessions, many locations close together.",
    hourlyRate: 14000,
    locationIds: ["loc-inverted", "loc-royce", "loc-murphy", "loc-palisades"],
    styleTags: ["golden hour", "candid"],
    portfolio: portfolio("noor", ["Backlit on Royce quad", "Inverted Fountain at dusk", "Palisades Park", "Sculpture garden silhouette", "Blue hour"], "05-05"),
  },
  {
    id: "p-theo",
    userId: "u-theo",
    bio: "Quick sessions for students who want a few good photos without a big production.",
    hourlyRate: 6000,
    locationIds: ["loc-royce", "loc-janss", "loc-inverted", "loc-powell"],
    styleTags: ["candid"],
    portfolio: portfolio("theo", ["Janss Steps, midday", "Diploma frame shot", "Friends at the fountain"], "05-12"),
  },
  {
    id: "p-chloe",
    userId: "u-chloe",
    bio: "Editorial portraits with lighting. Two-hour sessions, retouched selects.",
    hourlyRate: 30000,
    locationIds: ["loc-westwood", "loc-palisades", "loc-griffith"],
    styleTags: ["editorial", "flash", "black and white"],
    equipmentNotes: "Strobes and a stylist on request.",
    portfolio: portfolio("chloe", ["Lit portrait, Westwood", "Palisades editorial", "Griffith, strobe at dusk", "Black and white close-up", "Two graduates, editorial"], "04-24"),
  },
];

// ---------- Slots ----------

const slots: Slot[] = [];
function slotId(profileKey: string, md: string, time: string) {
  return `s-${profileKey}-${md.replace("-", "")}-${time.replace(":", "")}`;
}
function addSlots(profileKey: string, days: string[], times: [string, number][]) {
  for (const md of days) {
    for (const [time, durationMinutes] of times) {
      slots.push({ id: slotId(profileKey, md, time), photographerProfileId: `p-${profileKey}`, start: at(md, time), durationMinutes });
    }
  }
}

addSlots("lena", dayRange("06-05", "06-16"), [["09:00", 60], ["16:00", 90], ["18:30", 60]]);
addSlots("jordan", ["06-06", "06-08", "06-10", "06-11", "06-12", "06-13", "06-15"], [["10:00", 60], ["17:30", 60]]);
addSlots("sam", ["06-05", "06-06", "06-07", "06-08", "06-09", "06-15", "06-16", "06-17"], [["17:00", 60]]);
addSlots("aiden", ["06-05", "06-06", "06-08", "06-09", "06-11", "06-12", "06-13", "06-16"], [["08:30", 120], ["15:00", 60]]);
addSlots("noor", dayRange("06-05", "06-15"), [["18:00", 60], ["19:15", 45]]);
addSlots("theo", dayRange("06-05", "06-20"), [["11:00", 30], ["13:00", 30], ["14:00", 60]]);
addSlots("chloe", ["06-09", "06-10", "06-11", "06-12", "06-13"], [["10:00", 120], ["16:30", 120]]);

// ---------- Bookings, messages, reviews ----------

const bookings: Booking[] = [];
const messages: Message[] = [];
const reviews: Review[] = [];

let msgCounter = 1;
function msg(bookingId: ID, senderUserId: ID, sentAt: string, body: string) {
  messages.push({ id: `m-${msgCounter++}`, bookingId, senderUserId, sentAt, body });
}

// Past sessions: creates a slot, a completed booking, and optional reviews.
function pastSession(opts: {
  key: string;
  profileKey: string;
  studentUserId: ID;
  md: string;
  time: string;
  durationMinutes: number;
  locationId: ID;
  studentReview?: { photoQuality: Rating; communication: Rating; punctuality: Rating; body?: string };
  photographerReview?: { communication: Rating; punctuality: Rating; body?: string };
}) {
  const slot: Slot = {
    id: slotId(opts.profileKey, opts.md, opts.time),
    photographerProfileId: `p-${opts.profileKey}`,
    start: at(opts.md, opts.time),
    durationMinutes: opts.durationMinutes,
  };
  slots.push(slot);
  const id = `b-${opts.key}`;
  const end = new Date(Date.parse(slot.start) + opts.durationMinutes * 60000);
  const created = new Date(Date.parse(slot.start) - 10 * 86400000).toISOString();
  bookings.push({
    id,
    slotId: slot.id,
    studentUserId: opts.studentUserId,
    photographerProfileId: slot.photographerProfileId,
    locationId: opts.locationId,
    status: "completed",
    createdAt: created,
    respondedAt: new Date(Date.parse(created) + 3 * 3600000).toISOString(),
    completionMark: { by: "photographer", at: end.toISOString() },
  });
  const photographerUserId = `u-${opts.profileKey}`;
  const dayAfter = new Date(end.getTime() + 86400000).toISOString();
  if (opts.studentReview) {
    const { body, ...ratings } = opts.studentReview;
    reviews.push({ id: `r-${opts.key}-s`, bookingId: id, reviewerUserId: opts.studentUserId, reviewerRole: "student", ratings, body, submittedAt: dayAfter });
  }
  if (opts.photographerReview) {
    const { body, ...ratings } = opts.photographerReview;
    reviews.push({ id: `r-${opts.key}-p`, bookingId: id, reviewerUserId: photographerUserId, reviewerRole: "photographer", ratings, body, submittedAt: dayAfter });
  }
}

// Lena: established, reviewed
pastSession({ key: "lena-p1", profileKey: "lena", studentUserId: "u-f1", md: "05-08", time: "16:00", durationMinutes: 90, locationId: "loc-royce",
  studentReview: { photoQuality: 5, communication: 5, punctuality: 5, body: "She planned the route so we were never waiting on crowds. My grandmother is in half the photos and never looked tired." },
  photographerReview: { communication: 5, punctuality: 5 } });
pastSession({ key: "lena-p2", profileKey: "lena", studentUserId: "u-f2", md: "05-12", time: "18:30", durationMinutes: 60, locationId: "loc-janss",
  studentReview: { photoQuality: 5, communication: 4, punctuality: 5, body: "Photos were excellent. Took four days to hear back about the gallery link." },
  photographerReview: { communication: 4, punctuality: 3, body: "Arrived 20 minutes late, but let me know in advance." } });
pastSession({ key: "lena-p3", profileKey: "lena", studentUserId: "u-f3", md: "05-16", time: "09:00", durationMinutes: 60, locationId: "loc-powell",
  studentReview: { photoQuality: 4, communication: 5, punctuality: 5 } });
pastSession({ key: "lena-p4", profileKey: "lena", studentUserId: "u-f4", md: "05-22", time: "16:00", durationMinutes: 90, locationId: "loc-palisades",
  studentReview: { photoQuality: 5, communication: 5, punctuality: 4, body: "Worth the drive to Santa Monica." },
  photographerReview: { communication: 5, punctuality: 5 } });
// Aiden
pastSession({ key: "aiden-p1", profileKey: "aiden", studentUserId: "u-f5", md: "05-09", time: "08:30", durationMinutes: 120, locationId: "loc-janss",
  studentReview: { photoQuality: 5, communication: 4, punctuality: 5, body: "Film scans took the full two weeks, as promised." },
  photographerReview: { communication: 5, punctuality: 5 } });
pastSession({ key: "aiden-p2", profileKey: "aiden", studentUserId: "u-f6", md: "05-15", time: "15:00", durationMinutes: 60, locationId: "loc-griffith",
  studentReview: { photoQuality: 4, communication: 4, punctuality: 4 } });
pastSession({ key: "aiden-p3", profileKey: "aiden", studentUserId: "u-f7", md: "05-21", time: "08:30", durationMinutes: 120, locationId: "loc-royce",
  studentReview: { photoQuality: 5, communication: 5, punctuality: 5 },
  photographerReview: { communication: 5, punctuality: 4 } });
// Noor
pastSession({ key: "noor-p1", profileKey: "noor", studentUserId: "u-f8", md: "05-14", time: "18:00", durationMinutes: 60, locationId: "loc-inverted",
  studentReview: { photoQuality: 5, communication: 5, punctuality: 5, body: "Forty-five minutes and we got more than I needed." },
  photographerReview: { communication: 5, punctuality: 5 } });
pastSession({ key: "noor-p2", profileKey: "noor", studentUserId: "u-f9", md: "05-19", time: "19:15", durationMinutes: 45, locationId: "loc-palisades",
  studentReview: { photoQuality: 4, communication: 3, punctuality: 5, body: "Great light. Hard to reach by message the week before." } });
// Theo
pastSession({ key: "theo-p1", profileKey: "theo", studentUserId: "u-f10", md: "05-18", time: "13:00", durationMinutes: 30, locationId: "loc-janss",
  studentReview: { photoQuality: 3, communication: 5, punctuality: 5, body: "Quick and easy. Some photos were soft." },
  photographerReview: { communication: 5, punctuality: 5 } });
// Chloe
pastSession({ key: "chloe-p1", profileKey: "chloe", studentUserId: "u-f11", md: "05-10", time: "16:30", durationMinutes: 120, locationId: "loc-westwood",
  studentReview: { photoQuality: 5, communication: 4, punctuality: 4, body: "Looks like a magazine shoot. Expensive, and it shows." },
  photographerReview: { communication: 4, punctuality: 5 } });
pastSession({ key: "chloe-p2", profileKey: "chloe", studentUserId: "u-f12", md: "05-17", time: "10:00", durationMinutes: 120, locationId: "loc-palisades",
  studentReview: { photoQuality: 5, communication: 5, punctuality: 5 } });
// Sam: one past session as photographer
pastSession({ key: "sam-p1", profileKey: "sam", studentUserId: "u-f13", md: "05-20", time: "17:00", durationMinutes: 60, locationId: "loc-murphy",
  studentReview: { photoQuality: 5, communication: 5, punctuality: 4, body: "Took a while but the black and white set is the best photo of me that exists." },
  photographerReview: { communication: 5, punctuality: 5 } });

// --- Lena's inbox: one request in each status ---

bookings.push({
  id: "b-grace-lena", slotId: slotId("lena", "06-12", "16:00"), studentUserId: "u-grace", photographerProfileId: "p-lena",
  locationId: "loc-royce", notes: "Me, my parents, and my two brothers for part of it. About six people at most.",
  status: "pending", createdAt: at("06-04", "08:00"),
});
msg("b-grace-lena", "u-grace", at("06-04", "08:01"), "Hi Lena, 4pm works. Is Royce quad all right for a group of six, or is it too crowded that afternoon?");

bookings.push({
  id: "b-omar-lena", slotId: slotId("lena", "06-11", "18:30"), studentUserId: "u-omar", photographerProfileId: "p-lena",
  locationId: "loc-janss", status: "accepted", createdAt: at("05-28", "12:00"), respondedAt: at("05-28", "15:00"),
  responseMessage: "Confirmed. Meet me at the bottom of Janss Steps.",
});
msg("b-omar-lena", "u-omar", at("05-28", "12:02"), "Hi, looking for an hour on the 11th with golden hour if possible.");
msg("b-omar-lena", "u-lena", at("05-28", "15:01"), "Confirmed. Meet me at the bottom of Janss Steps. Wear the stole, bring the cap.");
msg("b-omar-lena", "u-omar", at("06-02", "09:40"), "Could we add ten minutes at the Bruin Bear at the end?");
msg("b-omar-lena", "u-lena", at("06-02", "11:15"), "Yes, if we start at 6:25 instead.");

bookings.push({
  id: "b-hana-lena", slotId: slotId("lena", "06-12", "09:00"), studentUserId: "u-hana", photographerProfileId: "p-lena",
  locationId: "loc-powell", status: "declined", createdAt: at("06-02", "10:00"), respondedAt: at("06-02", "13:00"),
  responseMessage: "I'm holding that morning for a family I shot last year. Noor and Aiden both have openings that weekend.",
});
msg("b-hana-lena", "u-hana", at("06-02", "10:01"), "Hi! Hoping for Powell in the morning before my ceremony.");

bookings.push({
  id: "b-leo-lena", slotId: slotId("lena", "06-13", "16:00"), studentUserId: "u-leo", photographerProfileId: "p-lena",
  locationId: "loc-murphy", status: "cancelled", createdAt: at("05-25", "14:00"), respondedAt: at("05-25", "18:00"),
  cancellation: { by: "student", at: at("06-03", "18:00"), reason: "Our family's flight moved to Sunday afternoon." },
});
msg("b-leo-lena", "u-leo", at("06-03", "18:02"), "Sorry about this. The airline moved our flight.");

// Ethan's completed session with Lena: Lena has reviewed, Ethan has not.
slots.push({ id: slotId("lena", "05-30", "16:00"), photographerProfileId: "p-lena", start: at("05-30", "16:00"), durationMinutes: 90 });
bookings.push({
  id: "b-ethan-lena", slotId: slotId("lena", "05-30", "16:00"), studentUserId: "u-ethan", photographerProfileId: "p-lena",
  locationId: "loc-murphy", status: "completed", createdAt: at("05-20", "09:00"), respondedAt: at("05-20", "11:00"),
  completionMark: { by: "photographer", at: at("05-30", "18:00") },
});
msg("b-ethan-lena", "u-ethan", at("05-20", "09:02"), "Hi Lena, I'd like the sculpture garden if possible.");
msg("b-ethan-lena", "u-lena", at("05-30", "18:05"), "Thanks for today. The gallery will be ready by June 6.");
msg("b-ethan-lena", "u-ethan", at("05-30", "19:30"), "Thank you, my parents loved it.");
reviews.push({
  id: "r-ethan-lena-p", bookingId: "b-ethan-lena", reviewerUserId: "u-lena", reviewerRole: "photographer",
  ratings: { communication: 5, punctuality: 4 }, submittedAt: at("05-31", "10:00"),
});

// Contested no-show: Lena marked no_show, Kai contested within 24h. Resolution deferred (D6).
slots.push({ id: slotId("lena", "06-01", "09:00"), photographerProfileId: "p-lena", start: at("06-01", "09:00"), durationMinutes: 60 });
bookings.push({
  id: "b-kai-lena", slotId: slotId("lena", "06-01", "09:00"), studentUserId: "u-kai", photographerProfileId: "p-lena",
  locationId: "loc-royce", status: "no_show", createdAt: at("05-26", "10:00"), respondedAt: at("05-26", "12:00"),
  completionMark: { by: "photographer", at: at("06-01", "10:00"), contestedAt: at("06-01", "21:00") },
});
msg("b-kai-lena", "u-lena", at("06-01", "09:20"), "I'm at the Royce quad by the fountain. Are you close?");
msg("b-kai-lena", "u-kai", at("06-01", "21:00"), "I was at Royce at 9 on the Powell side and waited 30 minutes. I didn't see a message until tonight.");

// --- Priya: pending, declined, expired ---

bookings.push({
  id: "b-priya-noor", slotId: slotId("noor", "06-12", "18:00"), studentUserId: "u-priya", photographerProfileId: "p-noor",
  locationId: "loc-inverted", notes: "Solo portraits, then my roommate joins for 10 minutes.",
  status: "pending", createdAt: at("06-03", "20:00"),
});
msg("b-priya-noor", "u-priya", at("06-03", "20:02"), "Hi Noor, is the fountain running that weekend?");

bookings.push({
  id: "b-priya-aiden", slotId: slotId("aiden", "06-12", "08:30"), studentUserId: "u-priya", photographerProfileId: "p-aiden",
  locationId: "loc-janss", status: "declined", createdAt: at("06-01", "09:00"), respondedAt: at("06-01", "19:00"),
  responseMessage: "I've taken a wedding that morning. Sorry.",
});
msg("b-priya-aiden", "u-priya", at("06-01", "09:01"), "I'd love a film session on Janss Steps.");

bookings.push({
  id: "b-priya-theo", slotId: slotId("theo", "06-11", "14:00"), studentUserId: "u-priya", photographerProfileId: "p-theo",
  locationId: "loc-royce", status: "expired", createdAt: at("06-02", "09:00"),
});
msg("b-priya-theo", "u-priya", at("06-02", "09:01"), "Hi Theo, just a quick set at Royce after my ceremony.");

// --- Ethan: cancelled by the photographer ---

bookings.push({
  id: "b-ethan-chloe", slotId: slotId("chloe", "06-12", "10:00"), studentUserId: "u-ethan", photographerProfileId: "p-chloe",
  locationId: "loc-westwood", status: "cancelled", createdAt: at("05-29", "10:00"), respondedAt: at("05-29", "16:00"),
  cancellation: { by: "photographer", at: at("06-03", "11:00"), reason: "My main camera body is in repair and won't be back before the 12th." },
});
msg("b-ethan-chloe", "u-chloe", at("06-03", "11:02"), "I'm sorry about this. Aiden Park shoots a similar style and has openings that weekend.");

// --- Sam: a request as photographer, a booking as student ---

bookings.push({
  id: "b-ava-sam", slotId: slotId("sam", "06-08", "17:00"), studentUserId: "u-ava", photographerProfileId: "p-sam",
  locationId: "loc-murphy", notes: "Black and white, if possible.", status: "pending", createdAt: at("06-04", "07:30"),
});
msg("b-ava-sam", "u-ava", at("06-04", "07:31"), "Loved the sculpture garden set on your profile.");

bookings.push({
  id: "b-sam-aiden", slotId: slotId("aiden", "06-11", "15:00"), studentUserId: "u-sam", photographerProfileId: "p-aiden",
  locationId: "loc-royce", status: "accepted", createdAt: at("05-27", "10:00"), respondedAt: at("05-27", "13:00"),
});
msg("b-sam-aiden", "u-sam", at("05-27", "10:01"), "Photographer here, graduating myself. Want someone else behind the camera for once.");
msg("b-sam-aiden", "u-aiden", at("05-27", "13:02"), "Happy to. See you at Royce.");

// --- Lena is fully booked on commencement weekend ---

let fillerIndex = 0;
function fillOpenSlots(profileId: ID, days: string[], status: Booking["status"] = "accepted") {
  const busy = new Set(bookings.filter((b) => b.status === "pending" || b.status === "accepted").map((b) => b.slotId));
  for (const s of slots) {
    if (s.photographerProfileId !== profileId || busy.has(s.id)) continue;
    if (!days.some((d) => s.start.startsWith(`2027-${d}`))) continue;
    const studentUser = fillerStudents[fillerIndex++ % fillerStudents.length];
    bookings.push({
      id: `b-fill-${s.id}`, slotId: s.id, studentUserId: studentUser.id, photographerProfileId: profileId,
      locationId: "loc-royce", status, createdAt: at("05-20", "12:00"), respondedAt: at("05-20", "15:00"),
    });
  }
}
fillOpenSlots("p-lena", ["06-11", "06-12", "06-13"]);

export function buildStandard(): Dataset {
  return {
    users: [...people, ...fillerStudents],
    profiles,
    locations,
    slots: [...slots],
    bookings: [...bookings],
    messages: [...messages],
    reviews: [...reviews],
  };
}
