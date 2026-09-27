import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {}

/** Tiny uppercase kicker that sits above a heading. */
export function Eyebrow({ className, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        'text-[0.7rem] font-medium uppercase tracking-[0.28em] text-ink-faint',
        className,
      )}
      {...props}
    />
  );
}
