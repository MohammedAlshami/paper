# PickupPointSelector

Choose where to collect: lockers, stores, post offices.

A map and a radio list of collection points, nearest first, with the type, hours, distance and walking time. Full points cannot be chosen. Filter by type, pick one, and confirm.

**Category:** Location pickers and forms · **Family:** maps · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card button badge
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/pickup-point-selector.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

Files to copy: `src/components/maps/pickup-point-selector.tsx`, `src/components/maps/map-kit.tsx`

## Usage

```tsx
<PickupPointSelector
  points={points}
  userPosition={[-122.4213, 37.7638]}
  defaultSelectedId="p2"
  onConfirm={(point) => setPickupPoint(point)}
/>
```

## Anatomy

```tsx
import { PickupPointSelector, type PickupPoint } from '@/components/maps/pickup-point-selector';

// PickupPoint: id, name, type ('locker' | 'store' | 'post-office'), address, position, hours?, available?
// available: false greys a point out and blocks selection.
<PickupPointSelector points={points} userPosition={position} />
```

## Examples

### Nothing chosen yet

```tsx
<PickupPointSelector points={points} userPosition={position} />
```

## API reference

#### PickupPointSelector

A map, a filterable radio list, and a confirm button.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `points` | `PickupPoint[]` | — | The places an order can be collected from. |
| `userPosition` | `LngLat` | — | Adds distances and walking times, and sorts nearest first. |
| `defaultSelectedId` | `string` | — | The point selected at the start. |
| `onSelect` | `(point: PickupPoint) => void` | — | Called when a point is chosen. |
| `onConfirm` | `(point: PickupPoint) => void` | — | Called when the confirm button is pressed. |
| `confirmLabel` | `string` | `'Pick up here'` | Start of the confirm button text. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the selected pin and radio. Map layers cannot read CSS variables, so pass a value. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/maps/pickup-point-selector.tsx`

```tsx
'use client';

import * as React from 'react';
import { Mail, Package, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { distanceKm, fitToPoints, formatDistance, MapCanvas, MapMarker, useMap, walkMinutes, type LngLat, type MapStyle } from './map-kit';

export type PickupType = 'locker' | 'store' | 'post-office';

export interface PickupPoint {
  id: string;
  name: string;
  type: PickupType;
  address: string;
  position: LngLat;
  /** Free text, e.g. "Open until 9 pm". */
  hours?: string;
  /** Whether it has room right now. Full points cannot be chosen. */
  available?: boolean;
}

const TYPE_ICON = { locker: Package, store: Store, 'post-office': Mail } as const;
const TYPE_LABEL: Record<PickupType, string> = { locker: 'Locker', store: 'Store', 'post-office': 'Post office' };

/** PickupPointSelector — choose where to collect an order: nearby lockers and stores on a map and in a list. */
export function PickupPointSelector({
  points,
  userPosition,
  defaultSelectedId,
  onSelect,
  onConfirm,
  confirmLabel = 'Pick up here',
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  points: PickupPoint[];
  userPosition?: LngLat;
  defaultSelectedId?: string;
  onSelect?: (point: PickupPoint) => void;
  onConfirm?: (point: PickupPoint) => void;
  confirmLabel?: string;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [selectedId, setSelectedId] = React.useState(defaultSelectedId ?? null);
  const [filter, setFilter] = React.useState<'all' | PickupType>('all');

  const types = React.useMemo(() => Array.from(new Set(points.map((point) => point.type))), [points]);
  const visible = React.useMemo(
    () =>
      points
        .filter((point) => filter === 'all' || point.type === filter)
        .map((point) => ({ point, km: userPosition ? distanceKm(userPosition, point.position) : undefined }))
        .sort((a, b) => (a.km ?? 0) - (b.km ?? 0)),
    [points, filter, userPosition],
  );
  const selected = points.find((point) => point.id === selectedId);

  const { containerRef, map, ready } = useMap({ style: mapStyle, interactive: true });

  const choose = (point: PickupPoint) => {
    if (point.available === false) return;
    setSelectedId(point.id);
    onSelect?.(point);
  };

  const key = visible.map((item) => item.point.id).join(',');
  React.useEffect(() => {
    if (!map || !ready) return;
    fitToPoints(map, [...visible.map((item) => item.point.position), ...(userPosition ? [userPosition] : [])], 44);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready, key]);

  React.useEffect(() => {
    if (!map || !ready || !selected) return;
    map.easeTo({ center: selected.position, duration: 350 });
  }, [map, ready, selected]);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="relative h-60 bg-muted">
        <MapCanvas containerRef={containerRef} />
        {userPosition ? (
          <MapMarker map={map} position={userPosition}>
            <span className="block size-3.5 rounded-full bg-foreground ring-4 ring-background" aria-label="You are here" />
          </MapMarker>
        ) : null}
        {visible.map(({ point }) => {
          const Icon = TYPE_ICON[point.type];
          const active = point.id === selectedId;
          return (
            <MapMarker key={point.id} map={map} position={point.position} zIndex={active ? 10 : 0}>
              <button
                type="button"
                aria-label={point.name}
                onClick={() => choose(point)}
                className={cn(
                  'flex items-center justify-center rounded-full shadow-md ring-2 ring-background transition-transform',
                  active ? 'size-9 scale-110 text-white' : 'size-7 bg-foreground text-background hover:scale-110',
                  point.available === false && 'opacity-40',
                )}
                style={active ? { background: accentColor } : undefined}
              >
                <Icon className={active ? 'size-4' : 'size-3.5'} />
              </button>
            </MapMarker>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1.5 border-b p-3">
        {[{ id: 'all' as const, label: 'All' }, ...types.map((type) => ({ id: type, label: TYPE_LABEL[type] }))].map((chip) => (
          <button key={chip.id} type="button" onClick={() => setFilter(chip.id)} aria-pressed={filter === chip.id}>
            <Badge variant={filter === chip.id ? 'default' : 'outline'}>{chip.label}</Badge>
          </button>
        ))}
      </div>

      <ul className="max-h-72 divide-y overflow-y-auto" role="radiogroup" aria-label="Pickup points">
        {visible.map(({ point, km }) => {
          const Icon = TYPE_ICON[point.type];
          const active = point.id === selectedId;
          const full = point.available === false;
          return (
            <li key={point.id}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                disabled={full}
                onClick={() => choose(point)}
                className={cn('flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50', active && 'bg-muted')}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{point.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {point.address}
                    {point.hours ? ` · ${point.hours}` : ''}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  {km !== undefined ? <span className="block font-mono text-xs tabular-nums">{formatDistance(km)}</span> : null}
                  <span className="block text-[11px] text-muted-foreground">{full ? 'Full' : km !== undefined ? `${walkMinutes(km)} min walk` : TYPE_LABEL[point.type]}</span>
                </span>
                <span
                  className={cn('flex size-4 shrink-0 items-center justify-center rounded-full border', active ? 'border-transparent' : 'border-border')}
                  style={active ? { background: accentColor } : undefined}
                  aria-hidden
                >
                  {active ? <span className="size-1.5 rounded-full bg-white" /> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="border-t p-4">
        <Button className="w-full" disabled={!selected} onClick={() => selected && onConfirm?.(selected)}>
          {selected ? `${confirmLabel}: ${selected.name}` : 'Choose a pickup point'}
        </Button>
      </div>
    </Card>
  );
}
```
