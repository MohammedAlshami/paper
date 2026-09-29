# StockAdjustDialog

Change a quantity, say why, and see the new total before saving.

A dialog for counting, writing off or topping up stock. It shows the quantity now, the change and the new total side by side, takes a step or a typed amount, asks for a reason, and never lets the total go below zero. onConfirm can be async.

**Category:** Forms and feedback · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button dialog input label select
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/stock-adjust-dialog.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/stock-adjust-dialog.tsx`, `src/components/app/app-kit.ts`

## Usage

```tsx
<StockAdjustDialog
  open={open}
  onOpenChange={setOpen}
  subject="Cast iron skillet, 26 cm"
  location="Warehouse"
  current={42}
  onConfirm={({ delta, reason }) => adjustStock('p-01', 'warehouse', delta, reason)}
/>
```

## Anatomy

```tsx
import { StockAdjustDialog, type StockAdjustment } from '@/components/app/stock-adjust-dialog';

// delta is signed: +12 adds twelve, -3 removes three. reason is one of the strings in `reasons`.
<StockAdjustDialog open={open} onOpenChange={setOpen} subject={name} current={onHand} onConfirm={save} />
```

## Examples

### Custom reasons

```tsx
<StockAdjustDialog open={open} onOpenChange={setOpen} subject="Oil filter" current={9} unit="filters" reasons={['Used in a repair', 'Damaged', 'Stock take']} onConfirm={save} />
```

## API reference

#### StockAdjustDialog

Closing is blocked while onConfirm is running.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Whether the dialog is open. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when it opens or closes. |
| `title` | `string` | `'Adjust stock'` | The dialog heading. |
| `subject` | `string` | — | What is being adjusted, such as a product name. |
| `location` | `string` | — | Where, shown after the subject. |
| `current` | `number` | — | The quantity now. |
| `unit` | `string` | `'units'` | Unit word in the amount label. |
| `reasons` | `string[]` | `Cycle count, Damaged, Received, Transferred, Returned, Lost` | Choices for the reason select. |
| `onConfirm` | `(adjustment: { delta: number; reason: string }) => void \| Promise<void>` | — | Runs on save with the signed change and the reason. |
| `accentColor` | `string` | `'#ec4899'` | Colour of a negative change and an invalid total. |

#### StockAdjustPanel

The form inside the dialog, for placing in your own layout.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `current` | `number` | — | The quantity now. |
| `unit` | `string` | `'units'` | Unit word in the amount label. |
| `reasons` | `string[]` | — | Choices for the reason select. |
| `onConfirm` | `(adjustment: { delta: number; reason: string }) => void \| Promise<void>` | — | Runs on save. |
| `onClose` | `() => void` | — | Called by Cancel, and after a successful save. |
| `accentColor` | `string` | `'#ec4899'` | Colour of a negative change and an invalid total. |

## Source

`src/components/app/stock-adjust-dialog.tsx`

```tsx
'use client';

import * as React from 'react';
import { LoaderCircle, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumber } from './app-kit';

export interface StockAdjustment {
  /** Units to add (positive) or remove (negative). */
  delta: number;
  reason: string;
}

const DEFAULT_REASONS = ['Cycle count', 'Damaged', 'Received', 'Transferred', 'Returned', 'Lost'];

export interface StockAdjustPanelProps {
  /** The quantity now. */
  current: number;
  unit?: string;
  reasons?: string[];
  onConfirm: (adjustment: StockAdjustment) => void | Promise<void>;
  /** Called by the Cancel button, and after a successful save. */
  onClose: () => void;
  accentColor?: string;
}

/** The form inside StockAdjustDialog, usable on its own: now, change and new total; a step or typed amount; a reason. */
export function StockAdjustPanel({ current, unit = 'units', reasons = DEFAULT_REASONS, onConfirm, onClose, accentColor = '#ec4899' }: StockAdjustPanelProps) {
  const [delta, setDelta] = React.useState(0);
  const [reason, setReason] = React.useState(reasons[0] ?? '');
  const [busy, setBusy] = React.useState(false);

  const next = current + delta;
  const invalid = next < 0;
  const set = (value: number) => setDelta(Math.max(-current, Math.round(value)));

  const submit = async () => {
    if (!delta || invalid) return;
    setBusy(true);
    try {
      await onConfirm({ delta, reason });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-3 rounded-lg border p-3 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Now</p>
          <p className="font-mono text-lg font-semibold tabular-nums">{formatNumber(current)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Change</p>
          <p className="font-mono text-lg font-semibold tabular-nums" style={delta < 0 ? { color: accentColor } : undefined}>
            {delta > 0 ? '+' : delta < 0 ? '−' : ''}
            {formatNumber(Math.abs(delta))}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">New total</p>
          <p className="font-mono text-lg font-semibold tabular-nums" style={invalid ? { color: accentColor } : undefined}>
            {formatNumber(Math.max(0, next))}
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="stock-adjust-amount">Add or remove ({unit})</Label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" aria-label="Remove one" onClick={() => set(delta - 1)} disabled={next <= 0}>
            <Minus />
          </Button>
          <Input id="stock-adjust-amount" type="number" inputMode="numeric" value={delta} onChange={(event) => set(Number(event.target.value) || 0)} className="text-center font-mono tabular-nums" />
          <Button type="button" variant="outline" size="icon" aria-label="Add one" onClick={() => set(delta + 1)}>
            <Plus />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[-10, -5, 5, 10, 25].map((step) => (
            <Button key={step} type="button" variant="ghost" size="xs" onClick={() => set(delta + step)} disabled={step < 0 && current + delta + step < 0}>
              {step > 0 ? `+${step}` : `−${Math.abs(step)}`}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="stock-adjust-reason">Reason</Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger id="stock-adjust-reason" className="w-full">
            <SelectValue placeholder="Choose a reason" />
          </SelectTrigger>
          <SelectContent>
            {reasons.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!delta || invalid || busy}>
          {busy ? <LoaderCircle className="animate-spin" /> : null} Save adjustment
        </Button>
      </div>
    </div>
  );
}

/**
 * StockAdjustDialog — change a quantity by a step or a typed amount, say why, and see the new total before you save.
 * It never lets the total go below zero. onConfirm may be async; the button shows a spinner until it settles.
 */
export function StockAdjustDialog({
  open,
  onOpenChange,
  title = 'Adjust stock',
  subject,
  location,
  ...panel
}: Omit<StockAdjustPanelProps, 'onClose'> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /** What is being adjusted, e.g. a product name. */
  subject: string;
  /** Where, e.g. "Warehouse". */
  location?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {subject}
            {location ? ` · ${location}` : ''}
          </DialogDescription>
        </DialogHeader>
        <StockAdjustPanel {...panel} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
```
