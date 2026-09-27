import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Monochrome state marks, the one convention the whole set shares.
 * State is carried by shape, fill and icon — never by hue — so the components
 * stay legible inside any product's brand.
 */
export type Mark = 'queued' | 'running' | 'done' | 'waiting' | 'failed' | 'skipped';

export function StatusMark({ state, className }: { state: Mark; className?: string }) {
  const base = 'relative grid size-4 shrink-0 place-items-center rounded-full border';

  switch (state) {
    case 'done':
      return (
        <span aria-hidden className={cn(base, 'border-primary bg-primary text-primary-foreground', className)}>
          <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 6.4 4.6 9 10 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case 'running':
      return (
        <span aria-hidden className={cn(base, 'border-primary bg-background', className)}>
          <svg viewBox="0 0 16 16" className="absolute size-4 animate-spin text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 1.5a6.5 6.5 0 1 1-6.5 6.5" strokeLinecap="round" />
          </svg>
        </span>
      );
    case 'waiting':
      return (
        <span aria-hidden className={cn(base, 'overflow-hidden border-primary bg-background', className)}>
          <span className="absolute inset-x-0 bottom-0 h-1/2 bg-primary" />
        </span>
      );
    case 'failed':
      return (
        <span aria-hidden className={cn(base, 'border-primary bg-background', className)}>
          <svg viewBox="0 0 12 12" className="size-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </span>
      );
    case 'skipped':
      return <span aria-hidden className={cn(base, 'border-muted-foreground/40 bg-background', className)} />;
    default:
      return <span aria-hidden className={cn(base, 'border-input bg-background', className)} />;
  }
}

/** A thin progress bar: filled track, half-filled when blocked, sliding when indeterminate. */
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
    <span className={cn('relative block h-1 w-full overflow-hidden rounded-full bg-muted', className)} aria-hidden>
      {blocked ? (
        <span className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-primary/40" />
      ) : indeterminate ? (
        <span className="absolute inset-y-0 w-1/3 animate-[track-slide_1.4s_ease-in-out_infinite] rounded-full bg-primary" />
      ) : (
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
        />
      )}
    </span>
  );
}
