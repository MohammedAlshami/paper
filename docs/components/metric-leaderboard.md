# MetricLeaderboard

Rank anything by a number you can switch.

A ranked list with a tab per metric: stores by revenue, drivers by on-time rate, products by margin. Best first, a bar per row, a tick for the average, and the leaders in the accent colour. A metric can say that lower is better.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

Copy the file below into `src/components/app/metric-leaderboard.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/metric-leaderboard.tsx`

## Usage

```tsx
<MetricLeaderboard
  averageLabel="store average"
  items={[
    { id: 'mission', name: 'Mission', detail: '2200 Mission St', revenue: 41200, returns: 2.1 },
    { id: 'soma', name: 'SoMa', detail: '450 Folsom St', revenue: 31800, returns: 3.4 },
  ]}
  metrics={[
    { key: 'revenue', label: 'Revenue', format: (v) => `$${v.toLocaleString()}` },
    { key: 'returns', label: 'Returns', format: (v) => `${v}%`, lowerIsBetter: true },
  ]}
  onSelect={(store) => openStore(store.id)}
/>
```

## Anatomy

```tsx
import { MetricLeaderboard, type LeaderboardItem, type LeaderboardMetric } from '@/components/app/metric-leaderboard';

// Each item carries a number for every metric key. Ranked best first; set lowerIsBetter on
// metrics where a smaller number wins. With one metric the tabs are hidden.
<MetricLeaderboard items={items} metrics={metrics} highlight={2} />
```

## Examples

### One metric

```tsx
<MetricLeaderboard items={[{ id: 'a', name: 'Priya', ontime: 97 }, { id: 'b', name: 'Jon', ontime: 88 }]} metrics={[{ key: 'ontime', label: 'On time', format: (v) => `${v}%` }]} averageLabel="team average" />
```

## API reference

#### MetricLeaderboard

A ranked card.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `LeaderboardItem[]` | — | id, name, an optional detail line, and a number for each metric key. |
| `metrics` | `LeaderboardMetric[]` | — | key, label, format and an optional lowerIsBetter. One tab per metric. |
| `defaultMetric` | `string` | `the first metric` | The metric shown first. |
| `highlight` | `number` | `1` | How many leaders use the accent colour. |
| `averageLabel` | `string` | `'average'` | Names the average tick in the footer. |
| `onSelect` | `(item: LeaderboardItem) => void` | — | Makes rows clickable. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the leaders. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/metric-leaderboard.tsx`

```tsx
'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface LeaderboardItem {
  id: string;
  name: string;
  /** A line under the name, e.g. the address. */
  detail?: string;
  /** Any numeric metrics, by metric key. */
  [metric: string]: number | string | undefined;
}

export interface LeaderboardMetric {
  key: string;
  label: string;
  /** How a value is written. */
  format: (value: number) => string;
  /** Set when a smaller number is better, such as returns or delivery time. Ranked best first either way. */
  lowerIsBetter?: boolean;
}

/**
 * MetricLeaderboard — rank anything by a number you can switch: stores by revenue, drivers by on-time rate, products by
 * margin. Best first, a bar per row, a tick for the average, and the leaders in the accent colour.
 */
export function MetricLeaderboard({
  items,
  metrics,
  defaultMetric,
  highlight = 1,
  averageLabel = 'average',
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  items: LeaderboardItem[];
  metrics: LeaderboardMetric[];
  defaultMetric?: string;
  /** How many at the top are drawn in the accent colour. */
  highlight?: number;
  /** Names the tick in the footer: "The line is the store average". */
  averageLabel?: string;
  onSelect?: (item: LeaderboardItem) => void;
  accentColor?: string;
  className?: string;
}) {
  const [key, setKey] = React.useState(defaultMetric ?? metrics[0].key);
  const metric = metrics.find((item) => item.key === key) ?? metrics[0];

  const ranked = [...items].sort((a, b) => (metric.lowerIsBetter ? Number(a[metric.key]) - Number(b[metric.key]) : Number(b[metric.key]) - Number(a[metric.key])));
  const values = ranked.map((item) => Number(item[metric.key]));
  const max = Math.max(...values, 1);
  const mean = values.reduce((sum, value) => sum + value, 0) / (values.length || 1);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      {metrics.length > 1 ? (
        <div className="flex gap-1 overflow-x-auto border-b p-2" role="tablist" aria-label="Rank by">
          {metrics.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={item.key === metric.key}
              onClick={() => setKey(item.key)}
              className={cn('shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors', item.key === metric.key ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted')}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      <ol className="divide-y">
        {ranked.map((item, index) => {
          const value = Number(item[metric.key]);
          const lead = index < highlight;
          return (
            <li key={item.id}>
              <button type="button" onClick={() => onSelect?.(item)} className={cn('block w-full px-4 py-3 text-left', onSelect && 'transition-colors hover:bg-muted/50')}>
                <span className="flex items-baseline gap-3">
                  <span className="w-5 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{item.name}</span>
                    {item.detail ? <span className="block truncate text-xs text-muted-foreground">{item.detail}</span> : null}
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums" style={lead ? { color: accentColor } : undefined}>
                    {metric.format(value)}
                  </span>
                </span>
                <span className="relative ml-8 mt-1.5 block h-1.5 rounded-full bg-muted">
                  <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(value / max) * 100}%`, background: lead ? accentColor : '#2e2e2e' }} />
                  <span className="absolute -inset-y-0.5 w-px bg-foreground/60" style={{ left: `${(mean / max) * 100}%` }} title={`${averageLabel} ${metric.format(mean)}`} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">
        The line is the {averageLabel}, <span className="font-mono tabular-nums">{metric.format(mean)}</span>.
      </p>
    </Card>
  );
}
```
