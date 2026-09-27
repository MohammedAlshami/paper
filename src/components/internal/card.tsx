import * as React from 'react';
import { cn } from '@/lib/utils';

/** White surface on the grey canvas. Hairline border, one soft shadow. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-paper-lg border border-border bg-card shadow-card', className)}
      {...props}
    />
  );
}
