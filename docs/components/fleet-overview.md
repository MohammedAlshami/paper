# FleetOverview

Every vehicle on one map, with counts by status.

A KPI strip, a status-filtered vehicle list, and a map with a heading-aware marker per vehicle. Moving vehicles are dark, idle ones outlined, delayed ones use the accent colour, and offline ones fade. Push new positions and the markers move.

**Category:** Fleet and operations · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/fleet-overview.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

## Usage

```tsx
<FleetOverview
  vehicles={vehicles}
  onSelect={(vehicle) => openVehicle(vehicle.id)}
/>
```

## Anatomy

```tsx
import { FleetOverview, type FleetVehicle } from '@/components/maps/fleet-overview';

// FleetVehicle: id, name, status, position, heading?, speedKph?, driver?, task?
// Update the array and the markers move; the map only refits when the filter changes.
socket.on('fleet:update', (next) => setVehicles(next));

<FleetOverview vehicles={vehicles} />
```

## Examples

### A quiet night

```tsx
<FleetOverview vehicles={vehicles.map((v) => ({ ...v, status: 'idle', speedKph: 0 }))} />
```

## API reference

#### FleetOverview

A dashboard for a set of vehicles. Below 42rem wide it stacks the list above the map.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `vehicles` | `FleetVehicle[]` | — | The fleet. Counts, the list and the markers all derive from it. |
| `selectedId` | `string \| null` | — | Controls the selection. Leave it out and the component keeps its own. |
| `onSelect` | `(vehicle: FleetVehicle) => void` | — | Called when a row or a marker is selected. |
| `accentColor` | `string` | `'#ec4899'` | Colour of delayed vehicles and the selected marker. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

#### FleetVehicle

The shape of one vehicle.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Stable identifier. |
| `name` | `string` | — | Shown in bold, e.g. "Van 12". |
| `status` | `'moving' \| 'idle' \| 'delayed' \| 'offline'` | — | Drives the counts, the filter chips and the marker style. |
| `position` | `LngLat` | — | Where the vehicle is right now. |
| `heading` | `number` | — | Degrees clockwise from north. Rotates the marker. |
| `speedKph` | `number` | — | Optional, shown in the list and on the selected card. |
| `driver` | `string` | — | Optional. |
| `task` | `string` | — | Optional, what the vehicle is doing, e.g. "3 stops left". |

## Source

`src/components/maps/fleet-overview.tsx`

```tsx
'use client';

import * as React from 'react';
import { Navigation2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, MapCanvas, MapMarker, useMap, type LngLat, type MapStyle } from './map-kit';

export type VehicleStatus = 'moving' | 'idle' | 'delayed' | 'offline';

export interface FleetVehicle {
  id: string;
  name: string;
  status: VehicleStatus;
  position: LngLat;
  /** Degrees clockwise from north. Rotates the marker. */
  heading?: number;
  speedKph?: number;
  driver?: string;
  /** What the vehicle is doing right now, e.g. "3 stops left". */
  task?: string;
}

const STATUSES: { id: VehicleStatus; label: string }[] = [
  { id: 'moving', label: 'Moving' },
  { id: 'idle', label: 'Idle' },
  { id: 'delayed', label: 'Delayed' },
  { id: 'offline', label: 'Offline' },
];

/** FleetOverview — every vehicle on one map, with counts by status and a list to pick from. */
export function FleetOverview({
  vehicles,
  selectedId: controlledId,
  onSelect,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  vehicles: FleetVehicle[];
  /** Controls the selection. Leave it out and the component keeps its own. */
  selectedId?: string | null;
  onSelect?: (vehicle: FleetVehicle) => void;
  /** Colours delayed vehicles and the selected marker. */
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [filter, setFilter] = React.useState<'all' | VehicleStatus>('all');
  const [ownId, setOwnId] = React.useState<string | null>(null);
  const selectedId = controlledId === undefined ? ownId : controlledId;

  const counts = React.useMemo(() => {
    const result: Record<VehicleStatus, number> = { moving: 0, idle: 0, delayed: 0, offline: 0 };
    vehicles.forEach((vehicle) => {
      result[vehicle.status] += 1;
    });
    return result;
  }, [vehicles]);

  const visible = vehicles.filter((vehicle) => filter === 'all' || vehicle.status === filter);
  const selected = vehicles.find((vehicle) => vehicle.id === selectedId);
  const { containerRef, map, ready } = useMap({ style: mapStyle, interactive: true });

  const select = (vehicle: FleetVehicle) => {
    setOwnId(vehicle.id);
    onSelect?.(vehicle);
  };

  // Fit when the set of vehicles on the map changes, not when they move.
  const visibleKey = visible.map((vehicle) => vehicle.id).join(',');
  React.useEffect(() => {
    if (!map || !ready) return;
    fitToPoints(map, visible.map((vehicle) => vehicle.position), { top: 56, bottom: 112, left: 56, right: 56 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready, visibleKey]);

  const kpis = [
    { label: 'Vehicles', value: vehicles.length },
    { label: 'Moving', value: counts.moving },
    { label: 'Idle', value: counts.idle },
    { label: 'Delayed', value: counts.delayed, accent: counts.delayed > 0 },
  ];

  const accented = (vehicle: FleetVehicle) => vehicle.status === 'delayed' || vehicle.id === selectedId;

  const markerClass = (vehicle: FleetVehicle) =>
    cn(
      'flex items-center justify-center rounded-full shadow-md ring-2 ring-background transition-[transform,opacity]',
      vehicle.id === selectedId ? 'size-9 scale-110' : 'size-7 hover:scale-110',
      accented(vehicle)
        ? 'text-white'
        : vehicle.status === 'moving'
          ? 'bg-foreground text-background'
          : vehicle.status === 'idle'
            ? 'bg-background text-muted-foreground ring-border'
            : 'bg-muted text-muted-foreground opacity-60',
    );

  const markerStyle = (vehicle: FleetVehicle): React.CSSProperties | undefined =>
    accented(vehicle) ? { background: accentColor } : undefined;

  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <dl className="grid grid-cols-2 divide-x border-b @2xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="px-4 py-3">
            <dt className="text-xs text-muted-foreground">{kpi.label}</dt>
            <dd className="mt-0.5 text-2xl font-semibold tabular-nums" style={kpi.accent ? { color: accentColor } : undefined}>
              {kpi.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-1 @2xl:h-[26rem] @2xl:grid-cols-[19rem_1fr]">
        <div className="flex min-h-0 min-w-0 flex-col border-b @2xl:border-b-0 @2xl:border-r">
          <div className="flex flex-wrap gap-1.5 border-b p-3">
            {[{ id: 'all' as const, label: 'All' }, ...STATUSES].map((status) => (
              <button key={status.id} type="button" onClick={() => setFilter(status.id)} aria-pressed={filter === status.id}>
                <Badge variant={filter === status.id ? 'default' : 'outline'}>{status.label}</Badge>
              </button>
            ))}
          </div>

          <ul className="max-h-56 divide-y overflow-y-auto @2xl:max-h-none @2xl:min-h-0 @2xl:flex-1">
            {visible.map((vehicle) => (
              <li key={vehicle.id}>
                <button
                  type="button"
                  onClick={() => select(vehicle)}
                  aria-pressed={vehicle.id === selectedId}
                  className={cn(
                    'flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-2.5 text-left transition-colors hover:bg-muted/60',
                    vehicle.id === selectedId && 'bg-muted',
                  )}
                  style={vehicle.id === selectedId ? { borderLeftColor: accentColor } : undefined}
                >
                  <span className={cn(markerClass(vehicle), 'size-7 shrink-0 scale-100 shadow-none ring-0 hover:scale-100')} style={markerStyle(vehicle)}>
                    <Navigation2 className="size-3.5" style={{ transform: `rotate(${vehicle.heading ?? 0}deg)` }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{vehicle.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[vehicle.driver, vehicle.task].filter(Boolean).join(' · ') || vehicle.status}
                    </span>
                  </span>
                  {vehicle.speedKph !== undefined ? (
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{Math.round(vehicle.speedKph)} km/h</span>
                  ) : null}
                </button>
              </li>
            ))}
            {!visible.length ? <li className="px-4 py-10 text-center text-sm text-muted-foreground">No vehicles with this status.</li> : null}
          </ul>
        </div>

        <div className="relative h-72 bg-muted @2xl:h-auto">
          <MapCanvas containerRef={containerRef} />

          {visible.map((vehicle) => (
            <MapMarker key={vehicle.id} map={map} position={vehicle.position} zIndex={vehicle.id === selectedId ? 10 : 0}>
              <button type="button" onClick={() => select(vehicle)} aria-label={vehicle.name} className={markerClass(vehicle)} style={markerStyle(vehicle)}>
                <Navigation2 className={vehicle.id === selectedId ? 'size-4' : 'size-3.5'} style={{ transform: `rotate(${vehicle.heading ?? 0}deg)` }} />
              </button>
            </MapMarker>
          ))}

          {selected ? (
            <div className="absolute inset-x-3 bottom-3 rounded-lg bg-background p-3 shadow-lg ring-1 ring-border">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold">{selected.name}</p>
                <Badge variant={selected.status === 'delayed' ? 'default' : 'outline'} style={selected.status === 'delayed' ? { background: accentColor } : undefined}>
                  {selected.status}
                </Badge>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {[selected.driver, selected.task, selected.speedKph !== undefined ? `${Math.round(selected.speedKph)} km/h` : undefined]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
```
