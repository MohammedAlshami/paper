import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {}

/** Tiny uppercase label above a title. */
export function Eyebrow({ className, ...props }: EyebrowProps) {
  return (
    <p className={cn('text-[0.68rem] font-medium uppercase tracking-[0.2em] text-faint', className)} {...props} />
  );
}
