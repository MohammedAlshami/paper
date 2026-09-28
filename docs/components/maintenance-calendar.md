# MaintenanceCalendar

A month of booked services. Pick a day to see the bays.

A month grid with each day’s booked vehicles, today marked, and month navigation. On a phone the cells show dots instead of names. Pick a day to list its services with the bay and status.

**Category:** Maintenance scheduling · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/maintenance-calendar.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<MaintenanceCalendar
  services={[
    { id: 'b1', date: '2026-10-01', vehicle: 'Van 21', service: 'Front brakes', bay: 'Bay 2', status: 'booked' },
    { id: 'b2', date: '2026-10-01', vehicle: 'Truck 02', service: 'Oil and filter', bay: 'Bay 1' },
  ]}
  defaultMonth="2026-10"
  onSelectService={(service) => openService(service)}
/>
```

## Anatomy

```tsx
import { MaintenanceCalendar, type BookedService } from '@/components/fleet/maintenance-calendar';

// Weeks start on Monday. Dates are ISO strings; defaultMonth is "YYYY-MM".
// status: 'booked' | 'in-progress' | 'done'
<MaintenanceCalendar services={services} defaultMonth="2026-10" />
```

## Examples

### An empty month

```tsx
<MaintenanceCalendar services={services} defaultMonth="2026-11" />
```

## API reference

#### MaintenanceCalendar

A month view with a day detail list.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `services` | `BookedService[]` | — | id, date, vehicle, service, and optionally bay and status. |
| `defaultMonth` | `string` | `this month` | "YYYY-MM", the month shown first. |
| `today` | `string` | `today` | An ISO date drawn as today. |
| `defaultSelected` | `string` | — | An ISO date selected at the start. |
| `onSelectDay` | `(date: string, services: BookedService[]) => void` | — | Called when a day is picked. |
| `onSelectService` | `(service: BookedService) => void` | — | Called when a service in the day list is pressed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of today and the selected day. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/maintenance-calendar.tsx`

```tsx
'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface BookedService {
  id: string;
  /** ISO date. */
  date: string;
  vehicle: string;
  service: string;
  bay?: string;
  status?: 'booked' | 'in-progress' | 'done';
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** MaintenanceCalendar — a month of booked services. Pick a day to see what is booked and where. */
export function MaintenanceCalendar({
  services,
  defaultMonth = new Date().toISOString().slice(0, 7),
  today = new Date().toISOString().slice(0, 10),
  defaultSelected,
  onSelectDay,
  onSelectService,
  accentColor = '#ec4899',
  className,
}: {
  services: BookedService[];
  /** "YYYY-MM". The month shown first. */
  defaultMonth?: string;
  /** ISO date drawn as today. */
  today?: string;
  /** ISO date selected at the start. */
  defaultSelected?: string;
  onSelectDay?: (date: string, services: BookedService[]) => void;
  onSelectService?: (service: BookedService) => void;
  accentColor?: string;
  className?: string;
}) {
  const [[year, month], setMonth] = React.useState<[number, number]>(() => {
    const [y, m] = defaultMonth.split('-').map(Number);
    return [y, m - 1];
  });
  const [selected, setSelected] = React.useState<string | null>(defaultSelected ?? null);

  const byDate = React.useMemo(() => {
    const map = new Map<string, BookedService[]>();
    services.forEach((service) => map.set(service.date, [...(map.get(service.date) ?? []), service]));
    return map;
  }, [services]);

  const first = new Date(year, month, 1);
  const leading = (first.getDay() + 6) % 7;
  const length = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((leading + length) / 7) * 7 }, (_, index) => {
    const day = index - leading + 1;
    return day >= 1 && day <= length ? iso(year, month, day) : null;
  });

  const shift = (delta: number) => setMonth(([y, m]) => {
    const next = new Date(y, m + delta, 1);
    return [next.getFullYear(), next.getMonth()];
  });

  const monthCount = services.filter((service) => service.date.startsWith(iso(year, month, 1).slice(0, 7))).length;
  const selectedServices = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-base font-bold">{first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
          <p className="font-mono text-xs tabular-nums text-muted-foreground">{monthCount} booked</p>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="outline" aria-label="Previous month" onClick={() => shift(-1)}>
            <ChevronLeft />
          </Button>
          <Button size="icon" variant="outline" aria-label="Next month" onClick={() => shift(1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b text-center text-[11px] text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1.5">
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, index) => {
          if (!date) return <span key={index} className="min-h-14 border-b border-r bg-muted/30 @lg:min-h-20" />;
          const day = byDate.get(date) ?? [];
          const isToday = date === today;
          const isSelected = date === selected;
          const weekend = index % 7 >= 5;
          return (
            <button
              key={date}
              type="button"
              onClick={() => {
                setSelected(date);
                onSelectDay?.(date, day);
              }}
              aria-pressed={isSelected}
              aria-label={`${date}, ${day.length} services`}
              className={cn('flex min-h-14 flex-col items-stretch border-b border-r p-1 text-left transition-colors hover:bg-muted/60 @lg:min-h-20 @lg:p-1.5', weekend && 'bg-muted/30', isSelected && 'bg-muted')}
              style={isSelected ? { boxShadow: `inset 0 0 0 1.5px ${accentColor}` } : undefined}
            >
              <span className={cn('flex size-5 items-center justify-center self-start rounded-full text-[11px] tabular-nums', isToday && 'font-semibold text-white')} style={isToday ? { background: accentColor } : undefined}>
                {Number(date.slice(8))}
              </span>
              <span className="mt-0.5 hidden flex-col gap-0.5 @lg:flex">
                {day.slice(0, 2).map((service) => (
                  <span key={service.id} className="truncate rounded bg-foreground px-1 py-0.5 text-[10px] leading-tight text-background">
                    {service.vehicle}
                  </span>
                ))}
                {day.length > 2 ? <span className="px-1 text-[10px] text-muted-foreground">+{day.length - 2} more</span> : null}
              </span>
              {day.length ? (
                <span className="mt-auto flex gap-0.5 pt-1 @lg:hidden">
                  {day.slice(0, 4).map((service) => (
                    <span key={service.id} className="size-1.5 rounded-full bg-foreground" />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="min-h-16 p-4">
        {selected ? (
          selectedServices.length ? (
            <ul className="divide-y">
              {selectedServices.map((service) => (
                <li key={service.id}>
                  <button type="button" onClick={() => onSelectService?.(service)} className="flex w-full items-center gap-3 py-2 text-left">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">
                        {service.vehicle} <span className="font-normal text-muted-foreground">· {service.service}</span>
                      </span>
                      {service.bay ? <span className="block text-xs text-muted-foreground">{service.bay}</span> : null}
                    </span>
                    {service.status ? <span className="shrink-0 text-xs capitalize text-muted-foreground">{service.status.replace('-', ' ')}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing booked on this day.</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">Pick a day to see what is booked.</p>
        )}
      </div>
    </Card>
  );
}
```
