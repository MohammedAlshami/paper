'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Panel — the Card shell every agent-ops surface uses: a hairline-bordered
 * card with no default gap/padding, so header/body/footer control their own.
 */
export function Panel({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn('gap-0 overflow-hidden py-0', className)} {...props} />;
}

/**
 * PanelHeader — the row every panel opens with: a title (with inline count or
 * meta) on the left, filters/actions on the right. Wraps on narrow widths.
 */
export function PanelHeader({
  title,
  right,
  className,
  wrap = true,
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  /** Set false for single-line headers that shouldn't wrap their title/actions apart. */
  wrap?: boolean;
}) {
  return (
    <CardHeader
      className={cn(
        wrap ? 'flex-row flex-wrap items-center justify-between gap-3 py-4' : 'flex-row items-center justify-between gap-3 py-4',
        className,
      )}
    >
      <span className="flex items-center gap-2 text-sm font-medium">{title}</span>
      {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
    </CardHeader>
  );
}

/** PanelBody — zero-padding content well, for a Table or a divide-y list. */
export function PanelBody({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={cn('p-0', className)} {...props} />;
}

/** PanelEmpty — the centered placeholder row shown when a list/table has nothing to show. */
export function PanelEmpty({ children }: { children: React.ReactNode }) {
  return <p className="px-6 py-8 text-center text-sm text-muted-foreground">{children}</p>;
}
