# RateLimitMeter

The quota wall, before you hit it.

Per-provider and per-model usage against the limit for a window, with the reset countdown and a state that turns “close to limit” into something you can see in advance.

**Category:** Cost & limits · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge
```

Copy the file below into `src/components/agent-ops/rate-limit-meter.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<RateLimitMeter limits={limits} />
```

## Anatomy

```tsx
import { RateLimitMeter } from '@/components/agent-ops/rate-limit-meter';

// RateLimit: provider, model?, used, limit, window, resetIn (e.g. '14s', '—' for concurrency)
<RateLimitMeter limits={limits} />
```

## Examples

### Ok, close and exceeded

```tsx
<RateLimitMeter limits={limits} />
```

### A single provider

```tsx
<RateLimitMeter limits={limits.slice(0, 1)} />
```

## API reference

#### RateLimitMeter · RateLimit

State is derived: ok under 80%, close under 100%, exceeded at or over.

| Prop | Type | Description |
| --- | --- | --- |
| `provider / model?` | `string` | Provider name and optional model. |
| `used / limit` | `number` | Current usage and the ceiling. |
| `window` | `string` | minute, day, concurrent… |
| `resetIn` | `string` | Human countdown, e.g. 14s. |

## Source

`src/components/agent-ops/rate-limit-meter.tsx`

```tsx
'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { MeterBar } from './shared/meter-bar';
import { Panel, PanelBody, PanelHeader } from './shared/panel';

export interface RateLimit {
  id: string;
  provider: string;
  model?: string;
  used: number;
  limit: number;
  window: string;
  resetIn: string;
}

/** RateLimitMeter — the quota wall, before you hit it. */
export function RateLimitMeter({ limits, className }: { limits: RateLimit[]; className?: string }) {
  return (
    <Panel className={className}>
      <PanelHeader
        wrap={false}
        title="Rate limits"
        right={<span className="font-mono text-xs text-muted-foreground tabular-nums">{limits.length} providers</span>}
      />

      <PanelBody>
        <ul className="divide-y border-t">
          {limits.map((limit) => {
            const pct = Math.min(100, Math.round((limit.used / Math.max(1, limit.limit)) * 100));
            const state = pct >= 100 ? 'exceeded' : pct >= 80 ? 'close' : 'ok';
            return (
              <li key={limit.id} className="space-y-2 px-6 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{limit.provider}</span>
                    {limit.model ? (
                      <Badge variant="secondary" className="font-mono">
                        {limit.model}
                      </Badge>
                    ) : null}
                    <Badge variant={state === 'exceeded' ? 'destructive' : state === 'close' ? 'outline' : 'secondary'}>
                      {state === 'exceeded' ? 'exceeded' : state === 'close' ? 'close to limit' : 'ok'}
                    </Badge>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    resets in {limit.resetIn}
                  </span>
                </div>
                <MeterBar pct={pct} dim={pct >= 80} />
                <span className="block font-mono text-xs text-muted-foreground tabular-nums">
                  {limit.used.toLocaleString()} / {limit.limit.toLocaleString()} per {limit.window} · {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </PanelBody>
    </Panel>
  );
}
```
