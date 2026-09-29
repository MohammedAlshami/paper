# ServiceIntervalGauge

How far through each service interval a vehicle is.

One bar per interval (oil, tyre rotation, brakes, filters) showing how much of it is used, with the distance left or over and when it was last done. The most used interval is at the top.

**Category:** Maintenance scheduling · **Family:** fleet · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/service-interval-gauge.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/fleet/service-interval-gauge.tsx`, `src/components/fleet/fleet-kit.ts`

## Usage

```tsx
<ServiceIntervalGauge
  vehicle="Van 12"
  odometerKm={148210}
  intervals={[
    { id: 'oil', label: 'Oil and filter', everyKm: 12000, lastDoneKm: 138500 },
    { id: 'rot', label: 'Tyre rotation', everyKm: 15000, lastDoneKm: 132000 },
  ]}
/>
```

## Anatomy

```tsx
import { ServiceIntervalGauge, type ServiceInterval } from '@/components/fleet/service-interval-gauge';

// Used = (odometer - lastDoneKm) / everyKm. At 85% a bar lightens to the accent colour, at 100% it is overdue.
<ServiceIntervalGauge vehicle={name} odometerKm={km} intervals={intervals} />
```

## Examples

### A newer vehicle

```tsx
<ServiceIntervalGauge vehicle="Van 03" odometerKm={54120} intervals={intervals} />
```

## API reference

#### ServiceIntervalGauge

Progress through each interval.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `vehicle` | `string` | — | The vehicle name. |
| `odometerKm` | `number` | — | Current reading. |
| `intervals` | `ServiceInterval[]` | — | id, label, everyKm and lastDoneKm. |
| `onSelect` | `(interval: ServiceInterval) => void` | — | Called when an interval row is pressed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of near-due and overdue bars. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/service-interval-gauge.tsx`

```tsx
'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { clamp, formatNumber } from './fleet-kit';

export interface ServiceInterval {
  id: string;
  label: string;
  /** The service repeats every this many kilometres. */
  everyKm: number;
  /** Odometer reading when it was last done. */
  lastDoneKm: number;
}

function state(used: number) {
  return used >= 1 ? 'overdue' : used >= 0.85 ? 'soon' : 'ok';
}

/** ServiceIntervalGauge — how far through each service interval a vehicle is: oil, tyres, brakes, and so on. */
export function ServiceIntervalGauge({
  vehicle,
  odometerKm,
  intervals,
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  vehicle: string;
  odometerKm: number;
  intervals: ServiceInterval[];
  onSelect?: (interval: ServiceInterval) => void;
  accentColor?: string;
  className?: string;
}) {
  const rows = intervals
    .map((interval) => {
      const done = odometerKm - interval.lastDoneKm;
      const used = done / interval.everyKm;
      return { interval, done, used, remaining: interval.everyKm - done, status: state(used) };
    })
    .sort((a, b) => b.used - a.used);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-baseline justify-between gap-3 border-b px-4 py-3">
        <p className="text-sm font-bold">{vehicle}</p>
        <p className="font-mono text-xs tabular-nums text-muted-foreground">{formatNumber(odometerKm)} km</p>
      </div>
      <ul className="divide-y">
        {rows.map(({ interval, used, remaining, status }) => (
          <li key={interval.id}>
            <button type="button" onClick={() => onSelect?.(interval)} className="block w-full px-4 py-3 text-left transition-colors hover:bg-muted/50">
              <span className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-bold">{interval.label}</span>
                <span className="font-mono text-xs tabular-nums" style={status === 'overdue' ? { color: accentColor } : undefined}>
                  {remaining < 0 ? `${formatNumber(-remaining)} km over` : `${formatNumber(remaining)} km left`}
                </span>
              </span>
              <span className="relative mt-2 block h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${Math.round(used * 100)}% of the interval used`}>
                <span
                  className="block h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${clamp(used * 100)}%`, background: status === 'ok' ? '#2e2e2e' : accentColor, opacity: status === 'soon' ? 0.65 : 1 }}
                />
              </span>
              <span className="mt-1 flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
                <span>done at {formatNumber(interval.lastDoneKm)}</span>
                <span>every {formatNumber(interval.everyKm)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
```
