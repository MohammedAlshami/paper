'use client';

import * as React from 'react';
import { Bell, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type AnomalyKind = 'cost' | 'latency' | 'drift' | 'error-rate' | 'loop';

export interface Anomaly {
  id: string;
  kind: AnomalyKind;
  severity: 'low' | 'medium' | 'high';
  title: string;
  detail: string;
  runId?: string;
  detectedAt: string;
  acknowledged?: boolean;
}

const KIND_LABEL: Record<AnomalyKind, string> = {
  cost: 'Cost',
  latency: 'Latency',
  drift: 'Drift',
  'error-rate': 'Error rate',
  loop: 'Loop',
};

/** AnomalyFeed — the things a run did that it did not do yesterday. */
export function AnomalyFeed({
  anomalies,
  onAcknowledge,
  className,
}: {
  anomalies: Anomaly[];
  onAcknowledge?: (anomaly: Anomaly) => void;
  className?: string;
}) {
  const open = anomalies.filter((anomaly) => !anomaly.acknowledged).length;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 py-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Bell className="size-4 text-muted-foreground" /> Anomalies
        </CardTitle>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {open} open · {anomalies.length} total
        </span>
      </CardHeader>

      <CardContent className="p-0">
        <ul className="divide-y border-t">
          {anomalies.map((anomaly) => (
            <li key={anomaly.id} className="flex items-start gap-3 px-6 py-3">
              <span className="min-w-0 flex-1 space-y-1">
                <span className="flex flex-wrap items-center gap-2">
                  <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'}>{anomaly.severity}</Badge>
                  <Badge variant="outline">{KIND_LABEL[anomaly.kind]}</Badge>
                  <span className={cn('text-sm', anomaly.acknowledged ? 'text-muted-foreground' : 'font-medium')}>
                    {anomaly.title}
                  </span>
                </span>
                <span className="block text-sm text-muted-foreground">{anomaly.detail}</span>
                <span className="block font-mono text-xs text-muted-foreground">
                  {anomaly.detectedAt}
                  {anomaly.runId ? ` · ${anomaly.runId}` : ''}
                </span>
              </span>
              {anomaly.acknowledged ? (
                <span className="shrink-0 font-mono text-xs text-muted-foreground">acknowledged</span>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => onAcknowledge?.(anomaly)}>
                  <Check /> Acknowledge
                </Button>
              )}
            </li>
          ))}
          {!anomalies.length ? <li className="px-6 py-8 text-center text-sm text-muted-foreground">Nothing unusual.</li> : null}
        </ul>
      </CardContent>
    </Card>
  );
}
