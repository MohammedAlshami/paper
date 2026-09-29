# PartDetailPanel

One part: what it fits, who sells it, what it has cost, where it is.

Four tabs: the vehicles the part fits, suppliers by price with a preferred one marked, the price history as a chart with the change since the first entry, and stock by location.

**Category:** Parts and inventory · **Family:** fleet · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge card
```

And the packages the file imports: `recharts lucide-react`

Copy the file below into `src/components/fleet/part-detail-panel.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/fleet/part-detail-panel.tsx`, `src/components/fleet/fleet-kit.ts`

## Usage

```tsx
<PartDetailPanel
  part={{
    sku: 'BRK-FR-350',
    name: 'Front brake pad set, Transit',
    category: 'Brakes',
    fits: [{ vehicle: 'Van 12 · Ford Transit 350', note: '2021' }],
    suppliers: [{ name: 'Northline Parts', unitCost: 54, leadTimeDays: 2, preferred: true }],
    priceHistory: [{ date: '2025-10-01', unitCost: 47 }, { date: '2026-08-01', unitCost: 54 }],
    stock: [{ location: 'Main workshop', onHand: 4, bin: 'A-04-2' }],
  }}
/>
```

## Anatomy

```tsx
import { PartDetailPanel, type PartDetail } from '@/components/fleet/part-detail-panel';

// priceHistory is oldest first. Suppliers are listed cheapest first. defaultTab: 'fit' | 'suppliers' | 'price' | 'stock'
<PartDetailPanel part={part} />
```

## Examples

### The price tab

```tsx
<PartDetailPanel part={part} defaultTab="price" />
```

## API reference

#### PartDetailPanel

A tabbed panel for one part.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `part` | `PartDetail` | — | sku, name, category, description?, fits, suppliers, priceHistory and stock. |
| `currency` | `string` | `'USD'` | An ISO currency code, used to format money. |
| `defaultTab` | `'fit' \| 'suppliers' \| 'price' \| 'stock'` | `'fit'` | The tab shown first. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the preferred badge and the price line. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/part-detail-panel.tsx`

```tsx
'use client';

import * as React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate, formatMoney } from './fleet-kit';

export interface PartDetail {
  sku: string;
  name: string;
  category: string;
  description?: string;
  /** Vehicles this part fits. */
  fits: { vehicle: string; note?: string }[];
  suppliers: { name: string; unitCost: number; leadTimeDays: number; preferred?: boolean }[];
  /** Oldest first. */
  priceHistory: { date: string; unitCost: number }[];
  stock: { location: string; onHand: number; bin?: string }[];
}

type Tab = 'fit' | 'suppliers' | 'price' | 'stock';

/** PartDetailPanel — everything about one part: which vehicles it fits, who sells it, what it has cost, where it is. */
export function PartDetailPanel({
  part,
  currency = 'USD',
  defaultTab = 'fit',
  accentColor = '#ec4899',
  className,
}: {
  part: PartDetail;
  currency?: string;
  defaultTab?: Tab;
  accentColor?: string;
  className?: string;
}) {
  const [tab, setTab] = React.useState<Tab>(defaultTab);
  const total = part.stock.reduce((sum, item) => sum + item.onHand, 0);
  const first = part.priceHistory[0]?.unitCost ?? 0;
  const last = part.priceHistory[part.priceHistory.length - 1]?.unitCost ?? 0;
  const change = first ? Math.round(((last - first) / first) * 100) : 0;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'fit', label: `Fits ${part.fits.length}` },
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'price', label: 'Price' },
    { id: 'stock', label: `Stock ${total}` },
  ];

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="border-b px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold leading-tight">{part.name}</h3>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{part.sku}</p>
          </div>
          <Badge variant="outline">{part.category}</Badge>
        </div>
        {part.description ? <p className="mt-2 text-sm text-muted-foreground">{part.description}</p> : null}
      </div>

      <div className="flex gap-1 overflow-x-auto border-b p-2" role="tablist">
        {tabs.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={cn('shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors', tab === item.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted')}>
            {item.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="min-h-48">
        {tab === 'fit' ? (
          <ul className="divide-y">
            {part.fits.map((item) => (
              <li key={item.vehicle} className="flex items-baseline justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="font-medium">{item.vehicle}</span>
                {item.note ? <span className="text-xs text-muted-foreground">{item.note}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}

        {tab === 'suppliers' ? (
          <ul className="divide-y">
            {[...part.suppliers].sort((a, b) => a.unitCost - b.unitCost).map((supplier) => (
              <li key={supplier.name} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    {supplier.name}
                    {supplier.preferred ? (
                      <Badge className="text-white" style={{ background: accentColor }}>
                        preferred
                      </Badge>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">Delivers in {supplier.leadTimeDays} days</p>
                </div>
                <span className="font-mono text-sm font-semibold tabular-nums">{formatMoney(supplier.unitCost, currency, 2)}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === 'price' ? (
          <div className="p-4">
            <p className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold tabular-nums">{formatMoney(last, currency, 2)}</span>
              <span className="font-mono text-xs tabular-nums" style={change > 0 ? { color: accentColor } : undefined}>
                {change > 0 ? '+' : ''}
                {change}% since {formatDate(part.priceHistory[0].date, { month: 'short', year: 'numeric' })}
              </span>
            </p>
            <div className="mt-2 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={part.priceHistory.map((point) => ({ ...point, label: formatDate(point.date, { month: 'short' }) }))} margin={{ top: 6, right: 6, bottom: 0, left: -20 }}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} tickFormatter={(value) => `$${Math.round(value)}`} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(value) => formatMoney(Number(value), currency, 2)} />
                  <Line type="stepAfter" dataKey="unitCost" name="Unit cost" stroke={accentColor} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}

        {tab === 'stock' ? (
          <ul className="divide-y">
            {part.stock.map((item) => (
              <li key={item.location} className="flex items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="block text-sm font-bold">{item.location}</span>
                  {item.bin ? <span className="block font-mono text-xs text-muted-foreground">bin {item.bin}</span> : null}
                </span>
                <span className="font-mono text-lg font-semibold tabular-nums">{item.onHand}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}
```
