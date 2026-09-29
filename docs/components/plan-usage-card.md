# PlanUsageCard

The plan you are on and how much of it you have used.

The plan name and price, the renewal date, and a meter for each limit: seats, storage, requests. A meter at 85% or more turns to the accent colour. Two buttons at the foot: manage billing and upgrade.

**Category:** Billing and teams · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button card
```

Copy the file below into `src/components/app/plan-usage-card.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/plan-usage-card.tsx`, `src/components/app/app-kit.ts`

## Usage

```tsx
<PlanUsageCard
  planName="Growth"
  price={624}
  interval="month"
  renewsOn="2026-10-01"
  meters={[
    { id: 'seats', label: 'Team members', used: 18, limit: 25 },
    { id: 'storage', label: 'Storage', used: 41, limit: 50, unit: 'GB' },
  ]}
  onUpgrade={() => openUpgrade()}
  onManage={() => openPortal()}
/>
```

## Anatomy

```tsx
import { PlanUsageCard, type UsageMeter } from '@/components/app/plan-usage-card';

// used and limit are plain numbers in the same unit. Add unit for a suffix like "GB".
<PlanUsageCard planName={plan.name} price={plan.price} renewsOn={sub.renewsOn} meters={meters} />
```

## Examples

### A free plan

```tsx
<PlanUsageCard planName="Starter" price={0} renewsOn="2026-10-01" meters={meters} />
```

## API reference

#### PlanUsageCard

A card for one subscription.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `planName` | `string` | — | The name of the plan. |
| `price` | `number` | — | Price per interval. |
| `currency` | `string` | `'USD'` | An ISO currency code, used to format money. |
| `interval` | `'month' \| 'year'` | `'month'` | The billing interval shown under the price. |
| `renewsOn` | `string` | — | ISO date of the next charge. |
| `meters` | `UsageMeter[]` | — | id, label, used, limit and an optional unit. |
| `onUpgrade` | `() => void` | — | Called by Upgrade plan. |
| `onManage` | `() => void` | — | Called by Manage billing. |
| `accentColor` | `string` | `'#ec4899'` | Colour of meters at 85% or more. Inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/plan-usage-card.tsx`

```tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { clamp, formatDate, formatMoney, formatNumber } from './app-kit';

export interface UsageMeter {
  id: string;
  label: string;
  used: number;
  limit: number;
  /** Appended to the numbers, e.g. "GB". */
  unit?: string;
}

/** PlanUsageCard — the plan you are on, when it renews, and how much of each limit you have used. Over 85% turns to the accent colour. */
export function PlanUsageCard({
  planName,
  price,
  currency = 'USD',
  interval = 'month',
  renewsOn,
  meters,
  onUpgrade,
  onManage,
  accentColor = '#ec4899',
  className,
}: {
  planName: string;
  price: number;
  currency?: string;
  interval?: 'month' | 'year';
  /** ISO date of the next charge. */
  renewsOn: string;
  meters: UsageMeter[];
  onUpgrade?: () => void;
  onManage?: () => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
        <div>
          <p className="text-xs text-muted-foreground">Current plan</p>
          <p className="mt-0.5 text-lg font-bold">{planName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Renews {formatDate(renewsOn)}</p>
        </div>
        <p className="text-right">
          <span className="font-mono text-2xl font-semibold tabular-nums">{formatMoney(price, currency)}</span>
          <span className="block text-xs text-muted-foreground">per {interval}</span>
        </p>
      </div>

      <ul className="space-y-4 p-4">
        {meters.map((meter) => {
          const percent = clamp((meter.used / meter.limit) * 100);
          const high = percent >= 85;
          return (
            <li key={meter.id}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">{meter.label}</span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground" style={high ? { color: accentColor, fontWeight: 600 } : undefined}>
                  {formatNumber(meter.used)} / {formatNumber(meter.limit)}
                  {meter.unit ? ` ${meter.unit}` : ''}
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label={meter.label}
                aria-valuenow={Math.round(percent)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full" style={{ width: `${percent}%`, background: high ? accentColor : '#2e2e2e' }} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap justify-end gap-2 border-t p-3">
        <Button variant="outline" size="sm" onClick={onManage}>
          Manage billing
        </Button>
        <Button size="sm" onClick={onUpgrade}>
          Upgrade plan
        </Button>
      </div>
    </Card>
  );
}
```
