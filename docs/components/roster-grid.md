# RosterGrid

Who works when: people down the side, days across.

A grid with a chip per person per day for the shift. Click a cell to choose a shift or clear it. Names stay in place while the days scroll sideways on a phone, and today is marked.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add popover
```

Copy the file below into `src/components/app/roster-grid.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/roster-grid.tsx`, `src/components/app/app-kit.ts`

## Usage

```tsx
<RosterGrid
  people={[{ id: 'p1', name: 'Priya Nair', role: 'Driver' }, { id: 'p2', name: 'Diego Alvarez', role: 'Driver' }]}
  days={['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01']}
  shiftTypes={[{ id: 'am', label: 'Morning', short: 'AM', hours: '06:00 – 14:00' }, { id: 'pm', label: 'Evening', short: 'PM', hours: '14:00 – 22:00', accent: true }]}
  defaultAssignments={{ 'p1.2026-09-29': 'am' }}
  onAssign={(personId, day, shiftId) => save(personId, day, shiftId)}
  today="2026-09-29"
/>
```

## Anatomy

```tsx
import { RosterGrid, type RosterPerson, type ShiftType } from '@/components/app/roster-grid';

// Assignments are keyed "personId.YYYY-MM-DD" and hold a shift id. Leave them out and the grid keeps its own.
<RosterGrid people={people} days={days} shiftTypes={shifts} assignments={assignments} onAssign={assign} />
```

## Examples

### Controlled

```tsx
<RosterGrid people={people} days={days} shiftTypes={shifts} assignments={assignments} onAssign={(p, d, s) => setAssignments({ ...assignments, [`${p}.${d}`]: s ?? undefined })} />
```

## API reference

#### RosterGrid

Scrolls sideways when the days do not fit.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `people` | `RosterPerson[]` | — | id, name and an optional role for each row. |
| `days` | `string[]` | — | ISO dates, one column each, in order. |
| `shiftTypes` | `ShiftType[]` | — | id, label, short, hours? and accent? for each shift. |
| `assignments` | `Record<string, string \| undefined>` | — | Controlled shift id per "personId.day". |
| `defaultAssignments` | `Record<string, string \| undefined>` | — | Starting assignments when uncontrolled. |
| `onAssign` | `(personId, day, shiftId \| null) => void` | — | Called when a cell changes; null clears it. |
| `today` | `string` | — | ISO date to highlight. |
| `accentColor` | `string` | `'#ec4899'` | Colour of accent shifts. |
| `className` | `string` | — | Merged onto the root element. |

## Source

`src/components/app/roster-grid.tsx`

```tsx
'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { initials } from './app-kit';

export interface RosterPerson {
  id: string;
  name: string;
  role?: string;
}

export interface ShiftType {
  id: string;
  label: string;
  /** Two or three letters shown in the cell, e.g. "AM". */
  short: string;
  /** Hours, shown in the picker, e.g. "06:00 – 14:00". */
  hours?: string;
  /** Marks the shift in the accent colour instead of the neutral dark. */
  accent?: boolean;
}

const key = (personId: string, day: string) => `${personId}.${day}`;

/**
 * RosterGrid — who works when: people down the side, days across the top, and a chip in each cell for the shift.
 * Click a cell to choose a shift (or clear it). The names stay put while the days scroll on a phone.
 */
export function RosterGrid({
  people,
  days,
  shiftTypes,
  assignments,
  defaultAssignments = {},
  onAssign,
  today,
  accentColor = '#ec4899',
  className,
}: {
  people: RosterPerson[];
  /** ISO dates, in order. */
  days: string[];
  shiftTypes: ShiftType[];
  /** Controlled: shift id per "personId.day" key. */
  assignments?: Record<string, string | undefined>;
  defaultAssignments?: Record<string, string | undefined>;
  onAssign?: (personId: string, day: string, shiftId: string | null) => void;
  /** ISO date to highlight. */
  today?: string;
  accentColor?: string;
  className?: string;
}) {
  const [inner, setInner] = React.useState(defaultAssignments);
  const data = assignments ?? inner;

  const assign = (personId: string, day: string, shiftId: string | null) => {
    setInner((current) => ({ ...current, [key(personId, day)]: shiftId ?? undefined }));
    onAssign?.(personId, day, shiftId);
  };

  return (
    <div className={cn('relative overflow-x-auto rounded-lg border', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="sticky left-0 z-10 min-w-40 bg-muted px-3 py-2 text-left text-xs font-medium text-muted-foreground">Team</th>
            {days.map((day) => {
              const date = new Date(`${day}T00:00:00Z`);
              return (
                <th key={day} className={cn('min-w-14 px-1 py-2 text-center text-xs font-normal text-muted-foreground', day === today && 'font-medium text-foreground')}>
                  <span className="block">{date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })}</span>
                  <span className="block font-mono tabular-nums">{date.getUTCDate()}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.id} className="border-b last:border-b-0">
              <th scope="row" className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-normal">
                <span className="flex items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">{initials(person.name)}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{person.name}</span>
                    {person.role ? <span className="block truncate text-xs text-muted-foreground">{person.role}</span> : null}
                  </span>
                </span>
              </th>
              {days.map((day) => {
                const shift = shiftTypes.find((type) => type.id === data[key(person.id, day)]);
                return (
                  <td key={day} className={cn('p-1 text-center', day === today && 'bg-muted/40')}>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label={`${person.name}, ${day}: ${shift?.label ?? 'off'}`}
                          className={cn('flex h-8 w-full items-center justify-center rounded-md border text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60', shift ? (shift.accent ? 'border-transparent text-white' : 'border-transparent bg-foreground text-background') : 'border-dashed text-muted-foreground/50 hover:bg-muted')}
                          style={shift?.accent ? { background: accentColor } : undefined}
                        >
                          {shift ? shift.short : '·'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="center" className="w-48 p-1">
                        <p className="px-2 py-1.5 text-xs text-muted-foreground">
                          {person.name} · {new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })}
                        </p>
                        {shiftTypes.map((type) => (
                          <button key={type.id} type="button" onClick={() => assign(person.id, day, type.id)} className={cn('flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted', shift?.id === type.id && 'bg-muted font-medium')}>
                            <span>{type.label}</span>
                            {type.hours ? <span className="font-mono text-xs text-muted-foreground">{type.hours}</span> : null}
                          </button>
                        ))}
                        {shift ? (
                          <button type="button" onClick={() => assign(person.id, day, null)} className="mt-1 w-full rounded-sm border-t px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted">
                            Clear
                          </button>
                        ) : null}
                      </PopoverContent>
                    </Popover>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```
