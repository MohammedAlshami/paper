'use client';

import * as React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Kpi {
  id: string;
  label: string;
  /** Already formatted, e.g. "94%" or "$0.41". */
  value: string;
  unit?: string;
  /** Percentage change against the last period. */
  delta?: number;
  /** Which direction of change is good. Decides whether a change is drawn as bad. */
  goodWhen?: 'up' | 'down';
  /** A short series, oldest first, drawn as a sparkline. */
  trend?: number[];
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => `${((index / (values.length - 1)) * 100).toFixed(1)},${(26 - ((value - min) / span) * 22).toFixed(1)}`);
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** FleetKpiStrip — the numbers a fleet manager checks first: availability, cost per km, open work, with change and a trend line. */
export function FleetKpiStrip({
  kpis,
  period = 'vs last month',
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  kpis: Kpi[];
  /** Label after each change, e.g. "vs last month". */
  period?: string;
  onSelect?: (kpi: Kpi) => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <dl className="grid grid-cols-2 @2xl:grid-cols-4 [&>*]:border-b [&>*]:border-r [&>*:nth-last-child(-n+2)]:border-b-0 @2xl:[&>*:nth-last-child(-n+4)]:border-b-0 [&>*:nth-child(2n)]:border-r-0 @2xl:[&>*:nth-child(2n)]:border-r @2xl:[&>*:nth-child(4n)]:border-r-0">
        {kpis.map((kpi) => {
          const up = (kpi.delta ?? 0) > 0;
          const bad = kpi.delta !== undefined && kpi.goodWhen !== undefined && (kpi.goodWhen === 'up' ? kpi.delta < 0 : kpi.delta > 0);
          const Arrow = up ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={kpi.id}>
              <button type="button" onClick={() => onSelect?.(kpi)} className="block h-full w-full px-4 py-4 text-left transition-colors hover:bg-muted/50">
                <dt className="text-xs text-muted-foreground">{kpi.label}</dt>
                <dd className="mt-1 flex items-baseline gap-1">
                  <span className="font-mono text-2xl font-semibold tabular-nums">{kpi.value}</span>
                  {kpi.unit ? <span className="text-xs text-muted-foreground">{kpi.unit}</span> : null}
                </dd>
                {kpi.delta !== undefined ? (
                  <dd className="mt-0.5 flex items-center gap-1 text-xs tabular-nums" style={bad ? { color: accentColor, fontWeight: 600 } : undefined}>
                    {kpi.delta === 0 ? null : <Arrow className="size-3.5" />}
                    <span className={cn('font-mono', !bad && 'text-muted-foreground')}>
                      {kpi.delta > 0 ? '+' : ''}
                      {kpi.delta.toFixed(1)}%
                    </span>
                    <span className="hidden font-normal text-muted-foreground sm:inline">{period}</span>
                  </dd>
                ) : null}
                {kpi.trend && kpi.trend.length > 1 ? (
                  <dd className="mt-2">
                    <Sparkline values={kpi.trend} color={bad ? accentColor : '#2e2e2e'} />
                  </dd>
                ) : null}
              </button>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}
