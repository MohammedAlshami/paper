'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/internal/card';
import type { Kpi, TrendPoint } from './types';

/** RunMetrics — the portfolio view: are the workflows healthy, and what is failing. */
export function RunMetrics({
  workflow = 'All workflows',
  window = 'Last 14 days',
  kpis,
  trend,
  failures,
  className,
}: {
  workflow?: string;
  window?: string;
  kpis: Kpi[];
  trend: TrendPoint[];
  failures: { reason: string; count: number }[];
  className?: string;
}) {
  const max = Math.max(...trend.map((point) => point.value), 1);
  const failureMax = Math.max(...failures.map((item) => item.count), 1);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <h4 className="text-sm font-medium text-foreground">{workflow}</h4>
        <span className="font-mono text-[11px] text-faint">{window}</span>
      </div>

      <dl className="grid grid-cols-2 gap-px border-y border-border bg-border lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card px-4 py-3.5">
            <dt className="text-[10.5px] uppercase tracking-[0.12em] text-faint">{kpi.label}</dt>
            <dd className="tabular mt-1 font-mono text-xl font-medium text-foreground">{kpi.value}</dd>
            {kpi.delta || kpi.hint ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {kpi.delta ? <span className="tabular font-mono">{kpi.delta} </span> : null}
                {kpi.hint}
              </p>
            ) : null}
          </div>
        ))}
      </dl>

      <div className="p-4">
        <p className="mb-3 text-[10.5px] uppercase tracking-[0.12em] text-faint">runs per day</p>
        <div className="flex h-28 items-end gap-1.5">
          {trend.map((point) => (
            <div key={point.label} className="group flex min-w-0 flex-1 flex-col justify-end gap-0.5">
              {point.failed ? <div className="hatch w-full rounded-t-[2px]" style={{ height: '25%' }} /> : null}
              <div
                className={cn('w-full rounded-t-[2px]', point.failed ? 'bg-primary/45' : 'bg-primary')}
                style={{ height: `${Math.max(4, (point.value / max) * 100)}%` }}
                title={`${point.label}: ${point.value}`}
              />
              <span className="truncate text-center font-mono text-[9.5px] text-faint opacity-0 transition-opacity group-hover:opacity-100">
                {point.label}
              </span>
            </div>
          ))}
        </div>

        <p className="mb-3 mt-6 text-[10.5px] uppercase tracking-[0.12em] text-faint">why runs fail</p>
        <ul className="space-y-2">
          {failures.map((item) => (
            <li key={item.reason} className="grid grid-cols-[1fr_3rem] items-center gap-3">
              <span className="min-w-0">
                <span className="mb-1 block truncate text-sm text-muted-foreground">{item.reason}</span>
                <span className="hatch block h-1.5 rounded-full" style={{ width: `${(item.count / failureMax) * 100}%` }} />
              </span>
              <span className="tabular text-right font-mono text-[11.5px] text-foreground">{item.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
