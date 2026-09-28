'use client';

import * as React from 'react';
import { BatteryCharging, Droplets } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { clamp, formatDate } from './fleet-kit';

export interface FluidLevel {
  id: string;
  label: string;
  /** 0 to 100. */
  level: number;
  note?: string;
  /** Below this it is drawn as low. */
  lowBelow?: number;
}

export interface BatteryStatus {
  voltage: number;
  /** State of health, 0 to 100. */
  healthPercent: number;
  coldCrankAmps: number;
  /** ISO date of the last load test. */
  testedOn: string;
}

/** FluidsAndBatteryPanel — the small things that strand a vehicle: oil life, coolant, brake fluid, and the battery. */
export function FluidsAndBatteryPanel({
  vehicle,
  fluids,
  battery,
  accentColor = '#ec4899',
  className,
}: {
  vehicle: string;
  fluids: FluidLevel[];
  battery: BatteryStatus;
  accentColor?: string;
  className?: string;
}) {
  const batteryLow = battery.healthPercent < 60 || battery.voltage < 12.4;
  const lowCount = fluids.filter((fluid) => fluid.level < (fluid.lowBelow ?? 25)).length + (batteryLow ? 1 : 0);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-baseline justify-between gap-3 border-b px-4 py-3">
        <p className="text-sm font-bold">{vehicle}</p>
        <p className="text-xs text-muted-foreground">{lowCount ? `${lowCount} low` : 'All good'}</p>
      </div>

      <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <ul className="space-y-3.5 p-4">
          {fluids.map((fluid) => {
            const low = fluid.level < (fluid.lowBelow ?? 25);
            return (
              <li key={fluid.id}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Droplets className="size-3.5 text-muted-foreground" /> {fluid.label}
                  </span>
                  <span className="font-mono text-xs tabular-nums" style={low ? { color: accentColor, fontWeight: 600 } : undefined}>
                    {Math.round(fluid.level)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${fluid.label} ${Math.round(fluid.level)} percent`}>
                  <div className="h-full rounded-full" style={{ width: `${clamp(fluid.level)}%`, background: low ? accentColor : '#2e2e2e' }} />
                </div>
                {fluid.note ? <p className="mt-1 text-[11px] text-muted-foreground">{fluid.note}</p> : null}
              </li>
            );
          })}
          </ul>

          <div className="p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BatteryCharging className="size-4 text-muted-foreground" /> Battery
            </div>
            <p className="mt-3 font-mono text-3xl font-semibold tabular-nums" style={batteryLow ? { color: accentColor } : undefined}>
              {battery.voltage.toFixed(1)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">V</span>
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Health</dt>
                  <dd className="font-mono tabular-nums">{battery.healthPercent}%</dd>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${battery.healthPercent}%`, background: batteryLow ? accentColor : '#2e2e2e' }} />
                </div>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cold crank</dt>
                <dd className="font-mono tabular-nums">{battery.coldCrankAmps} A</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last test</dt>
                <dd>{formatDate(battery.testedOn, { day: 'numeric', month: 'short' })}</dd>
              </div>
            </dl>
            {batteryLow ? <p className="mt-3 text-xs font-medium" style={{ color: accentColor }}>Likely to fail this winter. Plan a replacement.</p> : null}
          </div>
        </div>
    </Card>
  );
}
