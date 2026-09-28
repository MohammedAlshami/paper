# RunTimeline

The workflow's steps, in order, with live state.

A step list with monochrome status marks (done, running with a pulse, waiting, failed, skipped), durations, retry counts, inline errors, and selection to open a step.

**Category:** Progress · **Status:** ready

## Installation

```bash
pnpm dlx shadcn@latest add card badge
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/run-timeline.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<RunTimeline
  run={run}
  selectedStepId={step.id}
  onSelectStep={setStep}
/>
```

## Anatomy

```tsx
import { RunTimeline } from '@/components/agent-ops/run-timeline';

// rows render in run.steps order; selection is controlled by you
<RunTimeline run={run} selectedStepId={step.id} onSelectStep={setStep} />
```

## Examples

### In progress with a step selected

```tsx
<RunTimeline run={run} selectedStepId="s4" />
```

### Failed and skipped steps

```tsx
<RunTimeline run={failedRun} />
```

## API reference

#### RunTimeline

The step list for a run.

| Prop | Type | Description |
| --- | --- | --- |
| `run` | `Run` | Steps render in array order. |
| `selectedStepId` | `string` | Highlights the matching row. |
| `onSelectStep` | `(step: RunStep) => void` | Called when a row is clicked. |
| `className` | `string` | Merged onto the card. |

## Source

`src/components/agent-ops/run-timeline.tsx`

```tsx
'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusMark, Track, type Mark } from '@/components/internal/status-mark';
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
    <li>
      <button
        type="button"
        onClick={() => onSelect?.(step)}
        aria-current={selected ? 'true' : undefined}
        className={cn(
          'flex w-full items-start gap-3 px-6 py-3 text-left transition-colors hover:bg-muted/60',
          selected && 'bg-muted',
        )}
      >
        <StatusMark state={markFor[step.status]} className="mt-0.5" />
        <span className="min-w-0 flex-1 space-y-1">
          <span className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-sm',
                step.status === 'queued' ? 'text-muted-foreground' : 'font-medium',
                step.status === 'skipped' && 'line-through',
              )}
            >
              {step.name}
            </span>
            <Badge variant="secondary" className="font-mono">
              {step.type}
            </Badge>
            {step.attempt && step.attempt > 1 ? (
              <span className="font-mono text-xs text-muted-foreground">×{step.attempt}</span>
            ) : null}
          </span>
          {step.meta ? <span className="block truncate font-mono text-xs text-muted-foreground">{step.meta}</span> : null}
          {step.error ? <span className="block truncate font-mono text-xs text-destructive">{step.error}</span> : null}
          {step.status === 'running' ? <Track indeterminate className="mt-2 max-w-64" /> : null}
        </span>
        <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
          {step.durationMs ? `${(step.durationMs / 1000).toFixed(1)}s` : (step.startedAt ?? '')}
        </span>
      </button>
    </li>
  );
}

/** RunTimeline — the workflow's steps in order, with live state. */
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
  const done = run.steps.filter((step) => step.status === 'done').length;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">Steps</CardTitle>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {done}/{run.steps.length}
          {run.elapsed ? ` · ${run.elapsed}` : ''}
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y border-t">
          {run.steps.map((step) => (
            <StepRow key={step.id} step={step} selected={step.id === selectedStepId} onSelect={onSelectStep} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
```
