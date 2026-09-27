import * as React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'default' | 'ink' | 'accent' | 'faint';

const tones: Record<Tone, string> = {
  default: 'border-line text-ink-muted',
  ink: 'border-transparent bg-ink text-paper',
  accent: 'border-transparent bg-accent-soft text-accent',
  faint: 'border-line text-ink-faint',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/** Small uppercase label with a dashed border — the editorial eyebrow in pill form. */
export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1',
        'text-[0.68rem] font-medium uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
