'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  label: string;
  /** One line under the label, shown on wide screens. */
  description?: string;
}

/**
 * StepIndicator — where someone is in a short flow: checkout, onboarding, a wizard. Finished steps show a tick and can be
 * pressed to go back; the current step is drawn in the accent colour. On a phone only the current label is shown.
 */
export function StepIndicator({
  steps,
  currentId,
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  steps: Step[];
  currentId: string;
  /** Called when a finished step is pressed. Without it steps are not interactive. */
  onSelect?: (id: string) => void;
  accentColor?: string;
  className?: string;
}) {
  const current = Math.max(0, steps.findIndex((step) => step.id === currentId));

  return (
    <ol className={cn('flex w-full items-start', className)} aria-label="Progress">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const interactive = done && Boolean(onSelect);
        const marker = (
          <>
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs tabular-nums transition-colors',
                done && 'border-transparent bg-foreground text-background',
                !done && !active && 'text-muted-foreground',
              )}
              style={active ? { borderColor: accentColor, color: accentColor, fontWeight: 600 } : undefined}
            >
              {done ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span className={cn('text-left', active ? 'shrink-0' : 'hidden min-w-0 sm:block')}>
              <span className={cn('block text-sm', !active && 'truncate', active ? 'font-bold' : done ? 'font-medium' : 'text-muted-foreground')}>{step.label}</span>
              {step.description ? <span className="hidden truncate text-xs text-muted-foreground md:block">{step.description}</span> : null}
            </span>
          </>
        );
        return (
          <li key={step.id} className={cn('flex items-center', active ? 'shrink-0' : 'min-w-0', index < steps.length - 1 ? 'flex-1' : 'shrink-0')} aria-current={active ? 'step' : undefined}>
            {interactive ? (
              <button type="button" onClick={() => onSelect?.(step.id)} className="flex min-w-0 items-center gap-2.5 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                {marker}
              </button>
            ) : (
              <div className="flex min-w-0 items-center gap-2.5">{marker}</div>
            )}
            {index < steps.length - 1 ? <span className={cn('mx-2 h-px min-w-2 flex-1 sm:mx-3', done ? 'bg-foreground' : 'bg-border')} aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}
