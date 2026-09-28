# ReplayScrubber

Scrub through a finished run, step by step.

A transport for a completed run: play and pause, step forward and back, speed, and a scrubber that walks the timeline. The current step is named, with its mark and timestamp.

**Category:** Replay · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card button badge
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/replay-scrubber.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
const [index, setIndex] = React.useState(0);
const [playing, setPlaying] = React.useState(false);

<ReplayScrubber
  run={run}
  index={index}
  onChange={setIndex}
  playing={playing}
  onTogglePlay={() => setPlaying((value) => !value)}
  speed={1}
  onSpeedChange={setSpeed}
/>
```

## Anatomy

```tsx
import { ReplayScrubber } from '@/components/agent-ops/replay-scrubber';

// fully controlled: you own index and playback, it owns nothing
<ReplayScrubber run={run} index={index} onChange={setIndex} playing={playing} onTogglePlay={toggle} />
```

## Examples

### Mid-run

```tsx
<ReplayScrubber run={run} index={3} onChange={setIndex} />
```

### At the end, 4× speed

```tsx
<ReplayScrubber run={run} index={5} onChange={setIndex} speed={4} />
```

## API reference

#### ReplayScrubber

Step-level playback for a run.

| Prop | Type | Description |
| --- | --- | --- |
| `run` | `Run` | The run to replay. |
| `index` | `number` | Controlled step position. |
| `onChange` | `(index: number) => void` | Called with the new position. |
| `playing` | `boolean` | Whether playback is running. |
| `onTogglePlay` | `() => void` | Called by the play/pause button. |
| `speed` | `1 | 2 | 4` | Playback speed. Defaults to 1. |
| `onSpeedChange` | `(speed: number) => void` | Called when a speed is chosen. |

## Source

`src/components/agent-ops/replay-scrubber.tsx`

```tsx
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
```
