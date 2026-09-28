# RunMetrics

Are the workflows healthy, and what fails.

KPI tiles (success rate, p95 duration, cost per run, retry rate), a fourteen-day runs chart, and the failure reasons as bars with counts.

**Category:** Management · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

Copy the file below into `src/components/agent-ops/run-metrics.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<RunMetrics
  workflow="All workflows"
  window="Last 14 days"
  kpis={kpis}
  trend={trend}
  failures={failures}
/>
```

## Anatomy

```tsx
import { RunMetrics } from '@/components/agent-ops/run-metrics';

// Kpi: { label, value, hint?, delta? } · TrendPoint: { label, value, failed? }
<RunMetrics kpis={kpis} trend={trend} failures={failures} />
```

## Examples

### Fourteen days

```tsx
<RunMetrics kpis={kpis} trend={trend} failures={failures} />
```

## API reference

#### RunMetrics

The portfolio view over many runs.

| Prop | Type | Description |
| --- | --- | --- |
| `workflow` | `string` | Card title. Defaults to All workflows. |
| `window` | `string` | Right-aligned window label. Defaults to Last 14 days. |
| `kpis` | `Kpi[]` | label, value, hint?, delta? — rendered as tiles. |
| `trend` | `TrendPoint[]` | label, value, failed? — bars; failed days render hatched. |
| `failures` | `{ reason, count }[]` | Hatched bars, longest first. |

## Source

`src/components/agent-ops/run-metrics.tsx`

```tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Kpi, TrendPoint } from './types';

/** RunMetrics — the portfolio view: are the workflows healthy, and what fails. */
export function RunMetrics({
  workflow = 'All workflows',
  window = 'Last 14 days',
  kpis,
  trend,
  failures,
  className,
}: {
  workflow?: string;
  window?: string;
  kpis: Kpi[];
  trend: TrendPoint[];
  failures: { reason: string; count: number }[];
  className?: string;
}) {
  const max = Math.max(...trend.map((point) => point.value), 1);
  const failureMax = Math.max(...failures.map((item) => item.count), 1);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">{workflow}</CardTitle>
        <span className="font-mono text-xs text-muted-foreground">{window}</span>
      </CardHeader>

      <div className="grid grid-cols-2 divide-x divide-y border-y lg:grid-cols-4 lg:divide-y-0">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="px-6 py-4">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 font-mono text-2xl font-medium tabular-nums">{kpi.value}</p>
            {kpi.delta || kpi.hint ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {kpi.delta ? <span className="font-mono tabular-nums">{kpi.delta} </span> : null}
                {kpi.hint}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <CardContent className="space-y-6 py-4">
        <div>
          <p className="mb-3 text-xs text-muted-foreground">Runs per day</p>
          <div className="flex h-28 items-stretch gap-1.5">
            {trend.map((point, index) => (
              <div key={`${point.label}-${index}`} className="group flex h-full min-w-0 flex-1 flex-col justify-end gap-0.5">
                <div
                  className={cn('w-full rounded-t-sm', point.failed ? 'bg-primary/30' : 'bg-primary')}
                  style={{ height: `${Math.max(4, (point.value / max) * 100)}%` }}
                  title={`${point.label}: ${point.value}${point.failed ? ' · failures' : ''}`}
                />
                <span className="truncate text-center font-mono text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs text-muted-foreground">Why runs fail</p>
          <ul className="space-y-2">
            {failures.map((item) => (
              <li key={item.reason} className="grid grid-cols-[1fr_3rem] items-center gap-3">
                <span className="min-w-0">
                  <span className="mb-1 block truncate text-sm text-muted-foreground">{item.reason}</span>
                  <span
                    className="block h-1.5 rounded-full bg-primary/35"
                    style={{ width: `${(item.count / failureMax) * 100}%` }}
                  />
                </span>
                <span className="text-right font-mono text-xs tabular-nums">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
```
