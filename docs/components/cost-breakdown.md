# CostBreakdown

Where the money went, by day and by step.

Stacked daily bars broken down by model or step, drawn in shades of one colour so the shape is readable without a legend lookup, plus the totals per category.

**Category:** Cost & limits · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card table
```

Copy the file below into `src/components/agent-ops/cost-breakdown.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<CostBreakdown
  title="Model"
  window="Last 7 days"
  buckets={buckets}
  rows={rows}
/>
```

## Anatomy

```tsx
import { CostBreakdown } from '@/components/agent-ops/cost-breakdown';

// CostBucket: { label, segments: [{ name, value }] }  ·  CostRow: { name, cost, tokens?, runs? }
<CostBreakdown buckets={buckets} rows={rows} />
```

## Examples

### Seven days by model

```tsx
<CostBreakdown title="Model" buckets={buckets} rows={rows} />
```

## API reference

#### CostBreakdown

Segment names are collected across buckets and assigned shades in order.

| Prop | Type | Description |
| --- | --- | --- |
| `buckets` | `CostBucket[]` | label plus segments (name, value). |
| `rows` | `CostRow[]` | name, cost, tokens?, runs? — the summary table. |
| `total` | `number` | Overrides the summed total. |
| `title / window` | `string` | Header labels. title is also the first column name. |

## Source

`src/components/agent-ops/cost-breakdown.tsx`

```tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface CostSegment {
  name: string;
  value: number;
}

export interface CostBucket {
  label: string;
  segments: CostSegment[];
}

export interface CostRow {
  name: string;
  cost: number;
  tokens?: number;
  runs?: number;
}

/** Monochrome shades, lightest last — cost is read by height and shade, not hue. */
const SHADES = [1, 0.72, 0.5, 0.32, 0.18];

/** CostBreakdown — where the money went, by day and by model. */
export function CostBreakdown({
  title = 'Cost',
  total,
  window,
  buckets,
  rows,
  className,
}: {
  title?: string;
  total?: number;
  window?: string;
  buckets: CostBucket[];
  rows: CostRow[];
  className?: string;
}) {
  const names = Array.from(new Set(buckets.flatMap((bucket) => bucket.segments.map((segment) => segment.name))));
  const max = Math.max(...buckets.map((bucket) => bucket.segments.reduce((sum, segment) => sum + segment.value, 0)), 0.0001);
  const sum = total ?? rows.reduce((accumulator, row) => accumulator + row.cost, 0);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          ${sum.toFixed(2)}
          {window ? ` · ${window}` : ''}
        </span>
      </CardHeader>

      <CardContent className="space-y-6 py-4">
        <div>
          <div className="flex h-32 items-stretch gap-1">
            {buckets.map((bucket) => (
              <div key={bucket.label} className="group flex h-full min-w-0 flex-1 flex-col justify-end">
                {bucket.segments.map((segment, index) => {
                  const shade = SHADES[names.indexOf(segment.name) % SHADES.length];
                  return (
                    <div
                      key={segment.name}
                      className="w-full bg-primary"
                      style={{
                        height: `${(segment.value / max) * 100}%`,
                        opacity: shade,
                        borderTopLeftRadius: index === 0 ? 2 : 0,
                        borderTopRightRadius: index === 0 ? 2 : 0,
                      }}
                      title={`${bucket.label} · ${segment.name}: $${segment.value.toFixed(2)}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {names.map((name, index) => (
              <span key={name} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <span
                  className="size-2 rounded-[2px] bg-primary"
                  style={{ opacity: SHADES[index % SHADES.length] }}
                  aria-hidden
                />
                {name}
              </span>
            ))}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{title}</TableHead>
              <TableHead className="text-right">Runs</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">{row.runs ?? '—'}</TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {row.tokens ? row.tokens.toLocaleString() : '—'}
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular-nums">${row.cost.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {sum ? `${Math.round((row.cost / sum) * 100)}%` : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```
