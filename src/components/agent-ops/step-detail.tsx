'use client';

import * as React from 'react';
import { Copy, Pencil, RotateCw, SkipForward } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusMark, type Mark } from '@/components/internal/status-mark';
import { cn } from '@/lib/utils';
import type { RunStep } from './types';

const markFor: Record<RunStep['status'], Mark> = {
  queued: 'queued',
  running: 'running',
  done: 'done',
  waiting: 'waiting',
  failed: 'failed',
  skipped: 'skipped',
};

function Payload({ label, value }: { label: string; value: string }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b bg-muted px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">{label}</span>
      </div>
      <pre className="max-h-64 overflow-auto p-3 font-mono text-xs leading-relaxed">{value}</pre>
    </div>
  );
}

/** StepDetail — everything about one step: payloads, cost, retries, errors. */
export function StepDetail({
  step,
  onRetry,
  onSkip,
  className,
}: {
  step?: RunStep;
  onRetry?: () => void;
  onSkip?: () => void;
  className?: string;
}) {
  if (!step) {
    return (
      <Card className={cn('grid min-h-64 place-items-center', className)}>
        <p className="text-sm text-muted-foreground">Select a step to inspect it.</p>
      </Card>
    );
  }

  const stats: [string, string][] = [
    ['Duration', step.durationMs ? `${(step.durationMs / 1000).toFixed(1)}s` : '—'],
    ['Tokens', step.tokens ? step.tokens.toLocaleString() : '—'],
    ['Cost', step.cost ? `$${step.cost.toFixed(4)}` : '—'],
    ['Status', step.status],
  ];

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="gap-3 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusMark state={markFor[step.status]} />
              <span className="text-sm font-semibold tracking-tight">{step.name}</span>
              <Badge variant="secondary">{step.type}</Badge>
              {step.attempt && step.attempt > 1 ? <Badge variant="outline">attempt {step.attempt}</Badge> : null}
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {step.id}
              {step.startedAt ? ` · ${step.startedAt}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RotateCw /> Retry
            </Button>
            <Button size="sm" variant="ghost" onClick={onSkip}>
              <SkipForward /> Skip
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator />
      <div className="grid grid-cols-2 divide-x sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="px-6 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-0.5 font-mono text-sm tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <Separator />

      <CardContent className="space-y-3 py-4">
        {step.error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
            <p className="text-xs text-muted-foreground">Error</p>
            <p className="mt-1 font-mono text-xs text-destructive">{step.error}</p>
          </div>
        ) : null}

        {step.input || step.output ? (
          <Tabs defaultValue="input">
            <TabsList>
              {step.input ? <TabsTrigger value="input">Input</TabsTrigger> : null}
              {step.output ? <TabsTrigger value="output">Output</TabsTrigger> : null}
            </TabsList>
            {step.input ? (
              <TabsContent value="input" className="mt-3">
                <Payload label="input" value={step.input} />
              </TabsContent>
            ) : null}
            {step.output ? (
              <TabsContent value="output" className="mt-3">
                <Payload label="output" value={step.output} />
              </TabsContent>
            ) : null}
          </Tabs>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button size="sm" variant="ghost">
            <Pencil /> Edit input
          </Button>
          <Button size="sm" variant="ghost">
            <Copy /> Copy payload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
