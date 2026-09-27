import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RuleProps extends React.HTMLAttributes<HTMLDivElement> {
  dashed?: boolean;
}

/** The signature hairline: a dashed rule, used as the section separator everywhere. */
export function Rule({ className, dashed = true, ...props }: RuleProps) {
  return (
    <div
      role="separator"
      className={cn('h-px w-full border-t', dashed ? 'border-dashed' : 'border-solid', 'border-line', className)}
      {...props}
    />
  );
}
