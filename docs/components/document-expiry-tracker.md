# DocumentExpiryTracker

Registration, insurance and inspections, and how long they have left.

Every compliance document soonest first, with days left, a bar for how much of its life remains, and a filter for expired, due soon and valid. Expired ones use the accent colour; a Renew action is optional.

**Category:** Vehicle health and records · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/document-expiry-tracker.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<DocumentExpiryTracker
  documents={[
    { id: 'd1', name: 'Insurance', vehicle: 'Van 21', expiresOn: '2026-09-20', issuedOn: '2025-09-20' },
    { id: 'd2', name: 'Registration', vehicle: 'Truck 02', expiresOn: '2026-10-11', issuedOn: '2025-10-11' },
  ]}
  soonDays={30}
  onRenew={(document) => startRenewal(document)}
/>
```

## Anatomy

```tsx
import { DocumentExpiryTracker, type FleetDocument } from '@/components/fleet/document-expiry-tracker';

// Dates are ISO strings. Pass today in tests and demos so the days left do not change under you.
// issuedOn is optional; with it, each row shows a bar for how much of the document's life is left.
<DocumentExpiryTracker documents={documents} />
```

## Examples

### Only what is valid

```tsx
<DocumentExpiryTracker documents={documents.filter((d) => d.expiresOn > '2027-01-01')} />
```

## API reference

#### DocumentExpiryTracker

Documents sorted by days left.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `documents` | `FleetDocument[]` | — | id, name, vehicle, expiresOn and optionally issuedOn. |
| `today` | `string` | `today` | An ISO date treated as today. |
| `soonDays` | `number` | `30` | Expiring within this many days is flagged "due soon". |
| `onRenew` | `(document: FleetDocument) => void` | — | When set, a Renew button appears on expired and due-soon rows. |
| `accentColor` | `string` | `'#ec4899'` | Colour of expired documents. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/document-expiry-tracker.tsx`

```tsx
'use client';

import * as React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { daysBetween, formatDate, relativeDays } from './fleet-kit';

export interface FleetDocument {
  id: string;
  /** e.g. "Insurance". */
  name: string;
  vehicle: string;
  /** ISO date. */
  expiresOn: string;
  /** When it was issued, so the bar can show how much of its life is left. Optional. */
  issuedOn?: string;
}

type Band = 'expired' | 'soon' | 'ok';

/** DocumentExpiryTracker — registration, insurance and inspection dates, soonest first, with days left. */
export function DocumentExpiryTracker({
  documents,
  today = new Date().toISOString().slice(0, 10),
  soonDays = 30,
  onRenew,
  accentColor = '#ec4899',
  className,
}: {
  documents: FleetDocument[];
  /** ISO date treated as today. Pass it in tests and demos so results do not change. */
  today?: string;
  /** Documents expiring within this many days are flagged. */
  soonDays?: number;
  onRenew?: (document: FleetDocument) => void;
  accentColor?: string;
  className?: string;
}) {
  const [filter, setFilter] = React.useState<'all' | Band>('all');

  const rows = React.useMemo(
    () =>
      documents
        .map((document) => {
          const days = daysBetween(today, document.expiresOn);
          const band: Band = days < 0 ? 'expired' : days <= soonDays ? 'soon' : 'ok';
          const life = document.issuedOn ? Math.max(1, daysBetween(document.issuedOn, document.expiresOn)) : undefined;
          return { document, days, band, left: life ? Math.min(1, Math.max(0, days / life)) : undefined };
        })
        .sort((a, b) => a.days - b.days),
    [documents, today, soonDays],
  );
  const counts = { expired: rows.filter((row) => row.band === 'expired').length, soon: rows.filter((row) => row.band === 'soon').length, ok: rows.filter((row) => row.band === 'ok').length };
  const visible = rows.filter((row) => filter === 'all' || row.band === filter);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-center gap-1.5 border-b p-3">
        {(
          [
            { id: 'all', label: `All ${rows.length}` },
            { id: 'expired', label: `Expired ${counts.expired}` },
            { id: 'soon', label: `Due soon ${counts.soon}` },
            { id: 'ok', label: `Valid ${counts.ok}` },
          ] as const
        ).map((chip) => (
          <button key={chip.id} type="button" onClick={() => setFilter(chip.id)} aria-pressed={filter === chip.id}>
            <Badge variant={filter === chip.id ? 'default' : 'outline'}>{chip.label}</Badge>
          </button>
        ))}
      </div>

      <ul className="divide-y">
        {visible.map(({ document, days, band, left }) => (
          <li key={document.id} className="flex items-center gap-3 px-4 py-3">
            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', band === 'ok' ? 'bg-muted text-muted-foreground' : 'text-white')} style={band === 'ok' ? undefined : { background: band === 'expired' ? accentColor : '#2e2e2e' }}>
              {document.name.toLowerCase().includes('insur') ? <ShieldCheck className="size-4" /> : <FileText className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                <span className="font-bold">{document.name}</span> <span className="text-muted-foreground">· {document.vehicle}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {band === 'expired' ? 'Expired' : 'Expires'} {formatDate(document.expiresOn)}
              </p>
              {left !== undefined ? (
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${Math.round(left * 100)}% of its validity left`}>
                  <div className="h-full rounded-full" style={{ width: `${left * 100}%`, background: band === 'ok' ? '#2e2e2e' : accentColor }} />
                </div>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <p className={cn('font-mono text-sm font-semibold tabular-nums', band === 'ok' && 'text-muted-foreground')} style={band === 'expired' ? { color: accentColor } : undefined}>
                {Math.abs(days)}d
              </p>
              <p className="text-[11px] text-muted-foreground">{relativeDays(days)}</p>
            </div>
            {onRenew && band !== 'ok' ? (
              <button type="button" onClick={() => onRenew(document)} className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted">
                Renew
              </button>
            ) : null}
          </li>
        ))}
        {!visible.length ? <li className="px-4 py-10 text-center text-sm text-muted-foreground">Nothing here.</li> : null}
      </ul>
    </Card>
  );
}
```
