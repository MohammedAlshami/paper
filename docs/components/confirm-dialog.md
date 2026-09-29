# ConfirmDialog

"Are you sure?" for anything that is hard to undo.

A small dialog with a title, a line of explanation and two buttons. onConfirm can be async: the button shows a spinner until it settles, then the dialog closes, or stays open with the error message if it throws.

**Category:** Forms and feedback · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button dialog
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/confirm-dialog.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/confirm-dialog.tsx`

## Usage

```tsx
<ConfirmDialog
  trigger={<Button variant="outline">Cancel order</Button>}
  title="Cancel order #1042?"
  description="The customer will be refunded and the items returned to stock."
  confirmLabel="Cancel order"
  destructive
  onConfirm={async () => { await cancelOrder('o-1042'); }}
/>
```

## Anatomy

```tsx
import { ConfirmDialog } from '@/components/app/confirm-dialog';

// Give it a trigger, or control it yourself with open and onOpenChange.
<ConfirmDialog open={open} onOpenChange={setOpen} title="Delete?" onConfirm={remove} destructive />
```

## Examples

### Controlled

```tsx
<ConfirmDialog open={open} onOpenChange={setOpen} title="Discard changes?" confirmLabel="Discard" onConfirm={discard} />
```

## API reference

#### ConfirmDialog

Closing is blocked while onConfirm is running.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when it opens or closes. |
| `trigger` | `ReactNode` | — | An element that opens the dialog. |
| `title` | `string` | — | The question. |
| `description` | `ReactNode` | — | What will happen. |
| `confirmLabel` | `string` | `'Confirm'` | Text of the confirm button. |
| `cancelLabel` | `string` | `'Cancel'` | Text of the cancel button. |
| `destructive` | `boolean` | `false` | Draw the confirm button as destructive. |
| `onConfirm` | `() => void \| Promise<void>` | — | Runs on confirm; throw to keep the dialog open with a message. |

## Source

`src/components/app/confirm-dialog.tsx`

```tsx
'use client';

import * as React from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

/**
 * ConfirmDialog — "are you sure?" for anything that is hard to undo. onConfirm may be async: the button shows a
 * spinner until it settles, then the dialog closes, or stays open and shows the message if it throws.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** An element that opens the dialog. Leave it out and control `open` yourself. */
  trigger?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as a destructive action. */
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  const [inner, setInner] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isOpen = open ?? inner;

  const setOpen = (next: boolean) => {
    if (busy) return;
    setInner(next);
    onOpenChange?.(next);
    if (!next) setError(null);
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      setBusy(false);
      setInner(false);
      onOpenChange?.(false);
    } catch (thrown) {
      setBusy(false);
      setError(thrown instanceof Error ? thrown.message : 'Something went wrong.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : <DialogDescription className="sr-only">Confirm this action.</DialogDescription>}
        </DialogHeader>
        {error ? <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'destructive' : 'default'} onClick={confirm} disabled={busy}>
            {busy ? <LoaderCircle className="animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```
