# VehicleLeaderboard

Rank the fleet, so the vehicle costing you money is obvious.

Vehicles ranked worst first by cost per kilometre, downtime or fuel use, each with a bar and a fleet-average marker. The worst few are in the accent colour. Switch the ranking with the tabs.

**Category:** Fleet costs and stats · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/vehicle-leaderboard.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<VehicleLeaderboard
  vehicles={[
    { id: 'v21', name: 'Van 21', costPerKm: 0.91, downtimeDays: 14 },
    { id: 'v03', name: 'Van 03', costPerKm: 0.27, downtimeDays: 0 },
  ]}
  metrics={[
    { key: 'costPerKm', label: 'Cost per km', format: (v) => '$' + v.toFixed(2), higherIsWorse: true },
    { key: 'downtimeDays', label: 'Downtime', format: (v) => v + ' days', higherIsWorse: true },
  ]}
/>
```

## Anatomy

```tsx
import { VehicleLeaderboard, type LeaderboardMetric } from '@/components/fleet/vehicle-leaderboard';

// Each vehicle has any number of numeric fields; each metric names one by key.
// higherIsWorse decides the order: true for cost and downtime, false for mpg.
<VehicleLeaderboard vehicles={vehicles} metrics={metrics} />
```

## Examples

### Ranked by downtime

```tsx
<VehicleLeaderboard vehicles={vehicles} metrics={metrics} defaultMetric="downtimeDays" />
```

## API reference

#### VehicleLeaderboard

A ranked list with tabs.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `vehicles` | `LeaderboardVehicle[]` | — | id, name and a number for each metric key. |
| `metrics` | `LeaderboardMetric[]` | — | key, label, format and higherIsWorse. |
| `defaultMetric` | `string` | `the first metric` | The metric shown first. |
| `worstCount` | `number` | `2` | How many at the top are highlighted. |
| `onSelect` | `(vehicle: LeaderboardVehicle) => void` | — | Called when a row is pressed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the worst vehicles. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/vehicle-leaderboard.tsx`

```tsx
'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface LeaderboardVehicle {
  id: string;
  name: string;
  /** Any numeric metrics, by metric key. */
  [metric: string]: number | string;
}

export interface LeaderboardMetric {
  key: string;
  label: string;
  /** Formats a value for display. */
  format: (value: number) => string;
  /** Whether a bigger number is worse. Costs and downtime are; fuel economy in mpg is not. */
  higherIsWorse: boolean;
}

/** VehicleLeaderboard — rank the fleet by cost, downtime or fuel use, worst first, so the vehicle costing you money is obvious. */
export function VehicleLeaderboard({
  vehicles,
  metrics,
  defaultMetric,
  worstCount = 2,
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  vehicles: LeaderboardVehicle[];
  metrics: LeaderboardMetric[];
  defaultMetric?: string;
  /** How many at the top of the list are highlighted as the worst. */
  worstCount?: number;
  onSelect?: (vehicle: LeaderboardVehicle) => void;
  accentColor?: string;
  className?: string;
}) {
  const [key, setKey] = React.useState(defaultMetric ?? metrics[0].key);
  const metric = metrics.find((item) => item.key === key) ?? metrics[0];

  const ranked = [...vehicles].sort((a, b) => (metric.higherIsWorse ? Number(b[metric.key]) - Number(a[metric.key]) : Number(a[metric.key]) - Number(b[metric.key])));
  const values = ranked.map((vehicle) => Number(vehicle[metric.key]));
  const max = Math.max(...values);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex gap-1 overflow-x-auto border-b p-2" role="tablist" aria-label="Rank by">
        {metrics.map((item) => (
          <button key={item.key} type="button" role="tab" aria-selected={item.key === metric.key} onClick={() => setKey(item.key)} className={cn('shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors', item.key === metric.key ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted')}>
            {item.label}
          </button>
        ))}
      </div>

      <ol className="divide-y">
        {ranked.map((vehicle, index) => {
          const value = Number(vehicle[metric.key]);
          const worst = index < worstCount;
          return (
            <li key={vehicle.id}>
              <button type="button" onClick={() => onSelect?.(vehicle)} className="block w-full px-4 py-3 text-left transition-colors hover:bg-muted/50">
                <span className="flex items-baseline gap-3">
                  <span className="w-5 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{vehicle.name}</span>
                  <span className="font-mono text-sm font-semibold tabular-nums" style={worst ? { color: accentColor } : undefined}>
                    {metric.format(value)}
                  </span>
                </span>
                <span className="relative ml-8 mt-1.5 block h-1.5 rounded-full bg-muted">
                  <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(value / max) * 100}%`, background: worst ? accentColor : '#2e2e2e' }} />
                  <span className="absolute -inset-y-0.5 w-px bg-foreground/60" style={{ left: `${(mean / max) * 100}%` }} title={`Fleet average ${metric.format(mean)}`} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">
        The line is the fleet average, <span className="font-mono tabular-nums">{metric.format(mean)}</span>.
      </p>
    </Card>
  );
}
```
