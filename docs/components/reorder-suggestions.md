# ReorderSuggestions

Parts that hit their reorder point, ready to order in one go.

Parts at or below their minimum with a suggested quantity you can nudge up or down, the supplier and lead time, and a running total. Tick what to order; creating orders groups the lines by supplier.

**Category:** Parts and inventory · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/reorder-suggestions.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<ReorderSuggestions
  suggestions={[
    { sku: 'BAT-H8-95', name: 'Battery H8 95 Ah', onHand: 0, min: 2, suggestedQty: 4, supplier: 'VoltCo', leadTimeDays: 2, unitCost: 168 },
  ]}
  onCreateOrders={(bySupplier) => api.createPurchaseOrders(bySupplier)}
/>
```

## Anatomy

```tsx
import { ReorderSuggestions, type ReorderSuggestion } from '@/components/fleet/reorder-suggestions';

// onCreateOrders receives the ticked lines grouped by supplier: { VoltCo: [{ sku, qty, supplier }], ... }
// so one click can raise several purchase orders.
<ReorderSuggestions suggestions={suggestions} onCreateOrders={create} />
```

## Examples

### A single supplier

```tsx
<ReorderSuggestions suggestions={suggestions.slice(0, 1)} />
```

## API reference

#### ReorderSuggestions

A checklist of parts to reorder.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `suggestions` | `ReorderSuggestion[]` | — | sku, name, onHand, min, suggestedQty, supplier, leadTimeDays and unitCost. |
| `currency` | `string` | `'USD'` | An ISO currency code, used to format money. |
| `onCreateOrders` | `(bySupplier: Record<string, ReorderLine[]>) => void` | — | Called with the ticked lines grouped by supplier. |
| `accentColor` | `string` | `'#ec4899'` | Colour of out-of-stock parts and the checkboxes. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/reorder-suggestions.tsx`

```tsx
'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatMoney } from './fleet-kit';

export interface ReorderSuggestion {
  sku: string;
  name: string;
  onHand: number;
  min: number;
  suggestedQty: number;
  supplier: string;
  leadTimeDays: number;
  unitCost: number;
}

export interface ReorderLine {
  sku: string;
  qty: number;
  supplier: string;
}

/** ReorderSuggestions — parts that have hit their reorder point, with a suggested quantity you can change and order in one go. */
export function ReorderSuggestions({
  suggestions,
  currency = 'USD',
  onCreateOrders,
  accentColor = '#ec4899',
  className,
}: {
  suggestions: ReorderSuggestion[];
  currency?: string;
  /** Called with the ticked lines, grouped by supplier. */
  onCreateOrders?: (bySupplier: Record<string, ReorderLine[]>) => void;
  accentColor?: string;
  className?: string;
}) {
  const [selected, setSelected] = React.useState<string[]>(() => suggestions.map((item) => item.sku));
  const [qty, setQty] = React.useState<Record<string, number>>(() => Object.fromEntries(suggestions.map((item) => [item.sku, item.suggestedQty])));
  const [created, setCreated] = React.useState(false);

  const picked = suggestions.filter((item) => selected.includes(item.sku));
  const total = picked.reduce((sum, item) => sum + qty[item.sku] * item.unitCost, 0);
  const suppliers = new Set(picked.map((item) => item.supplier)).size;
  const toggle = (sku: string) => {
    setCreated(false);
    setSelected((current) => (current.includes(sku) ? current.filter((item) => item !== sku) : [...current, sku]));
  };

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-sm font-bold">Reorder suggestions</p>
          <p className="font-mono text-xs tabular-nums text-muted-foreground">{suggestions.length} parts at or below their minimum</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={selected.length === suggestions.length}
            onChange={(event) => setSelected(event.target.checked ? suggestions.map((item) => item.sku) : [])}
            className="size-3.5"
            style={{ accentColor }}
          />
          All
        </label>
      </div>

      <ul className="divide-y">
        {suggestions.map((item) => {
          const on = selected.includes(item.sku);
          const empty = item.onHand === 0;
          return (
            <li key={item.sku} className={cn('flex items-center gap-3 px-4 py-3', !on && 'opacity-55')}>
              <input type="checkbox" checked={on} onChange={() => toggle(item.sku)} aria-label={`Order ${item.name}`} className="size-4 shrink-0" style={{ accentColor }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  <span style={empty ? { color: accentColor, fontWeight: 600 } : undefined}>{empty ? 'Out of stock' : `${item.onHand} left`}</span> · min {item.min} · {item.supplier}, {item.leadTimeDays}d
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" aria-label="Fewer" disabled={!on || qty[item.sku] <= 1} onClick={() => setQty((current) => ({ ...current, [item.sku]: Math.max(1, current[item.sku] - 1) }))} className="flex size-7 items-center justify-center rounded-md border transition-colors hover:bg-muted disabled:opacity-40">
                  <Minus className="size-3.5" />
                </button>
                <span className="w-8 text-center font-mono text-sm tabular-nums" aria-label={`${item.name} quantity`}>
                  {qty[item.sku]}
                </span>
                <button type="button" aria-label="More" disabled={!on} onClick={() => setQty((current) => ({ ...current, [item.sku]: current[item.sku] + 1 }))} className="flex size-7 items-center justify-center rounded-md border transition-colors hover:bg-muted disabled:opacity-40">
                  <Plus className="size-3.5" />
                </button>
              </div>
              <span className="hidden w-20 shrink-0 text-right font-mono text-sm tabular-nums sm:block">{formatMoney(qty[item.sku] * item.unitCost, currency)}</span>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
        <div>
          <p className="font-mono text-lg font-semibold tabular-nums">{formatMoney(total, currency)}</p>
          <p className="text-xs text-muted-foreground">
            {picked.length} parts · {suppliers} {suppliers === 1 ? 'supplier' : 'suppliers'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {created ? <span className="text-xs text-muted-foreground">Orders created</span> : null}
          <Button
            disabled={!picked.length}
            onClick={() => {
              const grouped: Record<string, ReorderLine[]> = {};
              picked.forEach((item) => (grouped[item.supplier] = [...(grouped[item.supplier] ?? []), { sku: item.sku, qty: qty[item.sku], supplier: item.supplier }]));
              setCreated(true);
              onCreateOrders?.(grouped);
            }}
          >
            Create {suppliers > 1 ? `${suppliers} orders` : 'order'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
```
