# FuelEconomyTrend

One vehicle’s fuel economy against the fleet.

A vehicle picker, three numbers (average, difference from the fleet, the last three months against the first three), and a line chart of the vehicle against the fleet average. It says whether each is better or worse for the direction you set.

**Category:** Tyres, fuel and fluids · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `recharts lucide-react`

Copy the file below into `src/components/fleet/fuel-economy-trend.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<FuelEconomyTrend
  data={[
    { label: 'Oct', v12: 11.6, v21: 13.1, fleet: 11.9 },
    { label: 'Nov', v12: 11.9, v21: 13.6, fleet: 12.1 },
  ]}
  vehicles={[{ id: 'v12', name: 'Van 12' }, { id: 'v21', name: 'Van 21' }]}
  defaultVehicleId="v21"
  unit="L/100 km"
/>
```

## Anatomy

```tsx
import { FuelEconomyTrend } from '@/components/fleet/fuel-economy-trend';

// Each row has a label, the fleet average under fleetKey ("fleet"), and one number per vehicle id.
// lowerIsBetter: true for L/100 km, false for mpg.
<FuelEconomyTrend data={rows} vehicles={vehicles} />
```

## Examples

### A vehicle that beats the fleet

```tsx
<FuelEconomyTrend data={rows} vehicles={vehicles} defaultVehicleId="v03" />
```

## API reference

#### FuelEconomyTrend

A vehicle against the fleet.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `FuelEconomyPoint[]` | — | label, the fleet average, and a number for each vehicle id. |
| `vehicles` | `{ id; name }[]` | — | The vehicles in the picker. |
| `defaultVehicleId` | `string` | — | The vehicle shown first. |
| `fleetKey` | `string` | `'fleet'` | The row key holding the fleet average. |
| `unit` | `string` | `'L/100 km'` | The unit label. |
| `lowerIsBetter` | `boolean` | `true` | True for L/100 km, false for mpg. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the vehicle line and worse-than-fleet numbers. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/fuel-economy-trend.tsx`

```tsx
'use client';

import * as React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FuelEconomyPoint {
  label: string;
  /** Economy for each vehicle in this period, by vehicle id. */
  [vehicleId: string]: number | string;
}

/** FuelEconomyTrend — one vehicle's fuel economy over time, against the fleet average. */
export function FuelEconomyTrend({
  data,
  vehicles,
  defaultVehicleId,
  fleetKey = 'fleet',
  unit = 'L/100 km',
  lowerIsBetter = true,
  accentColor = '#ec4899',
  className,
}: {
  data: FuelEconomyPoint[];
  vehicles: { id: string; name: string }[];
  defaultVehicleId?: string;
  /** The key in each row holding the fleet average. */
  fleetKey?: string;
  unit?: string;
  /** True for L/100 km, false for mpg. Decides which direction counts as improving. */
  lowerIsBetter?: boolean;
  accentColor?: string;
  className?: string;
}) {
  const [vehicleId, setVehicleId] = React.useState(defaultVehicleId ?? vehicles[0]?.id);
  const vehicle = vehicles.find((item) => item.id === vehicleId) ?? vehicles[0];

  const series = data.map((row) => Number(row[vehicle.id]));
  const fleet = data.map((row) => Number(row[fleetKey]));
  const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const avg = mean(series);
  const diff = avg - mean(fleet);
  const better = lowerIsBetter ? diff < 0 : diff > 0;
  const recent = mean(series.slice(-3));
  const earlier = mean(series.slice(0, 3));
  const trendBetter = lowerIsBetter ? recent < earlier : recent > earlier;

  const kpis = [
    { label: 'Average', value: `${avg.toFixed(1)}`, sub: unit },
    { label: 'Vs fleet', value: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`, sub: better ? 'better' : 'worse', accent: !better },
    { label: 'Last 3 months', value: `${recent.toFixed(1)}`, sub: trendBetter ? 'improving' : 'getting worse', accent: !trendBetter },
  ];

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <p className="text-sm font-bold">Fuel economy</p>
        <select value={vehicle.id} onChange={(event) => setVehicleId(event.target.value)} aria-label="Vehicle" className="h-8 rounded-md border bg-transparent px-2 text-sm">
          {vehicles.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <dl className="grid grid-cols-3 divide-x border-b">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="px-4 py-3">
            <dt className="text-xs text-muted-foreground">{kpi.label}</dt>
            <dd className="mt-0.5 font-mono text-xl font-semibold tabular-nums" style={kpi.accent ? { color: accentColor } : undefined}>
              {kpi.value}
            </dd>
            <dd className="text-[11px] text-muted-foreground">{kpi.sub}</dd>
          </div>
        ))}
      </dl>

      <div className="h-56 px-2 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} />
            <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} tickFormatter={(value) => Number(value).toFixed(0)} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(value) => `${Number(value).toFixed(1)} ${unit}`} />
            <Line type="monotone" dataKey={fleetKey} name="Fleet average" stroke="#a3a3a3" strokeDasharray="4 4" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey={vehicle.id} name={vehicle.name} stroke={accentColor} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="flex gap-4 px-4 pb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="block h-0.5 w-4 rounded-full" style={{ background: accentColor }} /> {vehicle.name}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="block h-0.5 w-4 border-t-2 border-dashed border-muted-foreground/60" /> Fleet average
        </span>
      </p>
    </Card>
  );
}
```
