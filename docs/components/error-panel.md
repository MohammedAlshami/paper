# ErrorPanel

What broke, and whether it is worth retrying.

The provider error, its type, status and attempt count, the stack and the exact request that caused it, with retry disabled when the error is not retryable.

**Category:** Observability · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge button separator
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/error-panel.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<ErrorPanel error={error} onRetry={() => retry(step.id)} onSkip={() => skip(step.id)} />
```

## Anatomy

```tsx
import { ErrorPanel } from '@/components/agent-ops/error-panel';

// RunError: type, message, retryable?, attempts?, provider?, status?, stack?, context?
<ErrorPanel error={error} onRetry={retry} />
```

## Examples

### Retryable provider error

```tsx
<ErrorPanel error={rateLimit} onRetry={retry} />
```

### Fatal error, no retry

```tsx
<ErrorPanel error={{ ...error, retryable: false }} />
```

## API reference

#### ErrorPanel · RunError

Retry is offered only when the error says so.

| Prop | Type | Description |
| --- | --- | --- |
| `type` | `string` | Machine name of the error. |
| `message` | `string` | One-line human explanation. |
| `retryable` | `boolean` | Disables the Retry button when false. |
| `stack / context` | `string` | Optional stack and request payload, each in its own well. |
| `provider / status / attempts` | `string · number · number` | Rendered as badges. |
| `onRetry / onSkip` | `() => void` | Step actions. |

## Source

`src/components/agent-ops/error-panel.tsx`

```tsx
'use client';

import * as React from 'react';
import { Copy, RotateCw, SkipForward, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface RunError {
  id: string;
  /** Machine name, e.g. ProviderRateLimitError. */
  type: string;
  message: string;
  /** Optional stack or provider response. */
  stack?: string;
  /** The payload that triggered it. */
  context?: string;
  retryable?: boolean;
  attempts?: number;
  provider?: string;
  status?: number;
}

/** ErrorPanel — what broke, whether it is worth retrying, and the payload that caused it. */
export function ErrorPanel({
  error,
  onRetry,
  onSkip,
  className,
}: {
  error: RunError;
  onRetry?: () => void;
  onSkip?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="gap-3 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <TriangleAlert className="size-4 text-destructive" />
              <span className="font-mono text-sm font-medium">{error.type}</span>
              {error.provider ? <Badge variant="secondary">{error.provider}</Badge> : null}
              {error.status ? <Badge variant="outline">{error.status}</Badge> : null}
              {error.retryable ? <Badge variant="outline">retryable</Badge> : <Badge variant="destructive">fatal</Badge>}
              {error.attempts && error.attempts > 1 ? (
                <span className="font-mono text-xs text-muted-foreground">×{error.attempts}</span>
              ) : null}
            </div>
            <p className="text-sm">{error.message}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="outline" onClick={onSkip}>
              <SkipForward /> Skip step
            </Button>
            <Button size="sm" onClick={onRetry} disabled={!error.retryable}>
              <RotateCw /> Retry
            </Button>
          </div>
        </div>
      </CardHeader>

      {error.stack || error.context ? (
        <>
          <Separator />
          <CardContent className="space-y-3 py-4">
            {error.stack ? (
              <div className="overflow-hidden rounded-lg border">
                <div className="flex items-center justify-between border-b bg-muted px-3 py-1.5">
                  <span className="font-mono text-xs text-muted-foreground">stack</span>
                  <Button size="icon" variant="ghost" aria-label="Copy stack">
                    <Copy />
                  </Button>
                </div>
                <pre className="max-h-56 overflow-auto p-3 font-mono text-xs leading-relaxed">{error.stack}</pre>
              </div>
            ) : null}
            {error.context ? (
              <div className="overflow-hidden rounded-lg border">
                <div className="border-b bg-muted px-3 py-1.5">
                  <span className="font-mono text-xs text-muted-foreground">request</span>
                </div>
                <pre className="max-h-56 overflow-auto p-3 font-mono text-xs leading-relaxed">{error.context}</pre>
              </div>
            ) : null}
          </CardContent>
        </>
      ) : null}
    </Card>
  );
}
```
