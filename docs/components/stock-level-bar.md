# StockLevelBar

Stock against its limits, and what is on its way.

A bar per part showing what is on the shelf, the reorder line, the ceiling, and a hatched segment for what is on order. Below the reorder line it says "Reorder now", or "Low, order arriving" if an order covers it.

**Category:** Parts and inventory · **Family:** fleet · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/stock-level-bar.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/fleet/stock-level-bar.tsx`, `src/components/fleet/fleet-kit.ts`

## Usage

```tsx
<StockLevelBar
  items={[
    { id: 'a', name: 'Front brake pad set', onHand: 6, min: 4, max: 14 },
    { id: 'b', name: 'Front brake rotor', onHand: 3, min: 4, max: 12, onOrder: 6 },
  ]}
/>
```

## Anatomy

```tsx
import { StockLevelBar, type StockLevel } from '@/components/fleet/stock-level-bar';

// min is the reorder point, max the shelf capacity. onOrder is optional and drawn hatched.
<StockLevelBar items={levels} />
```

## Examples

### One part, nothing wrong

```tsx
<StockLevelBar items={levels.slice(4)} />
```

## API reference

#### StockLevelBar

A list of stock bars.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `StockLevel[]` | — | id, name, onHand, min, max and optionally onOrder. |
| `onSelect` | `(item: StockLevel) => void` | — | Called when a row is pressed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of parts that need reordering. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/stock-level-bar.tsx`

```tsx
'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatNumber } from './fleet-kit';

export interface StockLevel {
  id: string;
  name: string;
  onHand: number;
  min: number;
  max: number;
  /** Already ordered and on its way. */
  onOrder?: number;
}

/** StockLevelBar — stock against its limits: what is on the shelf, the reorder line, the ceiling, and what is on its way. */
export function StockLevelBar({
  items,
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  items: StockLevel[];
  onSelect?: (item: StockLevel) => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <ul className="divide-y">
        {items.map((item) => {
          const scale = Math.max(item.max, item.onHand + (item.onOrder ?? 0)) * 1.05;
          const pct = (value: number) => `${(value / scale) * 100}%`;
          const low = item.onHand <= item.min;
          const covered = low && item.onHand + (item.onOrder ?? 0) > item.min;
          return (
            <li key={item.id}>
              <button type="button" onClick={() => onSelect?.(item)} className="block w-full px-4 py-3 text-left transition-colors hover:bg-muted/50">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-bold">{item.name}</span>
                  <span className="shrink-0 text-xs" style={low && !covered ? { color: accentColor, fontWeight: 600 } : undefined}>
                    {low ? (covered ? 'Low, order arriving' : 'Reorder now') : 'In stock'}
                  </span>
                </span>
                <span className="relative mt-2.5 block h-3 rounded-full bg-muted" role="img" aria-label={`${item.onHand} on hand, reorder at ${item.min}, up to ${item.max}${item.onOrder ? `, ${item.onOrder} on order` : ''}`}>
                  <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: pct(item.onHand), background: low ? accentColor : '#2e2e2e' }} />
                  {item.onOrder ? (
                    <span
                      className="absolute inset-y-0 rounded-r-full border border-dashed border-foreground/50"
                      style={{ left: pct(item.onHand), width: pct(item.onOrder), background: 'repeating-linear-gradient(135deg, transparent 0 3px, rgba(0,0,0,0.12) 3px 5px)' }}
                    />
                  ) : null}
                  <span className="absolute -inset-y-1 w-px bg-foreground/70" style={{ left: pct(item.min) }} title={`Reorder at ${item.min}`} />
                  <span className="absolute -inset-y-1 w-px bg-foreground/30" style={{ left: pct(item.max) }} title={`Max ${item.max}`} />
                </span>
                <span className="mt-2 flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
                  <span>
                    {formatNumber(item.onHand)} on hand{item.onOrder ? ` + ${formatNumber(item.onOrder)} on order` : ''}
                  </span>
                  <span>
                    min {item.min} · max {item.max}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
```
