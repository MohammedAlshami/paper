'use client';

import * as React from 'react';
import { GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
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
    <Card className={cn('gap-0 py-0', className)}>
      <CardHeader className="gap-3 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <GitBranch className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold tracking-tight">Fork from step</span>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {run.workflow} · {run.id} → {step.id}
            </p>
          </div>
          <Button size="sm" onClick={() => onFork?.({ branch, input })}>
            <GitBranch /> Create branch
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Everything before this step is reused. Change the input below and the run continues from here in a new branch —
          the original stays untouched.
        </p>
      </CardHeader>

      <Separator />
      <CardContent className="space-y-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="fork-branch">Branch name</Label>
          <Input
            id="fork-branch"
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
            className="font-mono text-xs"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="fork-input">Input to {step.name}</Label>
          <Textarea
            id="fork-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={5}
            className="font-mono text-xs leading-relaxed"
          />
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          lineage: {run.parentRunId ? `${run.parentRunId} → ` : ''}
          {run.id} → {branch}
        </p>
      </CardContent>
    </Card>
  );
}
