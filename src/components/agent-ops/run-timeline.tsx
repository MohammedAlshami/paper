'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/internal/card';
import { StatusMark, Track, type Mark } from '@/components/internal/status';
import type { Run, RunStep } from './types';

const markFor: Record<RunStep['status'], Mark> = {
  queued: 'queued',
  running: 'running',
  done: 'done',
  waiting: 'waiting',
  failed: 'failed',
  skipped: 'skipped',
};

function StepRow({
  step,
  selected,
  onSelect,
}: {
  step: RunStep;
  selected?: boolean;
  onSelect?: (step: RunStep) => void;
}) {
  return (
    <li className={cn('relative', selected && 'bg-muted')}>
      <button
        type="button"
        onClick={() => onSelect?.(step)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
      >
        <StatusMark state={markFor[step.status]} className="mt-0.5" />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-sm',
                step.status === 'queued' ? 'text-faint' : 'font-medium text-foreground',
                step.status === 'skipped' && 'line-through',
              )}
            >
              {step.name}
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">{step.type}</span>
            {step.attempt && step.attempt > 1 ? (
              <span className="tabular font-mono text-[10.5px] text-faint">×{step.attempt}</span>
            ) : null}
            {step.status === 'failed' ? (
              <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-foreground">failed</span>
            ) : null}
          </span>
          <span className="mt-0.5 block truncate font-mono text-[11px] text-faint">{step.meta ?? ''}</span>
          {step.error ? (
            <span className="mt-1.5 block truncate font-mono text-[11px] text-foreground">{step.error}</span>
          ) : null}
          {step.status === 'running' ? <Track indeterminate className="mt-2 max-w-[16rem]" /> : null}
        </span>
        <span className="shrink-0 tabular font-mono text-[11px] text-faint">
          {step.durationMs ? `${(step.durationMs / 1000).toFixed(1)}s` : step.startedAt ?? ''}
        </span>
      </button>
    </li>
  );
}

/** RunTimeline — the workflow's steps, in order, with live state. */
export function RunTimeline({
  run,
  selectedStepId,
  onSelectStep,
  className,
}: {
  run: Run;
  selectedStepId?: string;
  onSelectStep?: (step: RunStep) => void;
  className?: string;
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <h4 className="text-sm font-medium text-foreground">Steps</h4>
        <span className="tabular font-mono text-[11px] text-faint">
          {run.steps.filter((s) => s.status === 'done').length}/{run.steps.length} · {run.elapsed ?? ''}
        </span>
      </div>
      <ul className="divide-y divide-solid divide-border border-t border-border">
        {run.steps.map((step) => (
          <StepRow key={step.id} step={step} selected={step.id === selectedStepId} onSelect={onSelectStep} />
        ))}
      </ul>
    </Card>
  );
}
