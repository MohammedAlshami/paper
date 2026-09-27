'use client';

import * as React from 'react';
import { RotateCw, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/internal/card';
import { StatusMark, type Mark } from '@/components/internal/status';
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
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <h4 className="text-sm font-medium text-foreground">
          Runs <span className="tabular font-mono text-[11px] text-faint">({shown.length})</span>
        </h4>
        <div className="flex items-center gap-1">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={cn(
                'rounded-paper px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors',
                filter === value ? 'bg-primary text-primary-foreground' : 'text-faint hover:bg-muted hover:text-foreground',
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border-t border-border">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="bg-muted text-[10.5px] uppercase tracking-[0.12em] text-faint">
            <tr>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Workflow</th>
              <th className="px-4 py-2 font-medium">Run</th>
              <th className="px-4 py-2 font-medium">Trigger</th>
              <th className="px-4 py-2 font-medium">Steps</th>
              <th className="px-4 py-2 text-right font-medium">Duration</th>
              <th className="px-4 py-2 text-right font-medium">Cost</th>
              <th className="px-4 py-2 font-medium">Started</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-solid divide-border">
            {shown.map((run) => (
              <tr
                key={run.id}
                className="cursor-pointer transition-colors hover:bg-muted"
                onClick={() => onSelect?.(run)}
              >
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <StatusMark state={markFor[run.status]} />
                    <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{run.status}</span>
                  </span>
                </td>
                <td className="px-4 py-2.5 font-medium text-foreground">{run.workflow}</td>
                <td className="px-4 py-2.5 font-mono text-[11.5px] text-faint">{run.id}</td>
                <td className="px-4 py-2.5 font-mono text-[11.5px] text-muted-foreground">{run.trigger ?? '—'}</td>
                <td className="tabular px-4 py-2.5 font-mono text-[11.5px] text-muted-foreground">
                  {run.stepsDone ?? 0}/{run.stepsTotal ?? 0}
                </td>
                <td className="tabular px-4 py-2.5 text-right font-mono text-[11.5px] text-muted-foreground">
                  {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : '—'}
                </td>
                <td className="tabular px-4 py-2.5 text-right font-mono text-[11.5px] text-muted-foreground">
                  ${(run.cost ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-2.5 font-mono text-[11.5px] text-faint">{run.startedAt ?? '—'}</td>
                <td className="px-2 py-2">
                  <span className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      aria-label="Re-run"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRerun?.(run);
                      }}
                      className="grid size-7 place-items-center rounded-paper text-faint transition-colors hover:bg-card hover:text-foreground"
                    >
                      <RotateCw className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Cancel"
                      onClick={(event) => {
                        event.stopPropagation();
                        onCancel?.(run);
                      }}
                      className="grid size-7 place-items-center rounded-paper text-faint transition-colors hover:bg-card hover:text-foreground"
                    >
                      <Square className="size-3.5" />
                    </button>
                  </span>
                </td>
              </tr>
            ))}
            {!shown.length ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-faint">
                  No runs match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
