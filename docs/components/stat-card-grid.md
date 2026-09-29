# StatCardGrid

The headline numbers of a dashboard, one card each.

A card per number with an optional icon, the change against the last period, and a trend line. A change is drawn in the accent colour only when it moved the wrong way, which you say with goodWhen. Lays out as one, two or four columns depending on the space it is given.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/stat-card-grid.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/stat-card-grid.tsx`

## Usage

```tsx
<StatCardGrid
  stats={[
    { id: 'mrr', label: 'Monthly recurring revenue', value: '$48,210', icon: DollarSign, delta: 6.4, goodWhen: 'up', trend: [30, 32, 35, 38, 41, 46, 48] },
    { id: 'churn', label: 'Churn', value: '2.4%', delta: 0.6, goodWhen: 'down', trend: [1.8, 1.9, 2, 2.1, 2.4] },
  ]}
  onSelect={(stat) => openReport(stat.id)}
/>
```

## Anatomy

```tsx
import { StatCardGrid, type Stat } from '@/components/app/stat-card-grid';

// value is a string you have already formatted. delta is a percentage. goodWhen decides whether
// a rise or a fall is the bad direction, so that churn going up is flagged and revenue going up is not.
const stats: Stat[] = [{ id, label, value, icon, delta, goodWhen, trend }];
<StatCardGrid stats={stats} period="vs last month" />
```

## Examples

### Three cards

```tsx
<StatCardGrid stats={stats.slice(0, 3)} period="vs Aug" />
```

## API reference

#### StatCardGrid

A responsive grid of cards.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `stats` | `Stat[]` | — | id, label, value, and optionally icon, delta, goodWhen and trend. |
| `period` | `string` | `'vs last month'` | Label after each change. |
| `onSelect` | `(stat: Stat) => void` | — | Makes each card a button. |
| `accentColor` | `string` | `'#ec4899'` | Colour of changes that went the wrong way, and their trend line. Inline styles and charts cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the grid wrapper. |

## Source

`src/components/app/stat-card-grid.tsx`

```tsx
'use client';

import * as React from 'react';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Stat {
  id: string;
  label: string;
  /** Already formatted, e.g. "$48,200" or "1,284". */
  value: string;
  icon?: LucideIcon;
  /** Percentage change against the last period. */
  delta?: number;
  /** Which direction of change is good. Decides whether a change is drawn as bad. */
  goodWhen?: 'up' | 'down';
  /** A short series, oldest first, drawn as a sparkline. */
  trend?: number[];
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const points = values.map((value, index) => `${((index / (values.length - 1)) * 100).toFixed(1)},${(26 - ((value - min) / span) * 22).toFixed(1)}`);
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** StatCardGrid — the headline numbers of a dashboard, one card each, with change against last period and a trend line. */
export function StatCardGrid({
  stats,
  period = 'vs last month',
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  stats: Stat[];
  /** Label after each change, e.g. "vs last month". */
  period?: string;
  onSelect?: (stat: Stat) => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <div className={cn('@container', className)}>
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-4">
        {stats.map((stat) => {
          const up = (stat.delta ?? 0) > 0;
          const bad = stat.delta !== undefined && stat.goodWhen !== undefined && (stat.goodWhen === 'up' ? stat.delta < 0 : stat.delta > 0);
          const Arrow = up ? ArrowUpRight : ArrowDownRight;
          const Icon = stat.icon;
          return (
            <Card key={stat.id} className="gap-0 overflow-hidden py-0">
              <button type="button" onClick={() => onSelect?.(stat)} className="block h-full w-full px-4 py-4 text-left transition-colors hover:bg-muted/50">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  {Icon ? <Icon className="size-4 text-muted-foreground" aria-hidden /> : null}
                </div>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{stat.value}</p>
                {stat.delta !== undefined ? (
                  <p className="mt-0.5 flex items-center gap-1 text-xs tabular-nums" style={bad ? { color: accentColor, fontWeight: 600 } : undefined}>
                    {stat.delta === 0 ? null : <Arrow className="size-3.5" />}
                    <span className={cn('font-mono', !bad && 'text-muted-foreground')}>
                      {stat.delta > 0 ? '+' : ''}
                      {stat.delta.toFixed(1)}%
                    </span>
                    <span className="font-normal text-muted-foreground">{period}</span>
                  </p>
                ) : null}
                {stat.trend && stat.trend.length > 1 ? (
                  <div className="mt-3">
                    <Sparkline values={stat.trend} color={bad ? accentColor : '#2e2e2e'} />
                  </div>
                ) : null}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```
