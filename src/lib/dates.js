const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/** Timestamp of a date-ish value, 0 when missing/invalid. */
export function toTime(d) {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** "mars 2024" (UTC, so a date stored as 2024-03-01T00:00Z never shows February). */
export function formatMonthYear(d) {
  const t = toTime(d);
  if (!t) return '';
  const x = new Date(t);
  return `${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
}

export function getYear(d) {
  const t = toTime(d);
  return t ? new Date(t).getUTCFullYear() : 0;
}

/**
 * Most recent first: current positions on top, then by start date (full date,
 * not only the year — two jobs started the same year used to be unordered).
 */
export function byMostRecent(a, b) {
  if (!!a.current !== !!b.current) return a.current ? -1 : 1;
  return toTime(b.startDate) - toTime(a.startDate) || (a.order ?? 0) - (b.order ?? 0);
}

export function formatDayMonthYear(d) {
  const t = toTime(d);
  if (!t) return '';
  const x = new Date(t);
  return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
}
