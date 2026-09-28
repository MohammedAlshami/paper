'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate } from './fleet-kit';

export interface DowntimeDay {
  /** ISO date. */
  date: string;
  /** Vehicles out of service that day, by reason. */
  scheduled: number;
  repair: number;
  inspection: number;
}

export interface DowntimeVehicle {
  id: string;
  vehicle: string;
  reason: 'scheduled' | 'repair' | 'inspection';
  /** ISO dates, inclusive. */
  from: string;
  to: string;
  detail?: string;
}

const REASONS = [
  { key: 'scheduled', label: 'Scheduled service' },
  { key: 'repair', label: 'Repair' },
  { key: 'inspection', label: 'Inspection' },
] as const;

/** DowntimeForecast — how many vehicles will be out of service each day, and which ones. */
export function DowntimeForecast({
  days,
  vehicles,
  fleetSize,
  accentColor = '#ec4899',
  className,
}: {
  days: DowntimeDay[];
  vehicles: DowntimeVehicle[];
  /** Total vehicles, to show availability. */
  fleetSize: number;
  accentColor?: string;
  className?: string;
}) {
  const colors = { scheduled: '#2e2e2e', repair: accentColor, inspection: '#a3a3a3' };
  const data = days.map((day) => ({ ...day, label: formatDate(day.date, { day: 'numeric', month: 'short' }), out: day.scheduled + day.repair + day.inspection }));
  const worst = data.reduce((max, day) => (day.out > max.out ? day : max), data[0]);
  const lowest = Math.round(((fleetSize - worst.out) / fleetSize) * 100);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-sm font-bold">Next {days.length} days</p>
          <p className="text-xs text-muted-foreground">Vehicles out of service</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Lowest availability</p>
          <p className="font-mono text-lg font-semibold tabular-nums" style={lowest < 75 ? { color: accentColor } : undefined}>
            {lowest}% <span className="text-xs font-normal text-muted-foreground">on {worst.label}</span>
          </p>
        </div>
      </div>

      <div className="h-56 px-2 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} interval="preserveStartEnd" minTickGap={16} />
            <YAxis allowDecimals={false} domain={[0, Math.max(fleetSize / 2, worst.out)]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} />
            <Tooltip cursor={{ fill: 'currentColor', fillOpacity: 0.06 }} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} formatter={(value) => <span className="text-muted-foreground">{value}</span>} />
            {REASONS.map((reason, index) => (
              <Bar key={reason.key} dataKey={reason.key} name={reason.label} stackId="out" fill={colors[reason.key]} radius={index === REASONS.length - 1 ? [3, 3, 0, 0] : 0} isAnimationActive={false} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="divide-y border-t">
        {vehicles.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="size-2 shrink-0 rounded-full" style={{ background: colors[item.reason] }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">
                {item.vehicle} {item.detail ? <span className="font-normal text-muted-foreground">· {item.detail}</span> : null}
              </span>
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {formatDate(item.from, { day: 'numeric', month: 'short' })}
              {item.to !== item.from ? ` to ${formatDate(item.to, { day: 'numeric', month: 'short' })}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
