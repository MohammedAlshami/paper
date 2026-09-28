# Playground

One input, several variants, until one wins.

The same input run through several models or settings side by side, each with its output, latency, tokens, cost and score — and a winner you can pick and keep.

**Category:** Evaluation · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge button
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/playground.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<Playground
  input={testCase.input}
  variants={variants}
  pickedId={winner}
  onPick={(variant) => setWinner(variant.id)}
  onRun={() => runAll()}
/>
```

## Anatomy

```tsx
import { Playground } from '@/components/agent-ops/playground';

// PlaygroundVariant: id, label, model, output, latencyMs?, tokens?, cost?, score?
<Playground input={input} variants={variants} onPick={pick} />
```

## Examples

### Three variants, one picked

```tsx
<Playground input={input} variants={variants} pickedId="v1" />
```

## API reference

#### Playground · PlaygroundVariant

Variants lay out in a responsive grid.

| Prop | Type | Description |
| --- | --- | --- |
| `input` | `string` | Shown once above the variants. |
| `variants` | `PlaygroundVariant[]` | id, label, model, output, latencyMs?, tokens?, cost?, score? |
| `pickedId` | `string` | Highlights the winner. |
| `onPick` | `(variant) => void` | Called when a variant is picked. |

## Source

`src/components/agent-ops/playground.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface PlaygroundVariant {
  id: string;
  label: string;
  model: string;
  output: string;
  tokens?: number;
  cost?: number;
  latencyMs?: number;
  score?: number;
}

/** Playground — one input, several variants, side by side, until one wins. */
export function Playground({
  title = 'Playground',
  input,
  variants,
  pickedId,
  onPick,
  onRun,
  className,
}: {
  title?: string;
  input?: string;
  variants: PlaygroundVariant[];
  pickedId?: string;
  onPick?: (variant: PlaygroundVariant) => void;
  onRun?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn('gap-0 py-0', className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground tabular-nums">{variants.length} variants</span>
          <Button size="sm" onClick={onRun}>
            <Play /> Run all
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 py-4 lg:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]">
        {input ? (
          <div className="lg:col-span-full">
            <span className="font-mono text-xs text-muted-foreground">input</span>
            <pre className="mt-1 overflow-auto rounded-lg border bg-muted p-3 font-mono text-xs leading-relaxed">{input}</pre>
          </div>
        ) : null}

        {variants.map((variant) => {
          const picked = variant.id === pickedId;
          return (
            <div
              key={variant.id}
              className={cn('flex flex-col gap-3 rounded-lg border p-4', picked && 'border-primary')}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{variant.label}</span>
                {picked ? <Badge>picked</Badge> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  {variant.model}
                </Badge>
                {typeof variant.score === 'number' ? (
                  <Badge variant="outline" className="font-mono tabular-nums">
                    {variant.score}/100
                  </Badge>
                ) : null}
              </div>

              <p className="min-h-24 rounded-lg bg-muted p-3 text-sm leading-relaxed">{variant.output}</p>

              <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground tabular-nums">
                {variant.latencyMs ? (
                  <div className="flex gap-1.5">
                    <dt>latency</dt>
                    <dd>{(variant.latencyMs / 1000).toFixed(1)}s</dd>
                  </div>
                ) : null}
                {variant.tokens ? (
                  <div className="flex gap-1.5">
                    <dt>tokens</dt>
                    <dd>{variant.tokens.toLocaleString()}</dd>
                  </div>
                ) : null}
                {variant.cost ? (
                  <div className="flex gap-1.5">
                    <dt>cost</dt>
                    <dd>${variant.cost.toFixed(4)}</dd>
                  </div>
                ) : null}
              </dl>

              <Button size="sm" variant={picked ? 'default' : 'outline'} className="mt-auto" onClick={() => onPick?.(variant)}>
                <Check /> {picked ? 'Winner' : 'Pick winner'}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
```
