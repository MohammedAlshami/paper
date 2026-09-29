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
