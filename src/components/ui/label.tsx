import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

/** Small uppercase field label, in the editorial voice. */
export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink-muted',
        className,
      )}
      {...props}
    />
  );
}
