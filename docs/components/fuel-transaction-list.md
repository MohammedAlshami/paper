# FuelTransactionList

Fuel card purchases, with anything odd flagged and explained.

Totals for spend, litres and flagged purchases, then the purchases newest first. Flagged ones say why: more than the tank holds, the vehicle was parked, far from the route, or a possible duplicate. Mark each reviewed.

**Category:** Tyres, fuel and fluids · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/fuel-transaction-list.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<FuelTransactionList
  transactions={[
    { id: 'f1', date: '2026-09-28', time: '07:42', station: 'Shell, Cesar Chavez St', vehicle: 'Van 12', litres: 61.4, total: 103.2 },
    { id: 'f2', date: '2026-09-28', time: '14:05', station: 'Chevron, Van Ness Ave', vehicle: 'Van 21', litres: 118.7, total: 199.5, flags: ['over-capacity'] },
  ]}
  onReview={(transaction) => api.markReviewed(transaction.id)}
/>
```

## Anatomy

```tsx
import { FuelTransactionList, type FuelTransaction } from '@/components/fleet/fuel-transaction-list';

// flags: 'over-capacity' | 'while-idle' | 'off-route' | 'duplicate'
// Working out the flags is yours: compare against tank size, telematics and the fuel card feed.
<FuelTransactionList transactions={transactions} />
```

## Examples

### Nothing flagged

```tsx
<FuelTransactionList transactions={transactions.filter((tx) => !tx.flags)} />
```

## API reference

#### FuelTransactionList

Purchases and their flags.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `transactions` | `FuelTransaction[]` | — | id, date, station, vehicle, litres, total and optionally time, odometerKm and flags. |
| `currency` | `string` | `'USD'` | An ISO currency code, used to format money. |
| `onReview` | `(transaction: FuelTransaction) => void` | — | Called when a flagged purchase is marked reviewed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of flagged purchases. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/fuel-transaction-list.tsx`

```tsx
'use client';

import * as React from 'react';
import { Fuel, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate, formatMoney, formatNumber } from './fleet-kit';

export type FuelFlag = 'over-capacity' | 'while-idle' | 'off-route' | 'duplicate';

export interface FuelTransaction {
  id: string;
  /** ISO date. */
  date: string;
  time?: string;
  station: string;
  vehicle: string;
  litres: number;
  total: number;
  odometerKm?: number;
  flags?: FuelFlag[];
}

const FLAG_TEXT: Record<FuelFlag, { label: string; explain: string }> = {
  'over-capacity': { label: 'More than the tank holds', explain: 'The litres bought are more than this vehicle’s tank.' },
  'while-idle': { label: 'Vehicle was parked', explain: 'The tracker shows the vehicle was not at the pump.' },
  'off-route': { label: 'Far from the route', explain: 'The station is well away from where the vehicle was working.' },
  duplicate: { label: 'Possible duplicate', explain: 'Same card, station and amount within minutes.' },
};

/** FuelTransactionList — fuel card purchases, newest first, with anything that looks wrong flagged and explained. */
export function FuelTransactionList({
  transactions,
  currency = 'USD',
  onReview,
  accentColor = '#ec4899',
  className,
}: {
  transactions: FuelTransaction[];
  currency?: string;
  /** Called when a flagged purchase is marked as reviewed. */
  onReview?: (transaction: FuelTransaction) => void;
  accentColor?: string;
  className?: string;
}) {
  const [flaggedOnly, setFlaggedOnly] = React.useState(false);
  const [reviewed, setReviewed] = React.useState<string[]>([]);

  const rows = transactions.filter((tx) => !flaggedOnly || (tx.flags?.length && !reviewed.includes(tx.id))).sort((a, b) => `${b.date}${b.time ?? ''}`.localeCompare(`${a.date}${a.time ?? ''}`));
  const flagged = transactions.filter((tx) => tx.flags?.length && !reviewed.includes(tx.id));
  const total = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const atRisk = flagged.reduce((sum, tx) => sum + tx.total, 0);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <dl className="grid grid-cols-3 divide-x border-b">
        {[
          { label: 'Spent', value: formatMoney(total, currency) },
          { label: 'Litres', value: formatNumber(transactions.reduce((sum, tx) => sum + tx.litres, 0)) },
          { label: 'Flagged', value: `${flagged.length} · ${formatMoney(atRisk, currency)}`, accent: flagged.length > 0 },
        ].map((cell) => (
          <div key={cell.label} className="px-4 py-3">
            <dt className="text-xs text-muted-foreground">{cell.label}</dt>
            <dd className="mt-0.5 truncate font-mono text-base font-semibold tabular-nums" style={cell.accent ? { color: accentColor } : undefined}>
              {cell.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <button type="button" onClick={() => setFlaggedOnly((value) => !value)} aria-pressed={flaggedOnly}>
          <Badge variant={flaggedOnly ? 'default' : 'outline'}>Flagged only</Badge>
        </button>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{rows.length} purchases</span>
      </div>

      <ul className="divide-y">
        {rows.map((tx) => {
          const open = tx.flags?.length && !reviewed.includes(tx.id);
          return (
            <li key={tx.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', open ? 'text-white' : 'bg-muted text-muted-foreground')} style={open ? { background: accentColor } : undefined}>
                  {open ? <TriangleAlert className="size-4" /> : <Fuel className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-bold">{tx.vehicle}</span> <span className="text-muted-foreground">· {tx.station}</span>
                  </p>
                  <p className="font-mono text-xs tabular-nums text-muted-foreground">
                    {formatDate(tx.date, { day: 'numeric', month: 'short' })}
                    {tx.time ? ` ${tx.time}` : ''} · {tx.litres.toFixed(1)} L
                    {tx.odometerKm !== undefined ? ` · ${formatNumber(tx.odometerKm)} km` : ''}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-sm font-semibold tabular-nums">{formatMoney(tx.total, currency, 2)}</span>
              </div>
              {open ? (
                <div className="mt-2 space-y-1.5 pl-11">
                  {tx.flags!.map((flag) => (
                    <p key={flag} className="text-xs">
                      <span className="font-bold">{FLAG_TEXT[flag].label}.</span> <span className="text-muted-foreground">{FLAG_TEXT[flag].explain}</span>
                    </p>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setReviewed((current) => [...current, tx.id]);
                      onReview?.(tx);
                    }}
                    className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    Mark reviewed
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
        {!rows.length ? <li className="px-4 py-10 text-center text-sm text-muted-foreground">Nothing flagged.</li> : null}
      </ul>
    </Card>
  );
}
```
