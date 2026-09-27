'use client';

import * as React from 'react';
import { Gauge, Pause, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/internal/badge';
import { Button } from '@/components/internal/button';
import { Rule } from '@/components/internal/rule';
import { Eyebrow } from '@/components/internal/eyebrow';

/**
 * Cost and token budget meter — spent vs budget, burn rate and a forecast.
 * Everyone solves this at the gateway; nobody ships the React surface.
 */
export function CostMeter({
  label = 'Run budget',
  spent,
  budget,
  currency = '$',
  burnPerHour,
  hoursElapsed = 1,
  onPause,
  className,
}: {
  label?: string;
  spent: number;
  budget: number;
  currency?: string;
  burnPerHour?: number;
  hoursElapsed?: number;
  onPause?: () => void;
  className?: string;
}) {
  const pct = Math.min(100, Math.round((spent / budget) * 100));
  const over = spent > budget;
  const warning = !over && pct >= 80;
  const projected = burnPerHour ? spent + burnPerHour * 8 : undefined;

  const tone = over ? 'text-danger' : warning ? 'text-accent' : 'text-ink';
  const fill = over ? 'bg-danger' : warning ? 'bg-accent' : 'bg-ink';

  return (
    <section
      className={cn('rounded-paper-lg border border-dashed border-line bg-raised p-6', className)}
      aria-label={`${label}: ${currency}${spent} of ${currency}${budget}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Eyebrow className="mb-2">{label}</Eyebrow>
          <p className={cn('font-display text-3xl font-extrabold tracking-tight', tone)}>
            {currency}
            {spent.toFixed(2)}
            <span className="ml-2 font-sans text-sm font-medium text-ink-faint">
              of {currency}
              {budget.toFixed(2)}
            </span>
          </p>
        </div>
        <Badge tone={over ? 'ink' : warning ? 'accent' : 'default'}>
          <Gauge className="size-3" />
          {over ? 'over budget' : warning ? `${pct}% used` : 'on track'}
        </Badge>
      </header>

      <div className="mt-5" role="meter" aria-valuemin={0} aria-valuemax={budget} aria-valuenow={spent}>
        <div className="relative h-2 w-full overflow-hidden rounded-full border border-dashed border-line bg-sunk/60">
          <div className={cn('h-full rounded-full transition-[width] duration-500', fill)} style={{ width: `${pct}%` }} />
          <span aria-hidden className="absolute inset-y-0 left-3/4 border-l border-dashed border-line-strong" />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-faint">
          <span>0</span>
          <span>75% warning</span>
          <span>
            {currency}
            {budget.toFixed(2)}
          </span>
        </div>
      </div>

      <Rule className="my-5" />

      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wider text-ink-faint">Burn rate</dt>
          <dd className="mt-1 font-mono text-ink">
            {burnPerHour ? `${currency}${burnPerHour.toFixed(2)}/h` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-ink-faint">Elapsed</dt>
          <dd className="mt-1 font-mono text-ink">{hoursElapsed}h</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-ink-faint">Projected +8h</dt>
          <dd className={cn('mt-1 font-mono', projected && projected > budget ? 'text-danger' : 'text-ink')}>
            {projected ? `${currency}${projected.toFixed(2)}` : '—'}
          </dd>
        </div>
      </dl>

      {projected && projected > budget ? (
        <p className="mt-5 flex items-start gap-2 rounded-paper border border-dashed border-danger/40 bg-danger-soft p-3 text-sm text-danger">
          <TrendingUp className="mt-0.5 size-4 shrink-0" aria-hidden />
          At this rate the run exceeds its budget in about{' '}
          {Math.max(1, Math.round(((budget - spent) / (burnPerHour || 1)) * 60))} minutes.
        </p>
      ) : null}

      <footer className="mt-6 flex flex-wrap items-center gap-2 border-t border-dashed border-line pt-4">
        <span className="mr-auto text-xs text-ink-faint">Enforced before each tool call</span>
        <Button size="sm" variant="ghost">
          Raise budget
        </Button>
        <Button size="sm" variant="outline" onClick={onPause}>
          <Pause className="size-3.5" /> Pause agent
        </Button>
      </footer>
    </section>
  );
}
