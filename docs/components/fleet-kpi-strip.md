# FleetKpiStrip

The numbers a fleet manager checks first.

A strip of figures (availability, cost per kilometre, open work orders, average age), each with its change, coloured only when the change is the wrong way, and a trend line. Two across on a phone, four across on a desktop.

**Category:** Fleet costs and stats · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/fleet-kpi-strip.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<FleetKpiStrip
  kpis={[
    { id: 'avail', label: 'Availability', value: '91.4%', delta: -2.1, goodWhen: 'up', trend: [95, 94, 95, 93, 94, 92, 91.4] },
    { id: 'cpk', label: 'Cost per km', value: '$0.47', delta: 3.8, goodWhen: 'down', trend: [0.42, 0.43, 0.45, 0.47] },
  ]}
  period="vs last month"
/>
```

## Anatomy

```tsx
import { FleetKpiStrip, type Kpi } from '@/components/fleet/fleet-kpi-strip';

// goodWhen says which direction is good, so a rising cost is drawn as bad and a rising availability as fine.
// value is already formatted; trend is a short series, oldest first.
<FleetKpiStrip kpis={kpis} />
```

## Examples

### Three numbers

```tsx
<FleetKpiStrip kpis={kpis.slice(0, 3)} period="vs Aug" />
```

## API reference

#### FleetKpiStrip

A grid of figures.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `kpis` | `Kpi[]` | — | id, label, value (formatted), and optionally unit, delta (percent), goodWhen and trend. |
| `period` | `string` | `'vs last month'` | Label after each change. |
| `onSelect` | `(kpi: Kpi) => void` | — | Called when a figure is pressed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of changes in the wrong direction. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/fleet-kpi-strip.tsx`

```tsx
'use client';

import * as React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Kpi {
  id: string;
  label: string;
  /** Already formatted, e.g. "94%" or "$0.41". */
  value: string;
  unit?: string;
  /** Percentage change against the last period. */
  delta?: number;
  /** Which direction of change is good. Decides whether a change is drawn as bad. */
  goodWhen?: 'up' | 'down';
  /** A short series, oldest first, drawn as a sparkline. */
  trend?: number[];
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => `${((index / (values.length - 1)) * 100).toFixed(1)},${(26 - ((value - min) / span) * 22).toFixed(1)}`);
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** FleetKpiStrip — the numbers a fleet manager checks first: availability, cost per km, open work, with change and a trend line. */
export function FleetKpiStrip({
  kpis,
  period = 'vs last month',
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  kpis: Kpi[];
  /** Label after each change, e.g. "vs last month". */
  period?: string;
  onSelect?: (kpi: Kpi) => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <dl className="grid grid-cols-2 @2xl:grid-cols-4 [&>*]:border-b [&>*]:border-r [&>*:nth-last-child(-n+2)]:border-b-0 @2xl:[&>*:nth-last-child(-n+4)]:border-b-0 [&>*:nth-child(2n)]:border-r-0 @2xl:[&>*:nth-child(2n)]:border-r @2xl:[&>*:nth-child(4n)]:border-r-0">
        {kpis.map((kpi) => {
          const up = (kpi.delta ?? 0) > 0;
          const bad = kpi.delta !== undefined && kpi.goodWhen !== undefined && (kpi.goodWhen === 'up' ? kpi.delta < 0 : kpi.delta > 0);
          const Arrow = up ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={kpi.id}>
              <button type="button" onClick={() => onSelect?.(kpi)} className="block h-full w-full px-4 py-4 text-left transition-colors hover:bg-muted/50">
                <dt className="text-xs text-muted-foreground">{kpi.label}</dt>
                <dd className="mt-1 flex items-baseline gap-1">
                  <span className="font-mono text-2xl font-semibold tabular-nums">{kpi.value}</span>
                  {kpi.unit ? <span className="text-xs text-muted-foreground">{kpi.unit}</span> : null}
                </dd>
                {kpi.delta !== undefined ? (
                  <dd className="mt-0.5 flex items-center gap-1 text-xs tabular-nums" style={bad ? { color: accentColor, fontWeight: 600 } : undefined}>
                    {kpi.delta === 0 ? null : <Arrow className="size-3.5" />}
                    <span className={cn('font-mono', !bad && 'text-muted-foreground')}>
                      {kpi.delta > 0 ? '+' : ''}
                      {kpi.delta.toFixed(1)}%
                    </span>
                    <span className="hidden font-normal text-muted-foreground sm:inline">{period}</span>
                  </dd>
                ) : null}
                {kpi.trend && kpi.trend.length > 1 ? (
                  <dd className="mt-2">
                    <Sparkline values={kpi.trend} color={bad ? accentColor : '#2e2e2e'} />
                  </dd>
                ) : null}
              </button>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}
```
