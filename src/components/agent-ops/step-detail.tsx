'use client';

import * as React from 'react';
import { Copy, Pencil, RotateCw, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/internal/badge';
import { Button } from '@/components/internal/button';
import { Card } from '@/components/internal/card';
import { StatusMark, type Mark } from '@/components/internal/status';
import type { RunStep } from './types';

const markFor: Record<RunStep['status'], Mark> = {
  queued: 'queued',
  running: 'running',
  done: 'done',
  waiting: 'waiting',
  failed: 'failed',
  skipped: 'skipped',
};

function Well({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-paper border border-border">
      <p className="border-b border-border bg-muted px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
        {label}
      </p>
      <pre className="max-h-64 overflow-auto bg-card p-3 font-mono text-[12px] leading-relaxed text-foreground">
        {children}
      </pre>
    </div>
  );
}

/** StepDetail — everything about one step: prompts, payloads, tools, retries, errors. */
export function StepDetail({
  step,
  onRetry,
  onSkip,
  className,
}: {
  step?: RunStep;
  onRetry?: () => void;
  onSkip?: () => void;
  className?: string;
}) {
  if (!step) {
    return (
      <Card className={cn('grid min-h-64 place-items-center p-6', className)}>
        <p className="text-sm text-faint">Select a step to inspect it.</p>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusMark state={markFor[step.status]} />
            <h4 className="font-display text-base font-bold tracking-tight text-foreground">{step.name}</h4>
            <Badge tone="muted">{step.type}</Badge>
            {step.attempt && step.attempt > 1 ? <Badge tone="outline">attempt {step.attempt}</Badge> : null}
          </div>
          <p className="mt-1 font-mono text-[11px] text-faint">
            {step.id}
            {step.startedAt ? ` · ${step.startedAt}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RotateCw className="size-3.5" /> Retry
          </Button>
          <Button size="sm" variant="ghost" onClick={onSkip}>
            <SkipForward className="size-3.5" /> Skip
          </Button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px border-y border-border bg-border sm:grid-cols-4">
        {[
          ['duration', step.durationMs ? `${(step.durationMs / 1000).toFixed(1)}s` : '—'],
          ['tokens', step.tokens ? step.tokens.toLocaleString() : '—'],
          ['cost', step.cost ? `$${step.cost.toFixed(4)}` : '—'],
          ['status', step.status],
        ].map(([label, value]) => (
          <div key={label} className="bg-card px-4 py-3">
            <dt className="text-[10.5px] uppercase tracking-[0.12em] text-faint">{label}</dt>
            <dd className="tabular mt-0.5 font-mono text-sm text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3 p-4">
        {step.error ? (
          <div className="rounded-paper border border-border-strong bg-muted p-3">
            <p className="text-[10.5px] uppercase tracking-[0.12em] text-faint">error</p>
            <p className="mt-1 font-mono text-[12px] text-foreground">{step.error}</p>
          </div>
        ) : null}
        {step.input ? <Well label="input">{step.input}</Well> : null}
        {step.output ? <Well label="output">{step.output}</Well> : null}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button size="sm" variant="ghost">
            <Pencil className="size-3.5" /> Edit input
          </Button>
          <Button size="sm" variant="ghost">
            <Copy className="size-3.5" /> Copy payload
          </Button>
        </div>
      </div>
    </Card>
  );
}
