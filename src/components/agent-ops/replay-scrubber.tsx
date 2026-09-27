'use client';

import * as React from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusMark, type Mark } from '@/components/internal/status-mark';
import { cn } from '@/lib/utils';
import type { Run, RunStep } from './types';

const markFor: Record<RunStep['status'], Mark> = {
  queued: 'queued',
  running: 'running',
  done: 'done',
  waiting: 'waiting',
  failed: 'failed',
  skipped: 'skipped',
};

const SPEEDS = [1, 2, 4] as const;

/** ReplayScrubber — scrub through a finished run, step by step. */
export function ReplayScrubber({
  run,
  index,
  onChange,
  playing,
  onTogglePlay,
  speed = 1,
  onSpeedChange,
  className,
}: {
  run: Run;
  index: number;
  onChange: (index: number) => void;
  playing?: boolean;
  onTogglePlay?: () => void;
  speed?: number;
  onSpeedChange?: (speed: number) => void;
  className?: string;
}) {
  const total = run.steps.length;
  const step = run.steps[Math.min(index, Math.max(0, total - 1))];

  return (
    <Card className={cn('py-0', className)}>
      <CardContent className="flex flex-wrap items-center gap-4 py-4">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Previous step"
            disabled={index <= 0}
            onClick={() => onChange(Math.max(0, index - 1))}
          >
            <SkipBack />
          </Button>
          <Button size="icon" aria-label={playing ? 'Pause replay' : 'Play replay'} onClick={onTogglePlay}>
            {playing ? <Pause /> : <Play />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Next step"
            disabled={index >= total - 1}
            onClick={() => onChange(Math.min(total - 1, index + 1))}
          >
            <SkipForward />
          </Button>
        </div>

        <div className="min-w-48 flex-1 space-y-2">
          <input
            type="range"
            min={0}
            max={Math.max(0, total - 1)}
            step={1}
            value={index}
            onChange={(event) => onChange(Number(event.target.value))}
            aria-label="Replay position"
            className="h-1 w-full cursor-pointer accent-foreground"
          />
          <div className="flex items-center gap-2">
            <StatusMark state={markFor[step.status]} />
            <span className="truncate text-sm font-medium">{step.name}</span>
            <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
              {index + 1} / {total}
              {step.startedAt ? ` · ${step.startedAt}` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {SPEEDS.map((value) => (
            <button key={value} type="button" onClick={() => onSpeedChange?.(value)} aria-pressed={speed === value}>
              <Badge variant={speed === value ? 'default' : 'outline'} className="font-mono">
                {value}×
              </Badge>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
