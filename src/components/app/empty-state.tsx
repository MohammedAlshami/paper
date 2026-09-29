'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyAction {
  label: string;
  onClick?: () => void;
}

/** EmptyState — for a list with nothing in it yet, or a search with no results: say what is missing and offer the next step. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  bordered = true,
  accentColor = '#ec4899',
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: EmptyAction;
  secondaryAction?: EmptyAction;
  /** Draw a dashed border, for when it fills a panel on its own. */
  bordered?: boolean;
  accentColor?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-4 rounded-xl px-6 py-12 text-center', bordered && 'border border-dashed', className)}>
      {Icon ? (
        <span className="flex size-11 items-center justify-center rounded-full border bg-muted/50">
          <Icon className="size-5" style={{ color: accentColor }} />
        </span>
      ) : null}
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-bold">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action || secondaryAction ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {action ? <Button size="sm" onClick={action.onClick}>{action.label}</Button> : null}
          {secondaryAction ? <Button size="sm" variant="outline" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button> : null}
        </div>
      ) : null}
    </div>
  );
}
