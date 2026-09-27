'use client';

import * as React from 'react';
import { Pause, Play, RotateCw, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/internal/badge';
import { Button } from '@/components/internal/button';
import { Card } from '@/components/internal/card';
import { StatusMark, Track, type Mark } from '@/components/internal/status';
import { stepCount, type Run, type RunStatus } from './types';

const markFor: Record<RunStatus, Mark> = {
  queued: 'queued',
  running: 'running',
  waiting: 'waiting',
  paused: 'waiting',
  succeeded: 'done',
  failed: 'failed',
  cancelled: 'skipped',
};

const labelFor: Record<RunStatus, string> = {
  queued: 'queued',
  running: 'running',
  waiting: 'waiting on you',
  paused: 'paused',
  succeeded: 'succeeded',
  failed: 'failed',
  cancelled: 'cancelled',
};

/** RunHeader — what is this run doing, right now. */
export function RunHeader({
  run,
  onPause,
  onResume,
  onCancel,
  onRerun,
  className,
}: {
  run: Run;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRerun?: () => void;
  className?: string;
}) {
  const { done, total } = stepCount(run);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const paused = run.status === 'paused' || run.status === 'waiting';

  return (
    <Card className={cn('p-5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusMark state={markFor[run.status]} />
            <h3 className="font-display text-base font-bold tracking-tight text-foreground">{run.workflow}</h3>
            {run.workflowVersion ? <Badge tone="muted">v{run.workflowVersion}</Badge> : null}
            <Badge tone="outline">{labelFor[run.status]}</Badge>
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-faint">
            {run.id}
            {run.trigger ? ` · ${run.trigger}` : ''}
            {run.actor ? ` · ${run.actor}` : ''}
            {run.heartbeat ? ` · heartbeat ${run.heartbeat}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {paused ? (
            <Button size="sm" onClick={onResume}>
              <Play className="size-3.5" /> Resume
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onPause}>
              <Pause className="size-3.5" /> Pause
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onRerun}>
            <RotateCw className="size-3.5" /> Re-run
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <Square className="size-3.5" /> Cancel
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <Track value={pct} blocked={run.status === 'waiting'} indeterminate={run.status === 'running'} />
        <dl className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          {[
            ['steps', `${done}/${total}`],
            ['elapsed', run.elapsed ?? '—'],
            ['tokens', (run.tokens ?? 0).toLocaleString()],
            ['cost', `$${(run.cost ?? 0).toFixed(2)}`],
            ['checkpoint', run.checkpoint ?? '—'],
            ['started', run.startedAt ?? '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <dt className="uppercase tracking-[0.12em] text-faint">{label}</dt>
              <dd className="tabular font-mono text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}
