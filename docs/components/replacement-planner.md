# ReplacementPlanner

When does it stop making sense to keep it?

Cost per year owned across the vehicle’s life, the year it is lowest, and where it is now. Slide to a planned replacement year to see the cost per year, how much more than the best year that is, and the resale value. Built on Recharts.

**Category:** Fleet costs and stats · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `recharts lucide-react`

Copy the file below into `src/components/fleet/replacement-planner.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<ReplacementPlanner
  vehicle="Van 21 · 2019 Sprinter"
  currentAge={7}
  purchasePrice={42000}
  projection={[
    { year: 1, running: 900, resale: 34500 },
    { year: 2, running: 1400, resale: 29000 },
    { year: 3, running: 2100, resale: 24800 },
  ]}
  onReplace={(year) => api.planReplacement(year)}
/>
```

## Anatomy

```tsx
import { ReplacementPlanner, type YearProjection } from '@/components/fleet/replacement-planner';

// Cost per year owned = (purchasePrice - resale + running costs so far) / years.
// The best year is where that is lowest. Running and resale figures are your forecast.
<ReplacementPlanner vehicle={name} currentAge={7} purchasePrice={42000} projection={projection} />
```

## Examples

### A newer vehicle

```tsx
<ReplacementPlanner vehicle="Van 03" currentAge={3} purchasePrice={42000} projection={projection} />
```

## API reference

#### ReplacementPlanner

An ownership-cost curve and a slider.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `vehicle` | `string` | — | The vehicle name. |
| `currentAge` | `number` | — | Age in years. |
| `purchasePrice` | `number` | — | What it cost new. |
| `projection` | `YearProjection[]` | — | year, the running cost that year, and the resale value at the end of it. |
| `currency` | `string` | `'USD'` | An ISO currency code, used to format money. |
| `onReplace` | `(atYear: number) => void` | — | Called when the plan button is pressed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the best year and costs above it. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/replacement-planner.tsx`

```tsx
'use client';

import * as React from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatMoney } from './fleet-kit';

export interface YearProjection {
  /** Age of the vehicle at the end of this year: 1, 2, 3 ... */
  year: number;
  /** What it will cost to keep it running this year: maintenance and repairs. */
  running: number;
  /** What it would sell for at the end of this year. */
  resale: number;
}

/**
 * ReplacementPlanner — when does it stop making sense to keep a vehicle? Ownership cost per year, and the year it is lowest.
 * Cost per year owned = (purchase price − resale + running costs so far) ÷ years.
 */
export function ReplacementPlanner({
  vehicle,
  currentAge,
  purchasePrice,
  projection,
  currency = 'USD',
  onReplace,
  accentColor = '#ec4899',
  className,
}: {
  vehicle: string;
  /** How old it is now, in years. */
  currentAge: number;
  purchasePrice: number;
  projection: YearProjection[];
  currency?: string;
  onReplace?: (atYear: number) => void;
  accentColor?: string;
  className?: string;
}) {
  const data = React.useMemo(() => {
    let runningSoFar = 0;
    return projection.map((point) => {
      runningSoFar += point.running;
      const perYear = (purchasePrice - point.resale + runningSoFar) / point.year;
      return { year: point.year, perYear: Math.round(perYear), running: point.running, resale: point.resale };
    });
  }, [projection, purchasePrice]);

  const best = data.reduce((min, point) => (point.perYear < min.perYear ? point : min), data[0]);
  const now = data.find((point) => point.year === currentAge) ?? data[0];
  const [plannedYear, setPlannedYear] = React.useState(best.year);
  const planned = data.find((point) => point.year === plannedYear) ?? best;
  const extraPerYear = planned.perYear - best.perYear;
  const pastBest = currentAge > best.year;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="border-b px-4 py-3">
        <p className="text-sm font-bold">{vehicle}</p>
        <p className="mt-1 text-sm" style={pastBest ? { color: accentColor, fontWeight: 600 } : undefined}>
          {pastBest ? `Past its best: cheapest to own at year ${best.year}, now in year ${currentAge}.` : currentAge === best.year ? 'Right at its best year. Plan the replacement.' : `Cheapest to own at year ${best.year}, ${best.year - currentAge} more to go.`}
        </p>
      </div>

      <div className="h-56 px-2 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -6 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} tickFormatter={(value) => `Yr ${value}`} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`} domain={[0, (max: number) => Math.ceil(max / 4000) * 4000]} tickCount={5} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} labelFormatter={(value) => `Year ${value}`} formatter={(value) => formatMoney(Number(value), currency)} />
            <ReferenceLine x={best.year} stroke={accentColor} strokeDasharray="4 3" label={{ value: 'best', position: 'top', fontSize: 11, fill: accentColor }} />
            <ReferenceLine x={currentAge} stroke="currentColor" strokeOpacity={0.4} label={{ value: 'now', position: 'insideTopRight', fontSize: 11, fill: 'currentColor', opacity: 0.6 }} />
            <Line type="monotone" dataKey="perYear" name="Cost per year owned" stroke="#2e2e2e" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="running" name="Running cost that year" stroke="#a3a3a3" strokeDasharray="4 4" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 border-t px-4 py-4">
        <label className="block">
          <span className="flex justify-between text-sm">
            <span className="text-muted-foreground">Replace at the end of year</span>
            <span className="font-mono font-semibold tabular-nums">{plannedYear}</span>
          </span>
          <input type="range" min={projection[0].year} max={projection[projection.length - 1].year} step={1} value={plannedYear} onChange={(event) => setPlannedYear(Number(event.target.value))} className="mt-1 h-6 w-full" style={{ accentColor }} />
        </label>
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-[11px] text-muted-foreground">Cost per year</dt>
            <dd className="font-mono font-semibold tabular-nums">{formatMoney(planned.perYear, currency)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Vs the best year</dt>
            <dd className="font-mono font-semibold tabular-nums" style={extraPerYear > 0 ? { color: accentColor } : undefined}>
              {extraPerYear > 0 ? '+' : ''}
              {formatMoney(extraPerYear, currency)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Resale then</dt>
            <dd className="font-mono font-semibold tabular-nums">{formatMoney(planned.resale, currency)}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">
          Today it costs {formatMoney(now.perYear, currency)} a year to own, and next year's running cost is {formatMoney(data.find((point) => point.year === currentAge + 1)?.running ?? now.running, currency)}.
        </p>
        <button type="button" onClick={() => onReplace?.(plannedYear)} className="h-9 w-full rounded-md bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90">
          Plan replacement for year {plannedYear}
        </button>
      </div>
    </Card>
  );
}
```
