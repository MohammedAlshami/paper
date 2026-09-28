/** Small helpers shared by the fleet components. Copy this file alongside any of them. */

const DAY_MS = 86_400_000;

/** Whole days from `from` to `to` (both ISO dates or Dates). Negative when `to` is earlier. */
export function daysBetween(from: string | Date, to: string | Date) {
  const a = new Date(from);
  const b = new Date(to);
  const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((end - start) / DAY_MS);
}

/** "in 12 days", "today", "3 days ago". */
export function relativeDays(days: number) {
  if (days === 0) return 'today';
  const abs = Math.abs(days);
  const unit = abs === 1 ? 'day' : 'days';
  return days > 0 ? `in ${abs} ${unit}` : `${abs} ${unit} ago`;
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return value.toLocaleString('en-US', { maximumFractionDigits });
}

export function formatKm(value: number) {
  return `${formatNumber(value)} km`;
}

export function formatMoney(value: number, currency = 'USD', maximumFractionDigits = 0) {
  return value.toLocaleString('en-US', { style: 'currency', currency, maximumFractionDigits });
}

/** "12 Sep 2026". Accepts an ISO date. */
export function formatDate(value: string | Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Date(value).toLocaleDateString('en-GB', options);
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Clamp a number into a range. */
export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}
