# RepairEstimateTable

A shop’s estimate, line by line: approve or decline each.

Parts and labour lines, each with approve and decline buttons, recommended extras declined by default, and a running total with tax on parts. Declined lines are struck through and the savings shown.

**Category:** Work orders and repairs · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge button card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/repair-estimate-table.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<RepairEstimateTable
  title="Estimate 4417"
  vehicle="Van 21 · 6HJP118"
  shop="Northside Truck Repair"
  lines={[
    { id: 'l1', type: 'part', description: 'Front brake rotors (pair)', qty: 2, unitPrice: 68.5 },
    { id: 'l2', type: 'labor', description: 'Fit rotors and pads', qty: 3.5, unitPrice: 95 },
    { id: 'l3', type: 'part', description: 'Rear brake pad set', qty: 1, unitPrice: 48, optional: true },
  ]}
  taxRate={0.0875}
  onSubmit={(decisions, total) => api.answerEstimate(decisions, total)}
/>
```

## Anatomy

```tsx
import { RepairEstimateTable, type EstimateLine } from '@/components/fleet/repair-estimate-table';

// Lines marked optional start declined; everything else starts approved.
// Tax applies to parts only. decisions is a map of line id to 'approved' | 'declined'.
<RepairEstimateTable title={title} vehicle={vehicle} lines={lines} taxRate={0.0875} />
```

## Examples

### Without recommendations

```tsx
<RepairEstimateTable title="Estimate 4418" vehicle="Van 12" lines={lines.filter((line) => !line.optional)} />
```

## API reference

#### RepairEstimateTable

An estimate you can answer.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Heading. |
| `vehicle` | `string` | — | The vehicle. |
| `shop` | `string` | — | The workshop that wrote it. |
| `lines` | `EstimateLine[]` | — | id, type ("part" or "labor"), description, qty, unitPrice and optional. |
| `taxRate` | `number` | `0` | e.g. 0.08. Applied to parts only. |
| `currency` | `string` | `'USD'` | An ISO currency code, used to format money. |
| `onSubmit` | `(decisions, total: number) => void` | — | Called when Send decision is pressed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of declined lines. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/repair-estimate-table.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatMoney } from './fleet-kit';

export interface EstimateLine {
  id: string;
  type: 'part' | 'labor';
  description: string;
  qty: number;
  unitPrice: number;
  /** Set when the shop recommends it rather than needs it done. */
  optional?: boolean;
}

type Decision = 'approved' | 'declined';

/** RepairEstimateTable — a shop's estimate, line by line: approve or decline each, and watch the total move. */
export function RepairEstimateTable({
  title,
  vehicle,
  shop,
  lines,
  taxRate = 0,
  currency = 'USD',
  onSubmit,
  accentColor = '#ec4899',
  className,
}: {
  title: string;
  vehicle: string;
  shop?: string;
  lines: EstimateLine[];
  /** e.g. 0.08 for 8%. Applied to parts only. */
  taxRate?: number;
  currency?: string;
  onSubmit?: (decisions: Record<string, Decision>, total: number) => void;
  accentColor?: string;
  className?: string;
}) {
  const [decisions, setDecisions] = React.useState<Record<string, Decision>>(() => Object.fromEntries(lines.map((line) => [line.id, line.optional ? 'declined' : 'approved'])));
  const [sent, setSent] = React.useState(false);

  const approved = lines.filter((line) => decisions[line.id] === 'approved');
  const parts = approved.filter((line) => line.type === 'part').reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
  const labor = approved.filter((line) => line.type === 'labor').reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
  const tax = parts * taxRate;
  const total = parts + labor + tax;
  const declinedSavings = lines.filter((line) => decisions[line.id] === 'declined').reduce((sum, line) => sum + line.qty * line.unitPrice, 0);

  const decide = (id: string, decision: Decision) => {
    setSent(false);
    setDecisions((current) => ({ ...current, [id]: decision }));
  };

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="border-b px-4 py-3">
        <h3 className="text-base font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {vehicle}
          {shop ? ` · ${shop}` : ''}
        </p>
      </div>

      <ul className="divide-y">
        {lines.map((line) => {
          const decision = decisions[line.id];
          return (
            <li key={line.id} className={cn('flex items-center gap-3 px-4 py-3', decision === 'declined' && 'bg-muted/40')}>
              <div className={cn('min-w-0 flex-1', decision === 'declined' && 'text-muted-foreground line-through decoration-muted-foreground/40')}>
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {line.description}
                  {line.optional ? (
                    <Badge variant="outline" className="no-underline">
                      recommended
                    </Badge>
                  ) : null}
                </p>
                <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                  {line.type === 'part' ? 'Part' : 'Labour'} · {line.qty} × {formatMoney(line.unitPrice, currency, 2)}
                </p>
              </div>
              <span className="w-20 shrink-0 text-right font-mono text-sm tabular-nums">{formatMoney(line.qty * line.unitPrice, currency, 2)}</span>
              <div className="flex shrink-0 gap-1" role="group" aria-label={`Decision for ${line.description}`}>
                <button type="button" aria-label="Approve" aria-pressed={decision === 'approved'} onClick={() => decide(line.id, 'approved')} className={cn('flex size-8 items-center justify-center rounded-md border transition-colors', decision === 'approved' ? 'border-transparent bg-foreground text-background' : 'hover:bg-muted')}>
                  <Check className="size-4" />
                </button>
                <button type="button" aria-label="Decline" aria-pressed={decision === 'declined'} onClick={() => decide(line.id, 'declined')} className={cn('flex size-8 items-center justify-center rounded-md border transition-colors', decision === 'declined' ? 'border-transparent text-white' : 'hover:bg-muted')} style={decision === 'declined' ? { background: accentColor } : undefined}>
                  <X className="size-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <dl className="space-y-1 border-t px-4 py-3 text-sm">
        {[
          { label: 'Parts', value: parts },
          { label: 'Labour', value: labor },
          ...(taxRate ? [{ label: `Tax on parts (${+(taxRate * 100).toFixed(2)}%)`, value: tax }] : []),
        ].map((row) => (
          <div key={row.label} className="flex justify-between text-muted-foreground">
            <dt>{row.label}</dt>
            <dd className="font-mono tabular-nums">{formatMoney(row.value, currency, 2)}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between border-t pt-2">
          <dt className="font-bold">Approved total</dt>
          <dd className="font-mono text-xl font-semibold tabular-nums">{formatMoney(total, currency, 2)}</dd>
        </div>
        {declinedSavings ? <p className="text-right text-xs text-muted-foreground">{formatMoney(declinedSavings, currency, 2)} declined</p> : null}
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t p-3">
        <Button size="sm" variant="ghost" onClick={() => setDecisions(Object.fromEntries(lines.map((line) => [line.id, 'approved'])))}>
          Approve all
        </Button>
        <div className="flex items-center gap-3">
          {sent ? <span className="text-xs text-muted-foreground">Sent to the shop</span> : null}
          <Button
            onClick={() => {
              setSent(true);
              onSubmit?.(decisions, total);
            }}
          >
            Send decision
          </Button>
        </div>
      </div>
    </Card>
  );
}
```
