# CostBreakdownChart

What each vehicle costs to run, split by kind.

A stacked bar per vehicle for fuel, maintenance, tyres and insurance, ranked with the costliest first, with a switch between total and per kilometre and chips to hide a category. Built on Recharts.

**Category:** Fleet costs and stats · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge card
```

And the packages the file imports: `recharts lucide-react`

Copy the file below into `src/components/fleet/cost-breakdown-chart.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<CostBreakdownChart
  data={[
    { name: 'Van 21', distanceKm: 31200, fuel: 6100, maintenance: 5400, tires: 900, insurance: 2400 },
    { name: 'Van 12', distanceKm: 36900, fuel: 6300, maintenance: 2100, tires: 800, insurance: 2300 },
  ]}
  categories={[{ key: 'fuel', label: 'Fuel' }, { key: 'maintenance', label: 'Maintenance' }, { key: 'tires', label: 'Tyres' }, { key: 'insurance', label: 'Insurance' }]}
/>
```

## Anatomy

```tsx
import { CostBreakdownChart, type CostRow } from '@/components/fleet/cost-breakdown-chart';

// Each row needs distanceKm so per-kilometre costs can be worked out, plus a number per category key.
// The chart's height grows with the number of vehicles.
<CostBreakdownChart data={rows} categories={categories} />
```

## Examples

### Per kilometre

```tsx
<CostBreakdownChart data={rows} categories={categories} defaultMode="perKm" />
```

## API reference

#### CostBreakdownChart

A stacked, rankable cost chart.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `CostRow[]` | — | name, distanceKm and a cost for each category key. |
| `categories` | `CostCategory[]` | — | key and label for each cost type. |
| `currency` | `string` | `'USD'` | An ISO currency code, used to format money. |
| `defaultMode` | `'total' \| 'perKm'` | `'total'` | The view shown first. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the second category. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/cost-breakdown-chart.tsx`

```tsx
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatMoney } from './fleet-kit';

export interface CostRow {
  name: string;
  /** Distance driven in the period, so costs can also be shown per kilometre. */
  distanceKm: number;
  /** Cost for each category, by category key. */
  [category: string]: number | string;
}

export interface CostCategory {
  key: string;
  label: string;
}

/** CostBreakdownChart — what each vehicle costs to run, split into fuel, maintenance, tyres and insurance. */
export function CostBreakdownChart({
  data,
  categories,
  currency = 'USD',
  defaultMode = 'total',
  accentColor = '#ec4899',
  className,
}: {
  data: CostRow[];
  categories: CostCategory[];
  currency?: string;
  defaultMode?: 'total' | 'perKm';
  accentColor?: string;
  className?: string;
}) {
  const [mode, setMode] = React.useState<'total' | 'perKm'>(defaultMode);
  const [hidden, setHidden] = React.useState<string[]>([]);
  const palette = ['#2e2e2e', accentColor, '#767676', '#d4d4d4', '#a3a3a3'];

  const rows = data
    .map((row) => {
      const out: Record<string, number | string> = { name: row.name };
      categories.forEach((category) => {
        out[category.key] = mode === 'perKm' ? Number(row[category.key]) / row.distanceKm : Number(row[category.key]);
      });
      out.sum = categories.filter((category) => !hidden.includes(category.key)).reduce((sum, category) => sum + Number(out[category.key]), 0);
      return out;
    })
    .sort((a, b) => Number(b.sum) - Number(a.sum));

  const fleetTotal = data.reduce((sum, row) => sum + categories.filter((category) => !hidden.includes(category.key)).reduce((inner, category) => inner + Number(row[category.key]), 0), 0);
  const fleetKm = data.reduce((sum, row) => sum + row.distanceKm, 0);
  const format = (value: number) => (mode === 'perKm' ? `${formatMoney(value, currency, 2)}/km` : formatMoney(value, currency));

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-sm font-bold">Running cost</p>
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            {formatMoney(fleetTotal, currency)} · {formatMoney(fleetTotal / fleetKm, currency, 2)}/km fleet-wide
          </p>
        </div>
        <div className="flex gap-1 rounded-md bg-muted p-0.5" role="group" aria-label="Show costs as">
          {([['total', 'Total'], ['perKm', 'Per km']] as const).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)} className={cn('rounded px-2.5 py-1 text-xs font-medium transition-colors', mode === id ? 'bg-background shadow-xs' : 'text-muted-foreground')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 pt-3">
        {categories.map((category, index) => {
          const off = hidden.includes(category.key);
          return (
            <button key={category.key} type="button" aria-pressed={!off} onClick={() => setHidden((current) => (off ? current.filter((key) => key !== category.key) : [...current, category.key]))}>
              <Badge variant="outline" className={cn('gap-1.5', off && 'opacity-40')}>
                <span className="size-2 rounded-full" style={{ background: palette[index % palette.length] }} />
                {category.label}
              </Badge>
            </button>
          );
        })}
      </div>

      <div className="px-2 pb-3 pt-2" style={{ height: 40 + rows.length * 34 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 4 }} barCategoryGap={8}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} tickFormatter={(value) => (mode === 'perKm' ? `$${Number(value).toFixed(2)}` : `$${Math.round(Number(value) / 1000)}k`)} />
            <YAxis type="category" dataKey="name" width={62} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} />
            <Tooltip cursor={{ fill: 'currentColor', fillOpacity: 0.06 }} contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(value) => format(Number(value))} />
            {categories.map((category, index) =>
              hidden.includes(category.key) ? null : <Bar key={category.key} dataKey={category.key} name={category.label} stackId="cost" fill={palette[index % palette.length]} isAnimationActive={false} />,
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```
