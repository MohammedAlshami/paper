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
