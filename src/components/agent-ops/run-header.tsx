'use client';

import * as React from 'react';
import { Pause, Play, RotateCw, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusMark, Track, type Mark } from '@/components/internal/status-mark';
import { cn } from '@/lib/utils';
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
  queued: 'Queued',
  running: 'Running',
  waiting: 'Waiting on you',
  paused: 'Paused',
  succeeded: 'Succeeded',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

/** RunHeader — what this run is doing, right now, and the controls over it. */
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

  const stats: [string, string][] = [
    ['Steps', `${done}/${total}`],
    ['Elapsed', run.elapsed ?? '—'],
    ['Tokens', (run.tokens ?? 0).toLocaleString()],
    ['Cost', `$${(run.cost ?? 0).toFixed(2)}`],
    ['Checkpoint', run.checkpoint ?? '—'],
  ];

  return (
    <Card className={cn('gap-0 py-0', className)}>
      <CardHeader className="gap-3 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusMark state={markFor[run.status]} />
              <span className="text-sm font-semibold tracking-tight">{run.workflow}</span>
              {run.workflowVersion ? (
                <Badge variant="secondary" className="font-mono">
                  v{run.workflowVersion}
                </Badge>
              ) : null}
              <Badge variant="outline">{labelFor[run.status]}</Badge>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {run.id}
              {run.trigger ? ` · ${run.trigger}` : ''}
              {run.actor ? ` · ${run.actor}` : ''}
              {run.heartbeat ? ` · heartbeat ${run.heartbeat}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {paused ? (
              <Button size="sm" onClick={onResume}>
                <Play /> Resume
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={onPause}>
                <Pause /> Pause
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onRerun}>
              <RotateCw /> Re-run
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
              <Square /> Cancel
            </Button>
          </div>
        </div>
        <Track value={pct} blocked={run.status === 'waiting'} indeterminate={run.status === 'running'} />
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-wrap items-baseline gap-x-6 gap-y-2 py-3">
        {stats.map(([label, value]) => (
          <div key={label} className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-mono text-xs tabular-nums">{value}</span>
          </div>
        ))}
        {run.startedAt ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground">Started</span>
            <span className="font-mono text-xs tabular-nums">{run.startedAt}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
