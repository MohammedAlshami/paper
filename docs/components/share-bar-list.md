# ShareBarList

How a whole splits into parts, each with its bar and its share.

Each part of a total as a row: the label, its value, its percentage and a bar sized against the biggest part. The largest parts use the accent colour. Good for revenue by store, orders by channel or spend by category.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

Copy the file below into `src/components/app/share-bar-list.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/share-bar-list.tsx`, `src/components/app/app-kit.ts`

## Usage

```tsx
<ShareBarList
  title="Revenue by location"
  description="Last 30 days"
  items={[
    { id: 'mission', label: 'Mission', value: 41200, detail: '412 orders' },
    { id: 'soma', label: 'SoMa', value: 31800, detail: '318 orders' },
    { id: 'marina', label: 'Marina', value: 25100 },
  ]}
  onSelect={(item) => openStore(item.id)}
/>
```

## Anatomy

```tsx
import { ShareBarList, type ShareItem } from '@/components/app/share-bar-list';

// Values are any positive numbers; the shares are worked out for you. Sorted biggest first.
// formatValue turns a value into text: (n) => `${n} orders`.
<ShareBarList items={items} title="Orders by channel" formatValue={(n) => String(n)} highlight={2} />
```

## Examples

### Counts instead of money

```tsx
<ShareBarList title="Orders by method" formatValue={(n) => `${n} orders`} items={[{ id: 'd', label: 'Delivery', value: 48 }, { id: 'p', label: 'Pickup', value: 14 }]} />
```

## API reference

#### ShareBarList

A card with one row per part.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `ShareItem[]` | — | id, label, value and an optional detail line for each part. |
| `title` | `string` | `'Share'` | Card heading. |
| `description` | `string` | — | A line under the heading. |
| `formatValue` | `(value: number) => string` | `US dollars, no decimals` | How a value is written, also used for the total. |
| `highlight` | `number` | `1` | How many of the biggest parts use the accent colour. |
| `onSelect` | `(item: ShareItem) => void` | — | Makes rows clickable. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the biggest parts. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/share-bar-list.tsx`

```tsx
'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatMoney } from './app-kit';

export interface ShareItem {
  id: string;
  label: string;
  value: number;
  /** A line under the label, e.g. "1,240 orders". */
  detail?: string;
}

/**
 * ShareBarList — how a whole splits into parts: each part as a bar, its value and its share of the total. The biggest
 * parts use the accent colour. Good for revenue by store, orders by channel, spend by category.
 */
export function ShareBarList({
  items,
  title = 'Share',
  description,
  formatValue = (value) => formatMoney(value),
  highlight = 1,
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  items: ShareItem[];
  title?: string;
  description?: string;
  /** How a value is written. */
  formatValue?: (value: number) => string;
  /** How many of the biggest parts are drawn in the accent colour. */
  highlight?: number;
  onSelect?: (item: ShareItem) => void;
  accentColor?: string;
  className?: string;
}) {
  const sorted = React.useMemo(() => [...items].sort((a, b) => b.value - a.value), [items]);
  const total = sorted.reduce((sum, item) => sum + item.value, 0) || 1;
  const max = sorted[0]?.value || 1;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-baseline justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-bold">{title}</p>
          {description ? <p className="truncate text-xs text-muted-foreground">{description}</p> : null}
        </div>
        <p className="shrink-0 font-mono text-sm font-semibold tabular-nums">{formatValue(total)}</p>
      </div>
      <ol className="divide-y">
        {sorted.map((item, index) => {
          const share = (item.value / total) * 100;
          const top = index < highlight;
          return (
            <li key={item.id}>
              <button type="button" onClick={() => onSelect?.(item)} className={cn('block w-full px-4 py-3 text-left', onSelect && 'transition-colors hover:bg-muted/50')}>
                <span className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{item.label}</span>
                    {item.detail ? <span className="block truncate text-xs text-muted-foreground">{item.detail}</span> : null}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-sm font-semibold tabular-nums" style={top ? { color: accentColor } : undefined}>
                      {formatValue(item.value)}
                    </span>
                    <span className="block font-mono text-xs tabular-nums text-muted-foreground">{share.toFixed(1)}%</span>
                  </span>
                </span>
                <span className="mt-2 block h-1.5 rounded-full bg-muted" role="img" aria-label={`${item.label} ${share.toFixed(0)} percent`}>
                  <span className="block h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, background: top ? accentColor : '#2e2e2e' }} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
```
