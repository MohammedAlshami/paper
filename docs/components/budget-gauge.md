# BudgetGauge

Spend against the budget, with the forecast you did not want.

Used, remaining and projected spend against thresholds, with the forecast marked on the bar — so budget is a decision made now rather than a surprise at the end of the month.

**Category:** Cost & limits · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge separator
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/budget-gauge.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<BudgetGauge period="October" budget={120} spent={78.4} forecast={148.2} thresholds={[50, 80, 100]} />
```

## Anatomy

```tsx
import { BudgetGauge } from '@/components/agent-ops/budget-gauge';

// the forecast marker is the difference between "fine" and "fine until Sunday"
<BudgetGauge budget={120} spent={78.4} forecast={148.2} />
```

## Examples

### On track

```tsx
<BudgetGauge budget={120} spent={41.2} forecast={88.4} />
```

### Projected over budget

```tsx
<BudgetGauge budget={120} spent={78.4} forecast={148.2} />
```

## API reference

#### BudgetGauge

The badge flips to “projected over” when the forecast exceeds the budget.

| Prop | Type | Description |
| --- | --- | --- |
| `budget / spent / forecast?` | `number` | Forecast defaults to nothing and the marker is hidden. |
| `period` | `string` | Shown next to the title. |
| `thresholds` | `number[]` | Percentages drawn as ticks. Defaults to [50, 80, 100]. |

## Source

`src/components/agent-ops/budget-gauge.tsx`

```tsx
'use client';

import * as React from 'react';
import { TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MeterBar } from './shared/meter-bar';
import { Panel, PanelHeader } from './shared/panel';

/** BudgetGauge — spend against the budget, with the forecast you did not want. */
export function BudgetGauge({
  period = 'This month',
  budget,
  spent,
  forecast,
  thresholds = [50, 80, 100],
  className,
}: {
  period?: string;
  budget: number;
  spent: number;
  /** Projected end-of-period spend. */
  forecast?: number;
  thresholds?: number[];
  className?: string;
}) {
  const usedPct = Math.min(100, Math.round((spent / Math.max(budget, 0.01)) * 100));
  const forecastPct = forecast ? Math.min(100, Math.round((forecast / Math.max(budget, 0.01)) * 100)) : undefined;
  const over = (forecast ?? spent) > budget;

  return (
    <Panel className={className}>
      <PanelHeader
        title="Budget"
        right={
          <>
            <span className="font-mono text-xs text-muted-foreground">{period}</span>
            {over ? (
              <Badge variant="destructive">
                <TriangleAlert /> projected over
              </Badge>
            ) : (
              <Badge variant="outline">on track</Badge>
            )}
          </>
        }
      />

      <Separator />
      <CardContent className="space-y-4 py-4">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-medium tabular-nums">${spent.toFixed(2)}</span>
            <span className="font-mono text-xs text-muted-foreground">of ${budget.toFixed(2)}</span>
          </div>
          {forecast ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-muted-foreground">forecast</span>
              <span className="font-mono text-sm tabular-nums">${forecast.toFixed(2)}</span>
            </div>
          ) : null}
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground">remaining</span>
            <span className="font-mono text-sm tabular-nums">${Math.max(0, budget - spent).toFixed(2)}</span>
          </div>
        </div>

        <MeterBar
          pct={usedPct}
          height="h-2"
          ticks={[
            ...(forecastPct !== undefined
              ? [{ at: forecastPct, label: `forecast ${forecastPct}%`, variant: 'marker' as const }]
              : []),
            ...thresholds.map((threshold) => ({ at: threshold, label: `${threshold}%` })),
          ]}
        />

        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          {usedPct}% used
          {forecastPct !== undefined ? ` · forecast ${forecastPct}%` : ''} · thresholds {thresholds.join(' / ')}%
        </p>
      </CardContent>
    </Panel>
  );
}
```
