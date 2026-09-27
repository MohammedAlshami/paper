import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RuleProps extends React.HTMLAttributes<HTMLDivElement> {}

/** The one hairline: solid, 1px, borders only where separation is needed. */
export function Rule({ className, ...props }: RuleProps) {
  return <div role="separator" className={cn('h-px w-full bg-border', className)} {...props} />;
}
