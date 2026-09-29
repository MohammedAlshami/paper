# PurchaseOrderCard

An order to a supplier, and a way to book in the delivery.

The order’s status as a five-step bar, its total and ETA, and each line with received against ordered. Type what arrived (or leave it empty for everything outstanding) and Receive; the status moves to part received or received on its own.

**Category:** Parts and inventory · **Family:** fleet · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/purchase-order-card.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/fleet/purchase-order-card.tsx`, `src/components/fleet/fleet-kit.ts`

## Usage

```tsx
<PurchaseOrderCard
  id="PO-1184"
  supplier="Northline Parts"
  status="confirmed"
  eta="2026-10-02"
  lines={[
    { sku: 'BRK-RT-350', name: 'Front brake rotor', qty: 8, received: 0, unitCost: 68.5 },
    { sku: 'BRK-FR-350', name: 'Front brake pad set', qty: 6, received: 4, unitCost: 54 },
  ]}
  onReceive={(received) => api.receiveStock(received)}
/>
```

## Anatomy

```tsx
import { PurchaseOrderCard, type POLine } from '@/components/fleet/purchase-order-card';

// status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received'
// onReceive gets only what was booked this time: { 'BRK-RT-350': 4 }. The card works out the new status.
<PurchaseOrderCard id={id} supplier={supplier} status={status} lines={lines} onReceive={receive} />
```

## Examples

### Fully received

```tsx
<PurchaseOrderCard id="PO-1179" supplier="Lubeco" status="received" lines={lines.map((l) => ({ ...l, received: l.qty }))} />
```

## API reference

#### PurchaseOrderCard

A purchase order and its deliveries.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | The order number. |
| `supplier` | `string` | — | Who it is with. |
| `status` | `POStatus` | — | draft, sent, confirmed, partial or received. |
| `eta` | `string` | — | ISO date the delivery is expected. |
| `lines` | `POLine[]` | — | sku, name, qty, received and unitCost. |
| `currency` | `string` | `'USD'` | An ISO currency code, used to format money. |
| `onReceive` | `(received: Record<string, number>) => void` | — | Called with what was booked in: sku to quantity. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the current step. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/purchase-order-card.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate, formatMoney } from './fleet-kit';

export type POStatus = 'draft' | 'sent' | 'confirmed' | 'partial' | 'received';

export interface POLine {
  sku: string;
  name: string;
  qty: number;
  received: number;
  unitCost: number;
}

const STEPS: { id: POStatus; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'partial', label: 'Part received' },
  { id: 'received', label: 'Received' },
];

/** PurchaseOrderCard — an order to a supplier: its status, what has arrived, and a way to book in a delivery. */
export function PurchaseOrderCard({
  id,
  supplier,
  status: initialStatus,
  eta,
  lines,
  currency = 'USD',
  onReceive,
  accentColor = '#ec4899',
  className,
}: {
  id: string;
  supplier: string;
  status: POStatus;
  /** ISO date the delivery is expected. */
  eta?: string;
  lines: POLine[];
  currency?: string;
  /** Called with what was booked in this time: sku to quantity. */
  onReceive?: (received: Record<string, number>) => void;
  accentColor?: string;
  className?: string;
}) {
  const [received, setReceived] = React.useState<Record<string, number>>(() => Object.fromEntries(lines.map((line) => [line.sku, line.received])));
  const [entry, setEntry] = React.useState<Record<string, string>>({});

  const outstanding = lines.map((line) => ({ line, left: line.qty - received[line.sku] }));
  const allIn = outstanding.every((item) => item.left <= 0);
  const anyIn = lines.some((line) => received[line.sku] > 0);
  const status: POStatus = allIn ? 'received' : anyIn ? 'partial' : initialStatus === 'received' || initialStatus === 'partial' ? 'confirmed' : initialStatus;
  const stepIndex = STEPS.findIndex((step) => step.id === status);
  const total = lines.reduce((sum, line) => sum + line.qty * line.unitCost, 0);

  const book = (skus: string[]) => {
    const booked: Record<string, number> = {};
    const next = { ...received };
    outstanding.forEach(({ line, left }) => {
      if (!skus.includes(line.sku) || left <= 0) return;
      const wanted = entry[line.sku] === undefined || entry[line.sku] === '' ? left : Math.min(left, Math.max(0, Number(entry[line.sku]) || 0));
      if (wanted > 0) {
        booked[line.sku] = wanted;
        next[line.sku] += wanted;
      }
    });
    if (!Object.keys(booked).length) return;
    setReceived(next);
    setEntry({});
    onReceive?.(booked);
  };

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">{id}</p>
          <h3 className="mt-0.5 truncate text-base font-bold">{supplier}</h3>
          {eta ? <p className="mt-0.5 text-sm text-muted-foreground">{allIn ? 'Delivered' : `Expected ${formatDate(eta, { day: 'numeric', month: 'short' })}`}</p> : null}
        </div>
        <p className="shrink-0 font-mono text-lg font-semibold tabular-nums">{formatMoney(total, currency)}</p>
      </div>

      <ol className="grid grid-cols-5 gap-1 px-4 pb-3" aria-label="Order status">
        {STEPS.map((step, index) => (
          <li key={step.id} className="space-y-1">
            <span className="block h-1 rounded-full" style={{ background: index < stepIndex ? '#2e2e2e' : index === stepIndex ? accentColor : 'var(--muted)' }} />
            <span className={cn('hidden truncate text-[10px] sm:block', index === stepIndex ? 'font-semibold' : 'text-muted-foreground')}>{step.label}</span>
          </li>
        ))}
      </ol>
      <p className="px-4 pb-3 text-xs font-semibold sm:hidden">{STEPS[stepIndex].label}</p>

      <ul className="divide-y border-t">
        {outstanding.map(({ line, left }) => (
          <li key={line.sku} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{line.name}</p>
              <p className="font-mono text-xs tabular-nums text-muted-foreground">
                {line.sku} · {formatMoney(line.unitCost, currency, 2)} each
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-sm tabular-nums">
                <span className={left <= 0 ? 'font-semibold' : undefined}>{received[line.sku]}</span>
                <span className="text-muted-foreground"> / {line.qty}</span>
              </p>
              {left > 0 ? (
                <input
                  value={entry[line.sku] ?? ''}
                  onChange={(event) => setEntry((current) => ({ ...current, [line.sku]: event.target.value }))}
                  inputMode="numeric"
                  placeholder={`${left}`}
                  aria-label={`Quantity received for ${line.name}`}
                  className="mt-1 h-7 w-14 rounded border bg-transparent px-1.5 text-right font-mono text-xs tabular-nums"
                />
              ) : (
                <Check className="ml-auto mt-1 size-4" />
              )}
            </div>
          </li>
        ))}
      </ul>

      {!allIn ? (
        <div className="flex items-center justify-between gap-3 border-t p-3">
          <p className="text-xs text-muted-foreground">Leave a box empty to receive what is outstanding.</p>
          <Button size="sm" onClick={() => book(lines.map((line) => line.sku))}>
            <PackageCheck /> Receive
          </Button>
        </div>
      ) : (
        <p className="flex items-center justify-center gap-1.5 border-t px-4 py-3 text-sm text-muted-foreground">
          <Check className="size-4" /> Everything has arrived
        </p>
      )}
    </Card>
  );
}
```
