/** Deterministic randomness so the demo data is the same on every load. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** "Today" for the whole template: the morning of 29 Sep 2026. */
export const TODAY = '2026-09-29';
/** The moment the demo "is": late morning. Times in the data are relative to it. */
export const NOW = '2026-09-29T11:20:00Z';

const DAY_MS = 86_400_000;
export const addDays = (iso: string, days: number) => new Date(new Date(`${iso.slice(0, 10)}T00:00:00Z`).getTime() + days * DAY_MS).toISOString().slice(0, 10);
export const daysBetween = (from: string, to: string) => Math.round((new Date(`${to.slice(0, 10)}T00:00:00Z`).getTime() - new Date(`${from.slice(0, 10)}T00:00:00Z`).getTime()) / DAY_MS);
/** An ISO date-time on a day, at hh:mm. */
export const at = (day: string, hh: number, mm = 0) => `${day}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00Z`;
export const minutesAgo = (minutes: number) => new Date(new Date(NOW).getTime() - minutes * 60_000).toISOString();

export const formatMoney = (value: number, currency = 'USD', digits = 0) => value.toLocaleString('en-US', { style: 'currency', currency, maximumFractionDigits: digits, minimumFractionDigits: digits });
export const formatDate = (iso: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) => new Date(iso).toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
export const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
/** "12 min ago", "3 h ago", "Yesterday", "24 Sep". */
export function relativeTime(iso: string, now = NOW) {
  const minutes = Math.round((new Date(now).getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  const days = daysBetween(iso, now);
  return days === 1 ? 'Yesterday' : formatDate(iso);
}
