'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
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

function delta(base?: number, fork?: number, unit = 's', scale = 1000) {
  if (base == null || fork == null) return { text: '—', better: false, worse: false };
  const change = (fork - base) / scale;
  if (Math.abs(change) < 0.05) return { text: 'same', better: false, worse: false };
  return {
    text: `${change > 0 ? '+' : '−'}${Math.abs(change).toFixed(unit === 'tok' ? 0 : 1)}${unit}`,
    better: change < 0,
    worse: change > 0,
  };
}

/** BranchCompare — parent run vs a fork, step by step. Did the change help? */
export function BranchCompare({ parent, branch, className }: { parent: Run; branch: Run; className?: string }) {
  const rows = Math.max(parent.steps.length, branch.steps.length);
  const totals = [
    ['Duration', parent.elapsed ?? '—', branch.elapsed ?? '—'],
    ['Cost', `$${(parent.cost ?? 0).toFixed(2)}`, `$${(branch.cost ?? 0).toFixed(2)}`],
    ['Tokens', (parent.tokens ?? 0).toLocaleString(), (branch.tokens ?? 0).toLocaleString()],
  ] as const;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">Compare branches</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {parent.id}
          </Badge>
          <ArrowRight className="size-3.5 text-muted-foreground" />
          <Badge className="font-mono">{branch.id}</Badge>
        </div>
      </CardHeader>

      <div className="grid grid-cols-3 divide-x border-y">
        {totals.map(([label, base, fork]) => (
          <div key={label} className="px-6 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-0.5 font-mono text-sm tabular-nums">
              {base} <span className="text-muted-foreground">→</span> {fork}
            </p>
          </div>
        ))}
      </div>

      <CardContent className="p-0">
        <Table>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => {
              const before = parent.steps[index];
              const after = branch.steps[index];
              const step = after ?? before;
              const duration = delta(before?.durationMs, after?.durationMs, 's', 1000);
              const tokens = delta(before?.tokens, after?.tokens, 'tok', 1);
              return (
                <TableRow key={step.id}>
                  <TableCell className="w-1/3">
                    <span className="flex min-w-0 items-center gap-2">
                      {before ? <StatusMark state={markFor[before.status]} /> : <span className="size-4" />}
                      <span className={cn('truncate text-sm', before ? 'text-muted-foreground' : 'text-muted-foreground/50')}>
                        {before?.name ?? '—'}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="w-1/3 text-center">
                    <span className="flex items-center justify-center gap-2 font-mono text-xs text-muted-foreground tabular-nums">
                      <span className={cn(duration.better && 'text-foreground', duration.worse && 'text-muted-foreground/60')}>
                        {duration.text}
                      </span>
                      <span className={cn(tokens.better && 'text-foreground', tokens.worse && 'text-muted-foreground/60')}>
                        {tokens.text}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="w-1/3">
                    <span className="flex min-w-0 items-center justify-end gap-2">
                      <span className={cn('truncate text-sm', after ? '' : 'text-muted-foreground/50')}>
                        {after?.name ?? '—'}
                      </span>
                      {after ? <StatusMark state={markFor[after.status]} /> : <span className="size-4" />}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
