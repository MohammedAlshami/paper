'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/internal/badge';
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

type Delta = { text: string; better?: boolean; worse?: boolean };

function delta(a?: number, b?: number, unit = 's', scale = 1000): Delta {
  if (a == null || b == null) return { text: '—' };
  const change = (b - a) / scale;
  if (Math.abs(change) < 0.05) return { text: 'same' };
  const sign = change > 0 ? '+' : '−';
  return {
    text: `${sign}${Math.abs(change).toFixed(unit === 'tok' ? 0 : 1)}${unit}`,
    better: change < 0,
    worse: change > 0,
  };
}

/** BranchCompare — parent run vs a fork, step by step. Did the change help? */
export function BranchCompare({ parent, branch, className }: { parent: Run; branch: Run; className?: string }) {
  const rows = Math.max(parent.steps.length, branch.steps.length);

  const totals = [
    ['duration', parent.elapsed, branch.elapsed],
    ['cost', `$${(parent.cost ?? 0).toFixed(2)}`, `$${(branch.cost ?? 0).toFixed(2)}`],
    ['tokens', (parent.tokens ?? 0).toLocaleString(), (branch.tokens ?? 0).toLocaleString()],
  ] as const;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <h4 className="text-sm font-medium text-foreground">Compare branches</h4>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="muted">{parent.id}</Badge>
          <span className="text-faint">→</span>
          <Badge tone="solid">{branch.id}</Badge>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-px border-y border-border bg-border">
        {totals.map(([label, base, fork]) => (
          <div key={label} className="bg-card px-4 py-3">
            <dt className="text-[10.5px] uppercase tracking-[0.12em] text-faint">{label}</dt>
            <dd className="mt-0.5 font-mono text-sm text-foreground">
              {base} <span className="text-faint">→</span> {fork}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="divide-y divide-solid divide-border">
        {Array.from({ length: rows }).map((_, i) => {
          const a = parent.steps[i];
          const b = branch.steps[i];
          const step = b ?? a;
          const durationDelta = delta(a?.durationMs, b?.durationMs, 's', 1000);
          const tokenDelta = delta(a?.tokens, b?.tokens, 'tok', 1);
          return (
            <li key={step.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2.5">
              <span className="flex min-w-0 items-center gap-2">
                {a ? <StatusMark state={markFor[a.status]} /> : <span className="size-4" />}
                <span className={cn('truncate text-sm', a ? 'text-muted-foreground' : 'text-faint')}>
                  {a?.name ?? '—'}
                </span>
              </span>
              <span className="min-w-[9rem] text-center">
                <span className="block truncate text-[11.5px] font-medium text-foreground">{step.name}</span>
                <span className="tabular mt-0.5 flex items-center justify-center gap-2 font-mono text-[10.5px]">
                  <span className={cn(durationDelta.better && 'text-foreground', durationDelta.worse && 'text-faint')}>
                    {durationDelta.text}
                  </span>
                  <span className={cn(tokenDelta.better && 'text-foreground', tokenDelta.worse && 'text-faint')}>
                    {tokenDelta.text}
                  </span>
                </span>
              </span>
              <span className="flex min-w-0 items-center justify-end gap-2">
                <span className={cn('truncate text-sm', b ? 'text-foreground' : 'text-faint')}>
                  {b?.name ?? '—'}
                </span>
                {b ? <StatusMark state={markFor[b.status]} /> : <span className="size-4" />}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
