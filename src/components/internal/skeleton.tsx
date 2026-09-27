import * as React from 'react';
import { cn } from '@/lib/utils';

/** Loading placeholder in the paper palette. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-md bg-ink/[0.07]', className)}
      {...props}
    />
  );
}
