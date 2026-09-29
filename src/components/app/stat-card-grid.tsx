'use client';

import * as React from 'react';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Stat {
  id: string;
  label: string;
  /** Already formatted, e.g. "$48,200" or "1,284". */
  value: string;
  icon?: LucideIcon;
  /** Percentage change against the last period. */
  delta?: number;
  /** Which direction of change is good. Decides whether a change is drawn as bad. */
  goodWhen?: 'up' | 'down';
  /** A short series, oldest first, drawn as a sparkline. */
  trend?: number[];
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const points = values.map((value, index) => `${((index / (values.length - 1)) * 100).toFixed(1)},${(26 - ((value - min) / span) * 22).toFixed(1)}`);
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** StatCardGrid — the headline numbers of a dashboard, one card each, with change against last period and a trend line. */
export function StatCardGrid({
  stats,
  period = 'vs last month',
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  stats: Stat[];
  /** Label after each change, e.g. "vs last month". */
  period?: string;
  onSelect?: (stat: Stat) => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <div className={cn('@container', className)}>
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-4">
        {stats.map((stat) => {
          const up = (stat.delta ?? 0) > 0;
          const bad = stat.delta !== undefined && stat.goodWhen !== undefined && (stat.goodWhen === 'up' ? stat.delta < 0 : stat.delta > 0);
          const Arrow = up ? ArrowUpRight : ArrowDownRight;
          const Icon = stat.icon;
          return (
            <Card key={stat.id} className="gap-0 overflow-hidden py-0">
              <button type="button" onClick={() => onSelect?.(stat)} className="block h-full w-full px-4 py-4 text-left transition-colors hover:bg-muted/50">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  {Icon ? <Icon className="size-4 text-muted-foreground" aria-hidden /> : null}
                </div>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{stat.value}</p>
                {stat.delta !== undefined ? (
                  <p className="mt-0.5 flex items-center gap-1 text-xs tabular-nums" style={bad ? { color: accentColor, fontWeight: 600 } : undefined}>
                    {stat.delta === 0 ? null : <Arrow className="size-3.5" />}
                    <span className={cn('font-mono', !bad && 'text-muted-foreground')}>
                      {stat.delta > 0 ? '+' : ''}
                      {stat.delta.toFixed(1)}%
                    </span>
                    <span className="font-normal text-muted-foreground">{period}</span>
                  </p>
                ) : null}
                {stat.trend && stat.trend.length > 1 ? (
                  <div className="mt-3">
                    <Sparkline values={stat.trend} color={bad ? accentColor : '#2e2e2e'} />
                  </div>
                ) : null}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
