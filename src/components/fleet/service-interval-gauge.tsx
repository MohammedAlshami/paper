'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { clamp, formatNumber } from './fleet-kit';

export interface ServiceInterval {
  id: string;
  label: string;
  /** The service repeats every this many kilometres. */
  everyKm: number;
  /** Odometer reading when it was last done. */
  lastDoneKm: number;
}

function state(used: number) {
  return used >= 1 ? 'overdue' : used >= 0.85 ? 'soon' : 'ok';
}

/** ServiceIntervalGauge — how far through each service interval a vehicle is: oil, tyres, brakes, and so on. */
export function ServiceIntervalGauge({
  vehicle,
  odometerKm,
  intervals,
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  vehicle: string;
  odometerKm: number;
  intervals: ServiceInterval[];
  onSelect?: (interval: ServiceInterval) => void;
  accentColor?: string;
  className?: string;
}) {
  const rows = intervals
    .map((interval) => {
      const done = odometerKm - interval.lastDoneKm;
      const used = done / interval.everyKm;
      return { interval, done, used, remaining: interval.everyKm - done, status: state(used) };
    })
    .sort((a, b) => b.used - a.used);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-baseline justify-between gap-3 border-b px-4 py-3">
        <p className="text-sm font-bold">{vehicle}</p>
        <p className="font-mono text-xs tabular-nums text-muted-foreground">{formatNumber(odometerKm)} km</p>
      </div>
      <ul className="divide-y">
        {rows.map(({ interval, used, remaining, status }) => (
          <li key={interval.id}>
            <button type="button" onClick={() => onSelect?.(interval)} className="block w-full px-4 py-3 text-left transition-colors hover:bg-muted/50">
              <span className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-bold">{interval.label}</span>
                <span className="font-mono text-xs tabular-nums" style={status === 'overdue' ? { color: accentColor } : undefined}>
                  {remaining < 0 ? `${formatNumber(-remaining)} km over` : `${formatNumber(remaining)} km left`}
                </span>
              </span>
              <span className="relative mt-2 block h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${Math.round(used * 100)}% of the interval used`}>
                <span
                  className="block h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${clamp(used * 100)}%`, background: status === 'ok' ? '#2e2e2e' : accentColor, opacity: status === 'soon' ? 0.65 : 1 }}
                />
              </span>
              <span className="mt-1 flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
                <span>done at {formatNumber(interval.lastDoneKm)}</span>
                <span>every {formatNumber(interval.everyKm)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
