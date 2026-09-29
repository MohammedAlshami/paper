'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { clamp, formatDate, formatMoney, formatNumber } from './app-kit';

export interface UsageMeter {
  id: string;
  label: string;
  used: number;
  limit: number;
  /** Appended to the numbers, e.g. "GB". */
  unit?: string;
}

/** PlanUsageCard — the plan you are on, when it renews, and how much of each limit you have used. Over 85% turns to the accent colour. */
export function PlanUsageCard({
  planName,
  price,
  currency = 'USD',
  interval = 'month',
  renewsOn,
  meters,
  onUpgrade,
  onManage,
  accentColor = '#ec4899',
  className,
}: {
  planName: string;
  price: number;
  currency?: string;
  interval?: 'month' | 'year';
  /** ISO date of the next charge. */
  renewsOn: string;
  meters: UsageMeter[];
  onUpgrade?: () => void;
  onManage?: () => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
        <div>
          <p className="text-xs text-muted-foreground">Current plan</p>
          <p className="mt-0.5 text-lg font-bold">{planName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Renews {formatDate(renewsOn)}</p>
        </div>
        <p className="text-right">
          <span className="font-mono text-2xl font-semibold tabular-nums">{formatMoney(price, currency)}</span>
          <span className="block text-xs text-muted-foreground">per {interval}</span>
        </p>
      </div>

      <ul className="space-y-4 p-4">
        {meters.map((meter) => {
          const percent = clamp((meter.used / meter.limit) * 100);
          const high = percent >= 85;
          return (
            <li key={meter.id}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">{meter.label}</span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground" style={high ? { color: accentColor, fontWeight: 600 } : undefined}>
                  {formatNumber(meter.used)} / {formatNumber(meter.limit)}
                  {meter.unit ? ` ${meter.unit}` : ''}
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label={meter.label}
                aria-valuenow={Math.round(percent)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full" style={{ width: `${percent}%`, background: high ? accentColor : '#2e2e2e' }} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap justify-end gap-2 border-t p-3">
        <Button variant="outline" size="sm" onClick={onManage}>
          Manage billing
        </Button>
        <Button size="sm" onClick={onUpgrade}>
          Upgrade plan
        </Button>
      </div>
    </Card>
  );
}
