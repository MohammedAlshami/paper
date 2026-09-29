# VehicleSpecSheet

The facts about a vehicle, grouped so they can be found.

Identity, powertrain, capacity and compliance details in labelled groups. Rows marked copyable, like the VIN and plate, are set in mono with a copy button that appears on hover.

**Category:** Vehicle health and records · **Family:** fleet · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/vehicle-spec-sheet.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/fleet/vehicle-spec-sheet.tsx`

## Usage

```tsx
<VehicleSpecSheet
  title="Van 12"
  subtitle="2021 Ford Transit 350 · 148,210 km"
  groups={[
    { title: 'Identity', rows: [{ label: 'Plate', value: '8KTR204', copyable: true }, { label: 'VIN', value: '1FTBW2CM5MKA48213', copyable: true }] },
    { title: 'Capacity', rows: [{ label: 'Payload', value: '1,470 kg' }, { label: 'Fuel tank', value: '95 L' }] },
  ]}
/>
```

## Anatomy

```tsx
import { VehicleSpecSheet, type SpecGroup } from '@/components/fleet/vehicle-spec-sheet';

// Values are strings, already formatted. Groups lay out in two columns once the card is wide enough
// and stack below that, so it works in a narrow side panel too.
<VehicleSpecSheet title={name} groups={groups} />
```

## Examples

### Two groups only

```tsx
<VehicleSpecSheet title="Pickup 09" subtitle="2021 Toyota Tacoma" groups={groups.slice(0, 2)} />
```

## API reference

#### VehicleSpecSheet

Grouped key-value details.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | The vehicle name. |
| `subtitle` | `string` | — | e.g. year, model and odometer. |
| `groups` | `SpecGroup[]` | — | A title and rows: label, value and an optional copyable flag. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/vehicle-spec-sheet.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SpecRow {
  label: string;
  value: string;
  /** Set in the mono font and given a copy button, for VINs, plates and part numbers. */
  copyable?: boolean;
}

export interface SpecGroup {
  title: string;
  rows: SpecRow[];
}

function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${value}`}
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="group inline-flex max-w-full items-center gap-1.5 rounded font-mono text-sm tabular-nums hover:text-foreground"
    >
      {/* The icon sits before the value, so the value stays flush right with the rows around it. */}
      {copied ? <Check className="size-3.5 shrink-0" /> : <Copy className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />}
      <span className="truncate">{value}</span>
    </button>
  );
}

/** VehicleSpecSheet — the facts about a vehicle, grouped: identity, powertrain, capacity, compliance. */
export function VehicleSpecSheet({
  title,
  subtitle,
  groups,
  className,
}: {
  title: string;
  subtitle?: string;
  groups: SpecGroup[];
  className?: string;
}) {
  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <div className="border-b px-4 py-3">
        <h3 className="text-base font-bold">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="grid grid-cols-1 divide-y @lg:grid-cols-2 @lg:divide-x @lg:divide-y-0">
        {groups.map((group, index) => (
          <section key={group.title} className={cn('px-4 py-3', index >= 2 && '@lg:border-t')}>
            <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group.title}</h4>
            <dl>
              {group.rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-dashed py-2 last:border-b-0">
                  <dt className="shrink-0 text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="min-w-0 text-right text-sm font-medium">{row.copyable ? <CopyValue value={row.value} /> : row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Card>
  );
}
```
