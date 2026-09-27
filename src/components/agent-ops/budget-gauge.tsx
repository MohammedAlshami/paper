'use client';

import * as React from 'react';
import { TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/** BudgetGauge — spend against the budget, with the forecast you did not want. */
export function BudgetGauge({
  period = 'This month',
  budget,
  spent,
  forecast,
  thresholds = [50, 80, 100],
  className,
}: {
  period?: string;
  budget: number;
  spent: number;
  /** Projected end-of-period spend. */
  forecast?: number;
  thresholds?: number[];
  className?: string;
}) {
  const usedPct = Math.min(100, Math.round((spent / Math.max(budget, 0.01)) * 100));
  const forecastPct = forecast ? Math.min(100, Math.round((forecast / Math.max(budget, 0.01)) * 100)) : undefined;
  const over = (forecast ?? spent) > budget;

  return (
    <Card className={cn('gap-0 py-0', className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">Budget</CardTitle>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{period}</span>
          {over ? (
            <Badge variant="destructive">
              <TriangleAlert /> projected over
            </Badge>
          ) : (
            <Badge variant="outline">on track</Badge>
          )}
        </div>
      </CardHeader>

      <Separator />
      <CardContent className="space-y-4 py-4">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-medium tabular-nums">${spent.toFixed(2)}</span>
            <span className="font-mono text-xs text-muted-foreground">of ${budget.toFixed(2)}</span>
          </div>
          {forecast ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-muted-foreground">forecast</span>
              <span className="font-mono text-sm tabular-nums">${forecast.toFixed(2)}</span>
            </div>
          ) : null}
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground">remaining</span>
            <span className="font-mono text-sm tabular-nums">${Math.max(0, budget - spent).toFixed(2)}</span>
          </div>
        </div>

        <div className="relative">
          <span className="block h-2 w-full overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${usedPct}%` }} />
          </span>
          {forecastPct !== undefined ? (
            <span
              className="absolute top-0 h-2 w-0.5 rounded-full bg-foreground/40"
              style={{ left: `${forecastPct}%` }}
              title={`forecast ${forecastPct}%`}
            />
          ) : null}
          {thresholds.map((threshold) => (
            <span
              key={threshold}
              className="absolute -top-1 h-4 w-px bg-border"
              style={{ left: `${Math.min(100, threshold)}%` }}
              title={`${threshold}%`}
            />
          ))}
        </div>

        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          {usedPct}% used
          {forecastPct !== undefined ? ` · forecast ${forecastPct}%` : ''} · thresholds {thresholds.join(' / ')}%
        </p>
      </CardContent>
    </Card>
  );
}
