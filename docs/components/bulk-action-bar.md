# BulkActionBar

Appears when rows are selected: how many, and what to do with them.

A dark bar that floats at the bottom of a list once the count is above zero, with the actions you offer and a way to clear the selection. It renders nothing at zero, so it can sit permanently at the end of a page.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/bulk-action-bar.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/bulk-action-bar.tsx`

## Usage

```tsx
<BulkActionBar
  count={selected.length}
  noun="orders selected"
  actions={[
    { id: 'pack', label: 'Mark packed', icon: PackageCheck, onSelect: () => pack(selected) },
    { id: 'cancel', label: 'Cancel', icon: Trash2, destructive: true, onSelect: () => cancel(selected) },
  ]}
  onClear={() => setSelected([])}
/>
```

## Anatomy

```tsx
import { BulkActionBar, type BulkAction } from '@/components/app/bulk-action-bar';

// Put it at the end of the page's content; it sticks to the bottom of the scrolling area.
<BulkActionBar count={n} actions={actions} onClear={clear} />
```

## Examples

### One action

```tsx
<BulkActionBar count={3} actions={[{ id: 'export', label: 'Export', onSelect: exportRows }]} />
```

## API reference

#### BulkActionBar

Sticky at the bottom of its scroll container.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `number` | — | How many are selected. The bar is hidden at 0. |
| `noun` | `string` | `'selected'` | Text after the count. |
| `actions` | `BulkAction[]` | — | id, label, icon?, destructive? and onSelect. |
| `onClear` | `() => void` | — | Adds a close button. |
| `className` | `string` | — | Merged onto the root element. |

## Source

`src/components/app/bulk-action-bar.tsx`

```tsx
'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BulkAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  destructive?: boolean;
  onSelect: () => void;
}

/**
 * BulkActionBar — a bar that floats at the bottom of a list once something is selected: how many, what you can do
 * to them, and a way to let go. It renders nothing while the count is zero.
 */
export function BulkActionBar({
  count,
  noun = 'selected',
  actions,
  onClear,
  className,
}: {
  count: number;
  /** Follows the count: "3 selected", "3 orders selected". */
  noun?: string;
  actions: BulkAction[];
  onClear?: () => void;
  className?: string;
}) {
  if (count <= 0) return null;
  return (
    <div role="region" aria-label="Bulk actions" className={cn('sticky bottom-4 z-20 mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-lg border bg-foreground py-2 pr-2 pl-4 text-background shadow-md', className)}>
      <span className="mr-1 text-sm whitespace-nowrap">
        <span className="font-mono tabular-nums">{count}</span> {noun}
      </span>
      {actions.map((action) => (
        <Button key={action.id} size="sm" variant="secondary" onClick={action.onSelect} className={cn(action.destructive && 'text-destructive')}>
          {action.icon ? <action.icon /> : null}
          {action.label}
        </Button>
      ))}
      {onClear ? (
        <Button size="icon-sm" variant="ghost" onClick={onClear} aria-label="Clear selection" className="text-background hover:bg-background/15 hover:text-background">
          <X />
        </Button>
      ) : null}
    </div>
  );
}
```
