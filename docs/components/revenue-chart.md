# RevenueChart

A number over time, with range tabs and the change against before.

A total for the chosen range, its change against the range before it, and a chart underneath. 7, 30 and 90 days draw an area of daily values; 12 months draws bars of monthly totals. Give it daily points, including a full extra period behind the range, and it does the rest.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card tabs
```

And the packages the file imports: `recharts lucide-react`

Copy the file below into `src/components/app/revenue-chart.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/revenue-chart.tsx`, `src/components/app/app-kit.ts`

## Usage

```tsx
<RevenueChart
  title="Revenue"
  currency="USD"
  defaultRange="30d"
  data={days} // [{ date: '2026-09-29', value: 1840 }, ...] one per day, oldest first
/>
```

## Anatomy

```tsx
import { RevenueChart, type RevenuePoint } from '@/components/app/revenue-chart';

// Ranges are the last 7, 30, 90 or 365 points. The change compares the total with the same number
// of points just before it, so send at least twice the longest range you want a change for.
<RevenueChart data={days} />
```

## Examples

### The last year, as bars

```tsx
<RevenueChart data={days} defaultRange="12m" title="Yearly revenue" />
```

## API reference

#### RevenueChart

A card with a header, range tabs and a chart.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `RevenuePoint[]` | — | One { date, value } per day, oldest first. |
| `title` | `string` | `'Revenue'` | Label above the total. |
| `currency` | `string` | `'USD'` | An ISO currency code. |
| `defaultRange` | `'7d' \| '30d' \| '90d' \| '12m'` | `'30d'` | The range shown first. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the line, the area and the bars. Inline styles and charts cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/revenue-chart.tsx`

```tsx
'use client';

import * as React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatMoney } from './app-kit';

export interface RevenuePoint {
  /** ISO date, one point per day. */
  date: string;
  value: number;
}

type Range = '7d' | '30d' | '90d' | '12m';
const DAYS: Record<Range, number> = { '7d': 7, '30d': 30, '90d': 90, '12m': 365 };

/** RevenueChart — a number over time with the range tabs, the total, and the change against the period before. */
export function RevenueChart({
  data,
  title = 'Revenue',
  currency = 'USD',
  defaultRange = '30d',
  accentColor = '#ec4899',
  className,
}: {
  /** One point per day, oldest first. Include a full extra period behind the range to get the change. */
  data: RevenuePoint[];
  title?: string;
  currency?: string;
  defaultRange?: Range;
  accentColor?: string;
  className?: string;
}) {
  const [range, setRange] = React.useState<Range>(defaultRange);

  const { points, total, delta } = React.useMemo(() => {
    const days = DAYS[range];
    const current = data.slice(-days);
    const before = data.slice(-days * 2, -days);
    const sum = (list: RevenuePoint[]) => list.reduce((acc, point) => acc + point.value, 0);
    let shown: { label: string; value: number }[];
    if (range === '12m') {
      const months = new Map<string, number>();
      current.forEach((point) => months.set(point.date.slice(0, 7), (months.get(point.date.slice(0, 7)) ?? 0) + point.value));
      shown = [...months].map(([key, value]) => ({ label: new Date(`${key}-01`).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }), value }));
    } else {
      shown = current.map((point) => ({ label: new Date(point.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }), value: point.value }));
    }
    return { points: shown, total: sum(current), delta: before.length === current.length && sum(before) > 0 ? ((sum(current) - sum(before)) / sum(before)) * 100 : undefined };
  }, [data, range]);

  const axis = { tickLine: false, axisLine: false, tick: { fontSize: 11, fill: 'currentColor', opacity: 0.6 } } as const;
  const tooltip = (
    <Tooltip
      cursor={{ stroke: '#d4d4d4' }}
      content={({ active, payload, label }) =>
        active && payload?.length ? (
          <div className="rounded-md border bg-background px-2.5 py-1.5 text-xs">
            <p className="text-muted-foreground">{label}</p>
            <p className="font-mono font-semibold tabular-nums">{formatMoney(Number(payload[0].value), currency)}</p>
          </div>
        ) : null
      }
    />
  );
  const peak = Math.max(...points.map((point) => point.value), 1);
  const unit = 10 ** Math.floor(Math.log10(peak / 4));
  const top = Math.ceil(peak / (4 * unit)) * 4 * unit;
  const yAxis = <YAxis width={44} {...axis} domain={[0, top]} ticks={[0, top / 4, top / 2, (top * 3) / 4, top]} tickFormatter={(value) => (Number(value) >= 1000 ? `${+(Number(value) / 1000).toFixed(1)}k` : String(value))} />;
  const grid = <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.1} strokeDasharray="4 4" />;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-0.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold tabular-nums">{formatMoney(total, currency)}</span>
            {delta !== undefined ? (
              <span className="flex items-center gap-0.5 font-mono text-xs tabular-nums" style={delta < 0 ? { color: accentColor, fontWeight: 600 } : undefined}>
                {delta < 0 ? <ArrowDownRight className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                {delta > 0 ? '+' : ''}
                {delta.toFixed(1)}%
                <span className="ml-1 font-sans font-normal text-muted-foreground">vs previous {range === '12m' ? 'year' : range.replace('d', ' days')}</span>
              </span>
            ) : null}
          </p>
        </div>
        <Tabs value={range} onValueChange={(value) => setRange(value as Range)}>
          <TabsList>
            {(Object.keys(DAYS) as Range[]).map((item) => (
              <TabsTrigger key={item} value={item} className="px-2.5 font-mono text-xs">
                {item}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="h-64 px-2 pt-4 pb-2 text-foreground" role="img" aria-label={`${title} over the last ${range}`}>
        <ResponsiveContainer width="100%" height="100%">
          {range === '12m' ? (
            <BarChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              {grid}
              <XAxis dataKey="label" {...axis} />
              {yAxis}
              {tooltip}
              <Bar dataKey="value" fill={accentColor} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          ) : (
            <AreaChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              {grid}
              <XAxis dataKey="label" {...axis} minTickGap={28} />
              {yAxis}
              {tooltip}
              <Area type="monotone" dataKey="value" stroke={accentColor} strokeWidth={2} fill={accentColor} fillOpacity={0.12} isAnimationActive={false} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```
