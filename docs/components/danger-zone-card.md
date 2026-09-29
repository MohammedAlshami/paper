# DangerZoneCard

Irreversible actions, each behind a confirmation.

A card outlined in the destructive colour that lists actions such as deleting a workspace. Each opens a dialog; give an action a confirm phrase and the button stays disabled until it is typed exactly.

**Category:** Authentication and account · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button card dialog input label
```

Copy the file below into `src/components/app/danger-zone-card.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<DangerZoneCard
  actions={[
    { id: 'transfer', title: 'Transfer ownership', description: 'Hand this workspace to another member.', actionLabel: 'Transfer' },
    { id: 'delete', title: 'Delete workspace', description: 'Removes every customer, invoice and file. This cannot be undone.', actionLabel: 'Delete workspace', confirmPhrase: 'northwind' },
  ]}
  onConfirm={(action) => run(action.id)}
/>
```

## Anatomy

```tsx
import { DangerZoneCard, type DangerAction } from '@/components/app/danger-zone-card';

// confirmPhrase is optional. Without it the dialog just asks to confirm.
<DangerZoneCard actions={actions} onConfirm={(action) => run(action)} />
```

## Examples

### One action, no phrase

```tsx
<DangerZoneCard actions={[{ id: 'reset', title: 'Reset data', description: 'Clears demo data.', actionLabel: 'Reset' }]} />
```

## API reference

#### DangerZoneCard

A list of destructive actions.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `actions` | `DangerAction[]` | — | id, title, description, actionLabel and an optional confirmPhrase. |
| `onConfirm` | `(action) => void` | — | Called after the dialog is confirmed. |
| `title` | `string` | `'Danger zone'` | The card heading. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/danger-zone-card.tsx`

```tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface DangerAction {
  id: string;
  title: string;
  description: string;
  /** The button label, e.g. "Delete workspace". */
  actionLabel: string;
  /** When set, the person must type this exactly before the action is enabled. */
  confirmPhrase?: string;
}

/** DangerZoneCard — the irreversible actions of an account, each behind a confirmation dialog that can ask you to type a phrase. */
export function DangerZoneCard({
  actions,
  onConfirm,
  title = 'Danger zone',
  className,
}: {
  actions: DangerAction[];
  onConfirm?: (action: DangerAction) => void;
  title?: string;
  className?: string;
}) {
  const [pending, setPending] = React.useState<DangerAction | null>(null);
  const [typed, setTyped] = React.useState('');

  const close = () => {
    setPending(null);
    setTyped('');
  };
  const allowed = !pending?.confirmPhrase || typed === pending.confirmPhrase;

  return (
    <Card className={cn('gap-0 overflow-hidden border-destructive/40 py-0', className)}>
      <div className="border-b border-destructive/30 px-4 py-3">
        <p className="text-sm font-bold text-destructive">{title}</p>
      </div>
      <ul className="divide-y">
        {actions.map((action) => (
          <li key={action.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium">{action.title}</p>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
            <Button variant="outline" className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setPending(action)}>
              {action.actionLabel}
            </Button>
          </li>
        ))}
      </ul>

      <Dialog open={Boolean(pending)} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pending?.title}</DialogTitle>
            <DialogDescription>{pending?.description}</DialogDescription>
          </DialogHeader>
          {pending?.confirmPhrase ? (
            <div className="grid gap-2">
              <Label htmlFor="danger-confirm">
                Type <span className="font-mono font-semibold">{pending.confirmPhrase}</span> to confirm
              </Label>
              <Input id="danger-confirm" value={typed} onChange={(event) => setTyped(event.target.value)} autoComplete="off" />
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!allowed}
              onClick={() => {
                if (pending) onConfirm?.(pending);
                close();
              }}
            >
              {pending?.actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
```
