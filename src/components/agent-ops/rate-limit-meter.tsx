'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">Rate limits</CardTitle>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{limits.length} providers</span>
      </CardHeader>

      <CardContent className="p-0">
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
                <span className="block h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <span className={cn('block h-full rounded-full', pct >= 80 ? 'bg-primary/45' : 'bg-primary')} style={{ width: `${pct}%` }} />
                </span>
                <span className="block font-mono text-xs text-muted-foreground tabular-nums">
                  {limit.used.toLocaleString()} / {limit.limit.toLocaleString()} per {limit.window} · {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
