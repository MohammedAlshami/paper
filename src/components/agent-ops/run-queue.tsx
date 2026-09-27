'use client';

import * as React from 'react';
import { ArrowUpToLine, Pause, Play, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface QueuedRun {
  id: string;
  workflow: string;
  priority: 'high' | 'normal' | 'low';
  queuedFor: string;
  trigger?: 'manual' | 'schedule' | 'webhook' | 'api';
  waitingOn?: string;
}

/** RunQueue — what is waiting to run, in what order, and how much room is left. */
export function RunQueue({
  runs,
  running = 0,
  concurrency = 4,
  paused,
  onTogglePause,
  onPromote,
  onRemove,
  className,
}: {
  runs: QueuedRun[];
  running?: number;
  concurrency?: number;
  paused?: boolean;
  onTogglePause?: () => void;
  onPromote?: (run: QueuedRun) => void;
  onRemove?: (run: QueuedRun) => void;
  className?: string;
}) {
  const utilisation = Math.min(100, Math.round((running / Math.max(1, concurrency)) * 100));

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 py-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          Queue
          <span className="font-mono text-xs font-normal text-muted-foreground tabular-nums">
            {running}/{concurrency} workers · {runs.length} waiting
          </span>
        </CardTitle>
        <div className="flex items-center gap-2">
          {paused ? <Badge variant="outline">paused</Badge> : null}
          <Button size="sm" variant={paused ? 'default' : 'outline'} onClick={onTogglePause}>
            {paused ? <Play /> : <Pause />} {paused ? 'Resume queue' : 'Pause queue'}
          </Button>
        </div>
      </CardHeader>

      <div className="space-y-2 px-6 py-3">
        <Progress value={utilisation} className="h-1.5" />
        <p className="font-mono text-xs text-muted-foreground tabular-nums">{utilisation}% of concurrency in use</p>
      </div>

      <CardContent className="p-0">
        <ol className="divide-y border-t">
          {runs.map((run, index) => (
            <li key={run.id} className="flex items-center gap-3 px-6 py-3">
              <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{index + 1}</span>
              <span className="min-w-0 flex-1 space-y-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium">{run.workflow}</span>
                  <Badge
                    variant={run.priority === 'high' ? 'default' : run.priority === 'low' ? 'outline' : 'secondary'}
                    className="font-mono"
                  >
                    {run.priority}
                  </Badge>
                  {run.trigger ? (
                    <Badge variant="outline" className="font-mono">
                      {run.trigger}
                    </Badge>
                  ) : null}
                </span>
                <span className="block font-mono text-xs text-muted-foreground">
                  {run.id} · queued {run.queuedFor}
                  {run.waitingOn ? ` · waiting on ${run.waitingOn}` : ''}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <Button size="icon" variant="ghost" aria-label="Promote to front" onClick={() => onPromote?.(run)}>
                  <ArrowUpToLine />
                </Button>
                <Button size="icon" variant="ghost" aria-label="Remove from queue" onClick={() => onRemove?.(run)}>
                  <Trash2 />
                </Button>
              </span>
            </li>
          ))}
          {!runs.length ? <li className="px-6 py-8 text-center text-sm text-muted-foreground">The queue is empty.</li> : null}
        </ol>
      </CardContent>
    </Card>
  );
}
