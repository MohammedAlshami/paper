'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusMark, type Mark } from '@/components/internal/status-mark';
import { cn } from '@/lib/utils';

export type SpanKind = 'agent' | 'llm' | 'tool' | 'retrieval' | 'human' | 'internal';

export interface Span {
  id: string;
  name: string;
  kind: SpanKind;
  /** Offset from the start of the trace, in milliseconds. */
  startMs: number;
  durationMs: number;
  status: 'running' | 'done' | 'failed' | 'skipped';
  depth?: number;
  detail?: string;
}

const markFor: Record<Span['status'], Mark> = {
  running: 'running',
  done: 'done',
  failed: 'failed',
  skipped: 'skipped',
};

/** SpanWaterfall — the trace, drawn to scale. Where did the time actually go? */
export function SpanWaterfall({
  spans,
  onSelectSpan,
  className,
}: {
  spans: Span[];
  onSelectSpan?: (span: Span) => void;
  className?: string;
}) {
  const total = Math.max(...spans.map((span) => span.startMs + span.durationMs), 1);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">Trace</CardTitle>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {spans.length} spans · {(total / 1000).toFixed(1)}s
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y border-t">
          {spans.map((span) => (
            <li key={span.id}>
              <button
                type="button"
                onClick={() => onSelectSpan?.(span)}
                className="flex w-full items-center gap-3 px-6 py-2 text-left transition-colors hover:bg-muted/60"
              >
                <StatusMark state={markFor[span.status]} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className="truncate text-sm"
                      style={{ paddingInlineStart: `${(span.depth ?? 0) * 14}px` }}
                    >
                      {span.name}
                    </span>
                    <Badge variant="secondary" className="font-mono">
                      {span.kind}
                    </Badge>
                    {span.detail ? (
                      <span className="truncate font-mono text-xs text-muted-foreground">{span.detail}</span>
                    ) : null}
                  </span>
                  <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <span
                      className={cn('block h-full rounded-full', span.status === 'failed' ? 'bg-primary/35' : 'bg-primary')}
                      style={{
                        marginInlineStart: `${(span.startMs / total) * 100}%`,
                        width: `${Math.max(0.5, (span.durationMs / total) * 100)}%`,
                      }}
                    />
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                  {span.durationMs >= 1000 ? `${(span.durationMs / 1000).toFixed(2)}s` : `${span.durationMs}ms`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
