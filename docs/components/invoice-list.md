# InvoiceList

Past invoices, their status, and a download button.

One row per invoice: what it was for, the number and date, a status badge, the amount in mono, and a download icon. Failed invoices are drawn in the accent colour so they cannot be missed.

**Category:** Billing and teams · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge button card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/invoice-list.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/invoice-list.tsx`, `src/components/app/app-kit.ts`

## Usage

```tsx
<InvoiceList
  invoices={[
    { id: 'i1', number: 'INV-2026-0009', date: '2026-09-01', amount: 624, status: 'open', description: 'Growth plan, 24 seats' },
    { id: 'i2', number: 'INV-2026-0008', date: '2026-08-01', amount: 624, status: 'paid' },
  ]}
  onDownload={(invoice) => download(invoice.id)}
/>
```

## Anatomy

```tsx
import { InvoiceList, type Invoice } from '@/components/app/invoice-list';

// status is 'paid' | 'open' | 'failed' | 'refunded'.
<InvoiceList invoices={invoices} onDownload={(invoice) => window.open(invoice.pdfUrl)} />
```

## Examples

### Paid only

```tsx
<InvoiceList invoices={invoices.filter((invoice) => invoice.status === 'paid')} />
```

## API reference

#### InvoiceList

A card of invoice rows.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `invoices` | `Invoice[]` | — | id, number, date, amount, status and an optional description. |
| `currency` | `string` | `'USD'` | An ISO currency code, used to format money. |
| `onDownload` | `(invoice) => void` | — | Called by the download button. |
| `accentColor` | `string` | `'#ec4899'` | Colour of failed invoices. Inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/invoice-list.tsx`

```tsx
'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate, formatMoney } from './app-kit';

export type InvoiceStatus = 'paid' | 'open' | 'failed' | 'refunded';

export interface Invoice {
  id: string;
  number: string;
  /** ISO date. */
  date: string;
  amount: number;
  status: InvoiceStatus;
  description?: string;
}

const STATUS_LABEL: Record<InvoiceStatus, string> = { paid: 'Paid', open: 'Open', failed: 'Failed', refunded: 'Refunded' };

/** InvoiceList — past invoices with their status and a download button. Failed ones take the accent colour. */
export function InvoiceList({
  invoices,
  currency = 'USD',
  onDownload,
  accentColor = '#ec4899',
  className,
}: {
  invoices: Invoice[];
  currency?: string;
  onDownload?: (invoice: Invoice) => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <ul className="divide-y">
        {invoices.map((invoice) => (
          <li key={invoice.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{invoice.description ?? invoice.number}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {invoice.number} · {formatDate(invoice.date)}
              </p>
            </div>
            <Badge variant={invoice.status === 'paid' ? 'outline' : invoice.status === 'open' ? 'secondary' : 'outline'} className={invoice.status === 'failed' ? 'border-transparent text-white' : undefined} style={invoice.status === 'failed' ? { background: accentColor } : undefined}>
              {STATUS_LABEL[invoice.status]}
            </Badge>
            <span className="w-20 text-right font-mono text-sm tabular-nums">{formatMoney(invoice.amount, currency, 2)}</span>
            <Button variant="ghost" size="icon-sm" aria-label={`Download ${invoice.number}`} onClick={() => onDownload?.(invoice)}>
              <Download />
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
```
