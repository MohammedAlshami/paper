'use client';

import * as React from 'react';
import { Check, CircleAlert, CircleDashed, Loader2, Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rule } from '@/components/ui/rule';

export type RunStatus = 'running' | 'succeeded' | 'failed' | 'paused' | 'waiting';
export type StepStatus = 'done' | 'running' | 'waiting' | 'failed' | 'pending';

export interface RunStep {
  id: string;
  label: string;
  status: StepStatus;
  meta?: string;
  at?: string;
}

export interface AgentRun {
  id: string;
  title: string;
  status: RunStatus;
  /** Human-readable "last heartbeat" line, e.g. "4s ago". */
  heartbeat?: string;
  checkpoint?: string;
  steps: RunStep[];
}

const runTone: Record<RunStatus, 'default' | 'ink' | 'accent' | 'faint'> = {
  running: 'accent',
  succeeded: 'ink',
  failed: 'default',
  paused: 'default',
  waiting: 'default',
};

function StepDot({ status }: { status: StepStatus }) {
  const base = 'grid size-4 shrink-0 place-items-center rounded-full border';
  if (status === 'done') {
    return (
      <span className={cn(base, 'border-ink bg-ink text-paper')} aria-hidden>
        <Check className="size-2.5" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'running') {
    return (
      <span className={cn(base, 'relative border-accent bg-accent-soft')} aria-hidden>
        <span className="absolute inset-0 animate-ping rounded-full border border-accent/50" />
        <Loader2 className="size-2.5 animate-spin text-accent" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'waiting') {
    return (
      <span className={cn(base, 'border-dashed border-line-strong bg-raised')} aria-hidden>
        <Pause className="size-2 text-ink-faint" />
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className={cn(base, 'border-danger bg-danger-soft text-danger')} aria-hidden>
        <CircleAlert className="size-2.5" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className={cn(base, 'border-dashed border-line bg-raised')} aria-hidden>
      <CircleDashed className="size-2 text-ink-faint" />
    </span>
  );
}

/**
 * Agent run timeline — heartbeats, checkpoints and per-step state for a long-running run.
 * This is the surface that "dies silently" in most products today.
 */
export function RunTimeline({
  run,
  onPause,
  onResume,
  className,
}: {
  run: AgentRun;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
}) {
  const active = run.steps.find((s) => s.status === 'running' || s.status === 'waiting');
  const paused = run.status === 'paused' || run.status === 'waiting';

  return (
    <section
      className={cn('rounded-paper-lg border border-dashed border-line bg-raised p-6', className)}
      aria-label={`Run ${run.title}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold tracking-tight text-ink">{run.title}</h3>
          <p className="mt-1 font-mono text-[11px] text-ink-faint">
            run {run.id}
            {run.heartbeat ? ` · last heartbeat ${run.heartbeat}` : ''}
          </p>
        </div>
        <Badge tone={runTone[run.status]}>{run.status}</Badge>
      </header>

      <Rule className="my-5" />

      <ol className="relative">
        {run.steps.map((step, i) => {
          const isLast = i === run.steps.length - 1;
          return (
            <li key={step.id} className={cn('relative flex items-start gap-4', isLast ? '' : 'pb-6')}>
              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute left-[7px] top-5 h-[calc(100%-0.5rem)] border-l border-dashed border-line"
                />
              ) : null}
              <StepDot status={step.status} />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-medium leading-5',
                    step.status === 'pending' ? 'text-ink-faint' : 'text-ink',
                  )}
                >
                  {step.label}
                </p>
                {step.meta ? (
                  <p className="mt-0.5 font-mono text-[11px] text-ink-faint">{step.meta}</p>
                ) : null}
              </div>
              {step.at ? (
                <span className="shrink-0 font-mono text-[11px] text-ink-faint">{step.at}</span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <footer className="mt-6 flex flex-wrap items-center gap-2 border-t border-dashed border-line pt-4">
        <span className="mr-auto text-xs text-ink-faint">
          {run.checkpoint ? `checkpoint ${run.checkpoint}` : 'no checkpoint yet'}
        </span>
        {paused ? (
          <Button size="sm" onClick={onResume}>
            <Play className="size-3.5" /> Resume
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={onPause}>
            <Pause className="size-3.5" /> Pause
          </Button>
        )}
        <Button size="sm" variant="ghost">
          <RotateCcw className="size-3.5" /> Fork from {active?.at ?? 'here'}
        </Button>
      </footer>
    </section>
  );
}
