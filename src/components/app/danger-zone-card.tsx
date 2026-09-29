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
