# RunsTable

The index of every run.

Status, workflow, run id, trigger, step progress, duration, cost and start time — filterable by status, with per-row re-run and cancel.

**Category:** Management · **Status:** ready

## Installation

```bash
pnpm dlx shadcn@latest add card button badge table
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/runs-table.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<RunsTable
  runs={runs}
  onSelect={(run) => open(run.id)}
  onRerun={(run) => rerun(run.id)}
  onCancel={(run) => cancel(run.id)}
/>
```

## Anatomy

```tsx
import { RunsTable } from '@/components/agent-ops/runs-table';

// RunSummary rows: id, workflow, status, trigger, startedAt, durationMs, cost, stepsDone, stepsTotal
<RunsTable runs={summaries} onSelect={open} />
```

## Examples

### All runs

```tsx
<RunsTable runs={runs} onSelect={open} />
```

## API reference

#### RunsTable · RunSummary

The run index.

| Prop | Type | Description |
| --- | --- | --- |
| `runs` | `RunSummary[]` | id, workflow, status, trigger?, actor?, startedAt?, durationMs?, cost?, stepsDone?, stepsTotal? |
| `onSelect` | `(run: RunSummary) => void` | Called when a row is clicked. |
| `onRerun` | `(run: RunSummary) => void` | Called from the row action. |
| `onCancel` | `(run: RunSummary) => void` | Called from the row action. |

## Source

`src/components/agent-ops/runs-table.tsx`

```tsx
'use client';

import * as React from 'react';
import { RotateCw, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusMark, type Mark } from '@/components/internal/status-mark';
import { Panel, PanelBody, PanelHeader } from './shared/panel';
import type { RunStatus, RunSummary } from './types';

const markFor: Record<RunStatus, Mark> = {
  queued: 'queued',
  running: 'running',
  waiting: 'waiting',
  paused: 'waiting',
  succeeded: 'done',
  failed: 'failed',
  cancelled: 'skipped',
};

const FILTERS = ['all', 'running', 'succeeded', 'failed'] as const;
type Filter = (typeof FILTERS)[number];

/** RunsTable — the index. Where managing workflows actually starts. */
export function RunsTable({
  runs,
  onSelect,
  onRerun,
  onCancel,
  className,
}: {
  runs: RunSummary[];
  onSelect?: (run: RunSummary) => void;
  onRerun?: (run: RunSummary) => void;
  onCancel?: (run: RunSummary) => void;
  className?: string;
}) {
  const [filter, setFilter] = React.useState<Filter>('all');
  const shown = filter === 'all' ? runs : runs.filter((run) => run.status === filter);

  return (
    <Panel className={className}>
      <PanelHeader
        title={
          <>
            Runs <span className="font-mono text-xs font-normal text-muted-foreground">({shown.length})</span>
          </>
        }
        right={FILTERS.map((value) => (
          <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value}>
            <Badge variant={filter === value ? 'default' : 'outline'} className="font-mono">
              {value}
            </Badge>
          </button>
        ))}
      />

      <PanelBody>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Workflow</TableHead>
              <TableHead>Run</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((run) => (
              <TableRow key={run.id} className="cursor-pointer" onClick={() => onSelect?.(run)}>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <StatusMark state={markFor[run.status]} />
                    <span className="text-xs">{run.status}</span>
                  </span>
                </TableCell>
                <TableCell className="font-medium">{run.workflow}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{run.id}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{run.trigger ?? '—'}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                  {run.stepsDone ?? 0}/{run.stepsTotal ?? 0}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : '—'}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  ${(run.cost ?? 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Re-run"
                      onClick={(event: React.MouseEvent) => {
                        event.stopPropagation();
                        onRerun?.(run);
                      }}
                    >
                      <RotateCw />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Cancel"
                      onClick={(event: React.MouseEvent) => {
                        event.stopPropagation();
                        onCancel?.(run);
                      }}
                    >
                      <Square />
                    </Button>
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {!shown.length ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No runs match this filter.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </PanelBody>
    </Panel>
  );
}
```
