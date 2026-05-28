export const MONTHS_CZ = [
  "ledna",
  "února",
  "března",
  "dubna",
  "května",
  "června",
  "července",
  "srpna",
  "září",
  "října",
  "listopadu",
  "prosince",
];

export const MONTHS_CZ_SHORT = ["LED", "ÚNO", "BŘE", "DUB", "KVĚ", "ČVN", "ČVC", "SRP", "ZÁŘ", "ŘÍJ", "LIS", "PRO"];
export const DAYS_CZ = ["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"];

export function eventDateOnly(value) {
  return String(value || "").slice(0, 10);
}

export function parseDate(value) {
  const [year, month, day] = eventDateOnly(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function fmtCzechDate(value, opts = {}) {
  const date = parseDate(value);
  const text = `${date.getDate()}. ${MONTHS_CZ[date.getMonth()]} ${date.getFullYear()}`;
  return opts.weekday ? `${DAYS_CZ[date.getDay()]} ${text}` : text;
}

export function daysUntil(value) {
  const date = parseDate(value);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((date - now) / 86_400_000);
}

export function eventTitle(event) {
  return event.name || `MAM Pivko — ${event.organizer}`;
}

export function pluralHospod(n) {
  if (n === 1) return "hospoda";
  if (n >= 2 && n <= 4) return "hospody";
  return "hospod";
}

export function pluralDays(n) {
  if (n === 1) return "den";
  if (n >= 2 && n <= 4) return "dny";
  return "dní";
}

export function normalizePub(pub) {
  return {
    ...pub,
    notes: pub.notes ?? pub.note ?? "",
    mapy_label: pub.mapy_label ?? pub.mapyLabel ?? "",
  };
}

export function countWishlistVisits(item, events) {
  const needle = item.name.trim().toLowerCase();
  if (!needle) return 0;
  return events.filter((event) =>
    event.pubs?.some((pub) => pub.name?.trim().toLowerCase() === needle)
  ).length;
}
