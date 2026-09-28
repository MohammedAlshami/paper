'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * MeterBar — the rounded fill bar shared by BudgetGauge and RateLimitMeter:
 * a track, a fill at `pct`, and optional tick marks (thresholds, a forecast).
 */
export function MeterBar({
  pct,
  height = 'h-1.5',
  dim,
  ticks,
  className,
}: {
  /** 0–100. Values above 100 are clamped visually by the caller. */
  pct: number;
  height?: string;
  /** Fade the fill once past a warning point (e.g. rate limits nearing capacity). */
  dim?: boolean;
  ticks?: { at: number; label?: string; variant?: 'threshold' | 'marker' }[];
  className?: string;
}) {
  return (
    <span className={cn('relative block w-full', className)}>
      <span className={cn('block w-full overflow-hidden rounded-full bg-muted', height)}>
        <span
          className={cn('block h-full rounded-full transition-[width] duration-500', dim ? 'bg-primary/45' : 'bg-primary')}
          style={{ width: `${pct}%` }}
        />
      </span>
      {ticks?.map((tick, index) =>
        tick.variant === 'marker' ? (
          <span
            key={index}
            className={cn('absolute top-0 w-0.5 rounded-full bg-foreground/40', height)}
            style={{ left: `${Math.min(100, tick.at)}%` }}
            title={tick.label}
          />
        ) : (
          <span
            key={index}
            className="absolute -top-1 h-4 w-px bg-border"
            style={{ left: `${Math.min(100, tick.at)}%` }}
            title={tick.label}
          />
        ),
      )}
    </span>
  );
}
