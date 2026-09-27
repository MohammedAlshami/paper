'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Monochrome status marks. State is carried by shape and fill, never hue:
 * queued (hollow), running (pulse), done (filled), waiting (half), failed (✕), skipped (ring).
 */
export type Mark = 'queued' | 'running' | 'done' | 'waiting' | 'failed' | 'skipped';

export function StatusMark({ state, className }: { state: Mark; className?: string }) {
  const base = 'relative grid size-4 shrink-0 place-items-center rounded-full border';
  switch (state) {
    case 'done':
      return (
        <span className={cn(base, 'border-primary bg-primary text-primary-foreground', className)} aria-hidden>
          <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 6.4 4.6 9 10 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case 'running':
      return (
        <span className={cn(base, 'border-primary bg-card', className)} aria-hidden>
          <span className="absolute inset-0 animate-ping rounded-full border border-primary/40" />
          <span className="size-1.5 rounded-full bg-primary" />
        </span>
      );
    case 'waiting':
      return (
        <span className={cn(base, 'overflow-hidden border-primary bg-card', className)} aria-hidden>
          <span className="absolute inset-x-0 bottom-0 h-1/2 bg-primary" />
        </span>
      );
    case 'failed':
      return (
        <span className={cn(base, 'border-primary bg-card', className)} aria-hidden>
          <svg viewBox="0 0 12 12" className="size-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </span>
      );
    case 'skipped':
      return <span className={cn(base, 'border-faint bg-card', className)} aria-hidden />;
    default:
      return <span className={cn(base, 'border-border-strong bg-card', className)} aria-hidden />;
  }
}

/** A thin progress bar. Solid black fill on a grey track; indeterminate slides. */
export function Track({
  value,
  indeterminate,
  blocked,
  className,
}: {
  value?: number;
  indeterminate?: boolean;
  blocked?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn('relative block h-1 w-full overflow-hidden rounded-full bg-border', className)}
      aria-hidden
    >
      {blocked ? (
        <span className="hatch absolute inset-0" />
      ) : indeterminate ? (
        <span className="absolute inset-y-0 w-1/3 animate-[slide_1.4s_ease-in-out_infinite] rounded-full bg-primary" />
      ) : (
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
        />
      )}
    </span>
  );
}
