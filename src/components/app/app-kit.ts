/** Small helpers shared by the app components. Copy this file alongside any of them. */

export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return value.toLocaleString('en-US', { maximumFractionDigits });
}

export function formatMoney(value: number, currency = 'USD', maximumFractionDigits = 0) {
  return value.toLocaleString('en-US', { style: 'currency', currency, maximumFractionDigits });
}

/** "12 Sep 2026". Accepts an ISO date. */
export function formatDate(value: string | Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Date(value).toLocaleDateString('en-GB', options);
}

/** Clamp a number into a range. */
export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}
