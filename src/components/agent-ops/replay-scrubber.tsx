'use client';

import * as React from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/internal/card';
import { StatusMark, type Mark } from '@/components/internal/status';
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

/** ReplayScrubber — scrub through a finished run step by step. Time travel, greyscale. */
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
  const step = run.steps[Math.min(index, total - 1)];

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous step"
            onClick={() => onChange(Math.max(0, index - 1))}
            className="grid size-8 place-items-center rounded-paper text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <SkipBack className="size-4" />
          </button>
          <button
            type="button"
            aria-label={playing ? 'Pause replay' : 'Play replay'}
            onClick={onTogglePlay}
            className="grid size-9 place-items-center rounded-paper bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
          <button
            type="button"
            aria-label="Next step"
            onClick={() => onChange(Math.min(total - 1, index + 1))}
            className="grid size-8 place-items-center rounded-paper text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <SkipForward className="size-4" />
          </button>
        </div>

        <div className="min-w-[12rem] flex-1">
          <input
            type="range"
            min={0}
            max={Math.max(0, total - 1)}
            step={1}
            value={index}
            onChange={(event) => onChange(Number(event.target.value))}
            aria-label="Replay position"
            className="h-1 w-full accent-primary"
          />
          <div className="mt-2 flex items-center gap-2">
            <StatusMark state={markFor[step.status]} />
            <span className="truncate text-sm font-medium text-foreground">{step.name}</span>
            <span className="tabular ml-auto shrink-0 font-mono text-[11px] text-faint">
              {index + 1} / {total}
              {step.startedAt ? ` · ${step.startedAt}` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onSpeedChange?.(value)}
              aria-pressed={speed === value}
              className={cn(
                'rounded-paper px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors',
                speed === value ? 'bg-primary text-primary-foreground' : 'text-faint hover:bg-muted hover:text-foreground',
              )}
            >
              {value}×
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
