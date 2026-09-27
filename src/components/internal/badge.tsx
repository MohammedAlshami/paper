import * as React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'outline' | 'solid' | 'muted' | 'plain';

const tones: Record<Tone, string> = {
  outline: 'border border-border-strong text-foreground',
  solid: 'border border-transparent bg-primary text-primary-foreground',
  muted: 'border border-transparent bg-muted text-muted-foreground',
  plain: 'border border-transparent text-faint',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/** Small uppercase label. Monochrome: weight and fill carry meaning. */
export function Badge({ className, tone = 'outline', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-medium uppercase tracking-[0.12em]',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
