# SpanWaterfall

The trace, drawn to scale. Where did the time actually go?

Nested spans with their offset and duration drawn as bars against the total, so a slow tool or a long human wait is visible at a glance rather than inferred from timestamps.

**Category:** Observability · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/span-waterfall.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<SpanWaterfall spans={spans} onSelectSpan={(span) => select(span.id)} />
```

## Anatomy

```tsx
import { SpanWaterfall } from '@/components/agent-ops/span-waterfall';

// Span: id, name, kind, startMs, durationMs, status, depth?, detail?
<SpanWaterfall spans={trace.spans} onSelectSpan={openSpan} />
```

## Examples

### A retried tool and a human step

```tsx
<SpanWaterfall spans={spans} />
```

### Failures are drawn lighter

```tsx
<SpanWaterfall spans={spans.filter((s) => s.status === 'failed')} />
```

## API reference

#### SpanWaterfall · Span

A flat span list with a depth per span; nesting is expressed by depth.

| Prop | Type | Description |
| --- | --- | --- |
| `spans` | `Span[]` | id, name, kind, startMs, durationMs, status, depth?, detail? |
| `kind` | `'agent' | 'llm' | 'tool' | 'retrieval' | 'human' | 'internal'` | Shown as a badge. |
| `depth` | `number` | Indentation level. Defaults to 0. |
| `onSelectSpan` | `(span: Span) => void` | Called when a span is clicked. |

## Source

`src/components/agent-ops/span-waterfall.tsx`

```tsx
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
```
