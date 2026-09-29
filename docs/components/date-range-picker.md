# DateRangePicker

A range of days, from presets or a two-month calendar.

A button that opens presets (today, last 7 days, this month and so on) beside a two-month calendar, one month on a phone. Click a start day, then an end day, with a live preview as you hover. Dates are ISO strings, so there is no date library and no time-zone drift.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button popover
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/date-range-picker.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/date-range-picker.tsx`

## Usage

```tsx
const [range, setRange] = useState<DateRange>({ from: '2026-09-01', to: '2026-09-29' });

<DateRangePicker value={range} onChange={setRange} today="2026-09-29" />
```

## Anatomy

```tsx
import { DateRangePicker, DEFAULT_PRESETS, type DateRange, type DatePreset } from '@/components/app/date-range-picker';

// Dates are "YYYY-MM-DD". Add your own presets next to the defaults:
const presets: DatePreset[] = [...DEFAULT_PRESETS, { id: 'qtd', label: 'Quarter to date', range: (today) => ({ from: '2026-07-01', to: today }) }];
```

## Examples

### Limited to the past

```tsx
<DateRangePicker max="2026-09-29" today="2026-09-29" onChange={setRange} />
```

## API reference

#### DateRangePicker

Controlled with value, or uncontrolled with defaultValue.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `DateRange` | — | The chosen { from, to } as ISO dates. |
| `defaultValue` | `DateRange` | — | Starting range when uncontrolled. |
| `onChange` | `(range: DateRange) => void` | — | Called once a range is complete. |
| `today` | `string` | `the current date` | ISO date treated as today, for presets and the marker. |
| `presets` | `DatePreset[]` | `DEFAULT_PRESETS` | Shortcuts on the left: id, label and range(today). |
| `min` | `string` | — | Earliest selectable day. |
| `max` | `string` | — | Latest selectable day. |
| `placeholder` | `string` | `'Pick a date range'` | Shown before a range is chosen. |
| `defaultOpen` | `boolean` | `false` | Open on first render. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the selected days. |
| `className` | `string` | — | Merged onto the trigger button. |

## Source

`src/components/app/date-range-picker.tsx`

```tsx
'use client';

import * as React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/** An inclusive range of ISO dates ("2026-09-29"). Either end may be missing while the user is still picking. */
export interface DateRange {
  from?: string;
  to?: string;
}

export interface DatePreset {
  id: string;
  label: string;
  /** Works out the range from today's ISO date. */
  range: (today: string) => Required<DateRange>;
}

const DAY_MS = 86_400_000;
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toIso = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (iso: string, days: number) => toIso(new Date(toDate(iso).getTime() + days * DAY_MS));
const startOfMonth = (iso: string) => `${iso.slice(0, 7)}-01`;
const addMonths = (iso: string, months: number) => {
  const date = toDate(startOfMonth(iso));
  date.setUTCMonth(date.getUTCMonth() + months);
  return toIso(date);
};
const endOfMonth = (iso: string) => addDays(addMonths(iso, 1), -1);

export const DEFAULT_PRESETS: DatePreset[] = [
  { id: 'today', label: 'Today', range: (today) => ({ from: today, to: today }) },
  { id: '7d', label: 'Last 7 days', range: (today) => ({ from: addDays(today, -6), to: today }) },
  { id: '30d', label: 'Last 30 days', range: (today) => ({ from: addDays(today, -29), to: today }) },
  { id: 'month', label: 'This month', range: (today) => ({ from: startOfMonth(today), to: endOfMonth(today) }) },
  { id: 'last-month', label: 'Last month', range: (today) => ({ from: addMonths(today, -1), to: endOfMonth(addMonths(today, -1)) }) },
  { id: '90d', label: 'Last 90 days', range: (today) => ({ from: addDays(today, -89), to: today }) },
];

const short = (iso: string) => toDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const shortYear = (iso: string) => toDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function label(range: DateRange, placeholder: string) {
  if (!range.from) return placeholder;
  if (!range.to || range.from === range.to) return shortYear(range.from);
  return `${short(range.from)} – ${shortYear(range.to)}`;
}

/** The days of a month as weeks starting Monday; days outside the month are null. */
function weeksOf(monthIso: string) {
  const first = toDate(startOfMonth(monthIso));
  const lead = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => addDays(startOfMonth(monthIso), i))];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

function Month({
  month,
  range,
  hover,
  today,
  min,
  max,
  accentColor,
  onPick,
  onHover,
}: {
  month: string;
  range: DateRange;
  hover: string | null;
  today: string;
  min?: string;
  max?: string;
  accentColor: string;
  onPick: (iso: string) => void;
  onHover: (iso: string | null) => void;
}) {
  const title = toDate(month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  // While picking the end, preview the range up to the hovered day.
  const previewTo = range.from && !range.to && hover ? hover : range.to;
  const [lo, hi] = range.from && previewTo ? (range.from <= previewTo ? [range.from, previewTo] : [previewTo, range.from]) : [range.from, range.from];
  return (
    <div className="w-[15.5rem]">
      <p className="pb-2 text-center text-sm font-medium">{title}</p>
      <div className="grid grid-cols-7 pb-1 text-center text-[11px] text-muted-foreground">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <span key={i}>{day}</span>
        ))}
      </div>
      <div onMouseLeave={() => onHover(null)}>
        {weeksOf(month).map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((day, di) => {
              if (!day) return <span key={di} className="h-8" />;
              const disabled = (min && day < min) || (max && day > max);
              const edge = day === lo || day === hi;
              const inside = lo && hi && day > lo && day < hi;
              return (
                <button
                  key={di}
                  type="button"
                  disabled={Boolean(disabled)}
                  onClick={() => onPick(day)}
                  onMouseEnter={() => onHover(day)}
                  aria-pressed={edge || undefined}
                  aria-label={shortYear(day)}
                  className={cn(
                    'relative h-8 text-sm tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-30',
                    inside && 'bg-muted',
                    edge ? 'z-10 rounded-md font-medium text-white' : 'hover:bg-muted',
                    day === lo && hi && lo !== hi && 'rounded-r-none',
                    day === hi && lo !== hi && 'rounded-l-none',
                  )}
                  style={edge ? { background: accentColor } : undefined}
                >
                  {Number(day.slice(8))}
                  {day === today && !edge ? <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full" style={{ background: accentColor }} aria-hidden /> : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * DateRangePicker — a button that opens presets and a two-month calendar (one month on a phone). Click a start day,
 * then an end day. Dates are ISO strings, so there is no date library and no time-zone surprises.
 */
export function DateRangePicker({
  value,
  defaultValue,
  onChange,
  today = new Date().toISOString().slice(0, 10),
  presets = DEFAULT_PRESETS,
  min,
  max,
  placeholder = 'Pick a date range',
  defaultOpen = false,
  accentColor = '#ec4899',
  className,
}: {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  /** ISO date treated as today. */
  today?: string;
  presets?: DatePreset[];
  min?: string;
  max?: string;
  placeholder?: string;
  defaultOpen?: boolean;
  accentColor?: string;
  className?: string;
}) {
  const [inner, setInner] = React.useState<DateRange>(defaultValue ?? {});
  const range = value ?? inner;
  const [open, setOpen] = React.useState(defaultOpen);
  const [draft, setDraft] = React.useState<DateRange>(range);
  const [month, setMonth] = React.useState(startOfMonth(range.from ?? today));
  const [hover, setHover] = React.useState<string | null>(null);

  const commit = (next: DateRange) => {
    setInner(next);
    onChange?.(next);
  };

  const pick = (iso: string) => {
    if (!draft.from || draft.to) {
      setDraft({ from: iso });
      return;
    }
    const next = iso < draft.from ? { from: iso, to: draft.from } : { from: draft.from, to: iso };
    setDraft(next);
    commit(next);
    setOpen(false);
  };

  const activePreset = presets.find((preset) => {
    const r = preset.range(today);
    return r.from === range.from && r.to === range.to;
  });

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setDraft(range);
          setMonth(startOfMonth(range.from ?? today));
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('justify-start gap-2 font-normal', !range.from && 'text-muted-foreground', className)}>
          <CalendarDays className="text-muted-foreground" />
          <span className="truncate">{activePreset ? `${activePreset.label} · ${label(range, placeholder)}` : label(range, placeholder)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[calc(100vw-1.5rem)] p-0">
        <div className="flex flex-col sm:flex-row">
          <ul className="flex gap-1 overflow-x-auto border-b p-2 sm:w-40 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0">
            {presets.map((preset) => (
              <li key={preset.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const next = preset.range(today);
                    setDraft(next);
                    setMonth(startOfMonth(next.from));
                    commit(next);
                    setOpen(false);
                  }}
                  className={cn('w-full rounded-md px-2.5 py-1.5 text-left text-sm whitespace-nowrap transition-colors hover:bg-muted', activePreset?.id === preset.id && 'bg-muted font-medium')}
                >
                  {preset.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="p-3">
            <div className="flex items-start gap-4">
              <Button variant="ghost" size="icon-sm" onClick={() => setMonth(addMonths(month, -1))} aria-label="Previous month" className="mt-[-2px] shrink-0">
                <ChevronLeft />
              </Button>
              <Month month={month} range={draft} hover={hover} today={today} min={min} max={max} accentColor={accentColor} onPick={pick} onHover={setHover} />
              <div className="hidden sm:block">
                <Month month={addMonths(month, 1)} range={draft} hover={hover} today={today} min={min} max={max} accentColor={accentColor} onPick={pick} onHover={setHover} />
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month" className="mt-[-2px] shrink-0">
                <ChevronRight />
              </Button>
            </div>
            <p className="pt-3 text-center text-xs text-muted-foreground">{draft.from && !draft.to ? 'Now pick the last day.' : 'Pick the first day, then the last.'}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```
