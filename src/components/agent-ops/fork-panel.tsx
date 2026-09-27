'use client';

import * as React from 'react';
import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/internal/button';
import { Card } from '@/components/internal/card';
import type { Run, RunStep } from './types';

/** ForkPanel — branch a run from a step, editing the state on the way in. */
export function ForkPanel({
  run,
  step,
  onFork,
  className,
}: {
  run: Run;
  step: RunStep;
  onFork?: (payload: { branch: string; input: string }) => void;
  className?: string;
}) {
  const [branch, setBranch] = React.useState(`${run.id}-fork`);
  const [input, setInput] = React.useState(step.input ?? '');

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <GitBranch className="size-4 text-muted-foreground" />
            <h4 className="font-display text-base font-bold tracking-tight text-foreground">Fork from step</h4>
          </div>
          <p className="mt-1 font-mono text-[11px] text-faint">
            {run.workflow} · {run.id} → {step.id}
          </p>
        </div>
        <Button size="sm" onClick={() => onFork?.({ branch, input })}>
          <GitBranch className="size-3.5" /> Create branch
        </Button>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Everything before this step is reused. Change the input below and the run continues from here in a new
        branch — the original stays untouched.
      </p>

      <div className="mt-4 grid gap-3">
        <label className="block">
          <span className="mb-1.5 block text-[10.5px] uppercase tracking-[0.12em] text-faint">branch name</span>
          <input
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
            className="h-9 w-full rounded-paper border border-border-strong bg-card px-3 font-mono text-[12.5px] text-foreground outline-none transition-colors focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10.5px] uppercase tracking-[0.12em] text-faint">
            input to {step.name} (editable)
          </span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={5}
            className="w-full resize-y rounded-paper border border-border-strong bg-card p-3 font-mono text-[12px] leading-relaxed text-foreground outline-none transition-colors focus:border-primary"
          />
        </label>
      </div>

      <p className="mt-3 font-mono text-[11px] text-faint">
        lineage: {run.parentRunId ? `${run.parentRunId} → ` : ''}
        {run.id} → {branch}
      </p>
    </Card>
  );
}
