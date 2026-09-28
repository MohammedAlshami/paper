'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface UsageSeries {
  key: string;
  label: string;
}

/** PartsUsageChart — how fast parts are used up, month by month. Tap a part to show or hide it. */
export function PartsUsageChart({
  data,
  series,
  title = 'Parts used',
  unit = 'units',
  accentColor = '#ec4899',
  className,
}: {
  /** One row per period: { label: 'Jan', brakePads: 12, oilFilters: 30, ... }. */
  data: Array<Record<string, number | string>>;
  series: UsageSeries[];
  title?: string;
  unit?: string;
  accentColor?: string;
  className?: string;
}) {
  const palette = [accentColor, '#2e2e2e', '#767676', '#a3a3a3', '#d4d4d4'];
  const [hidden, setHidden] = React.useState<string[]>([]);
  const visible = series.filter((item) => !hidden.includes(item.key));
  const totals = series.map((item) => ({ ...item, total: data.reduce((sum, row) => sum + Number(row[item.key] ?? 0), 0) }));
  const grand = totals.filter((item) => !hidden.includes(item.key)).reduce((sum, item) => sum + item.total, 0);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pb-1 pt-3">
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            {grand.toLocaleString()} {unit} in {data.length} months
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 px-4 pb-2">
        {totals.map((item, index) => {
          const off = hidden.includes(item.key);
          return (
            <button key={item.key} type="button" aria-pressed={!off} onClick={() => setHidden((current) => (off ? current.filter((key) => key !== item.key) : [...current, item.key]))}>
              <Badge variant="outline" className={cn('gap-1.5', off && 'opacity-40')}>
                <span className="size-2 rounded-full" style={{ background: palette[index % palette.length] }} />
                {item.label} <span className="font-mono tabular-nums text-muted-foreground">{item.total}</span>
              </Badge>
            </button>
          );
        })}
      </div>
      <div className="h-56 px-2 pb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            {visible.map((item) => {
              const color = palette[series.indexOf(item) % palette.length];
              return <Area key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={color} fill={color} fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />;
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
