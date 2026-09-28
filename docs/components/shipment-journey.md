# ShipmentJourney

A shipment across trucks, ships and planes, leg by leg.

Every leg of a multi-mode shipment on one map, drawn as arcs (dashed when upcoming, solid when done, accented when active) with a vehicle marker riding the active leg, and a timeline of legs below. Select a leg to zoom to it.

**Category:** Tracking and delivery · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/shipment-journey.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

## Usage

```tsx
<ShipmentJourney
  title="Order #77120 · 240 units"
  reference="MSKU 4471903"
  legs={[
    { id: 'a', mode: 'truck', from: { label: 'Shenzhen factory', position: [114.06, 22.54] }, to: { label: 'Yantian port', position: [114.28, 22.57] }, status: 'done' },
    { id: 'b', mode: 'sea', from: { label: 'Yantian port', position: [114.28, 22.57] }, to: { label: 'Long Beach', position: [-118.19, 33.77] }, status: 'active', progress: 0.72 },
    { id: 'c', mode: 'truck', from: { label: 'Long Beach', position: [-118.19, 33.77] }, to: { label: 'Phoenix DC', position: [-112.07, 33.45] }, status: 'upcoming' },
  ]}
/>
```

## Anatomy

```tsx
import { ShipmentJourney, type ShipmentLeg } from '@/components/maps/shipment-journey';

// Legs are contiguous: each leg starts where the one before it ends.
// Legs that cross the Pacific are drawn the short way round, not across the whole map.
// mode: 'air' | 'sea' | 'truck' | 'rail'   status: 'done' | 'active' | 'upcoming'
<ShipmentJourney title={title} legs={legs} />
```

## Examples

### Air and rail

```tsx
<ShipmentJourney title="Order #77188 · 12 pallets" reference="AWB 020-44819302" legs={airAndRailLegs} />
```

## API reference

#### ShipmentJourney

A map and a leg timeline. Selecting a leg zooms the map to it; selecting it again zooms back out.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | The shipment name. |
| `reference` | `string` | — | A tracking or booking number, shown in mono. |
| `legs` | `ShipmentLeg[]` | — | In order and contiguous. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the active leg and its vehicle. Map layers cannot read CSS variables, so pass a value. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

#### ShipmentLeg

One leg of the journey.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Stable identifier. |
| `mode` | `'air' \| 'sea' \| 'truck' \| 'rail'` | — | Picks the icon and how far the arc bows. |
| `from` | `{ label; position }` | — | Where the leg starts. |
| `to` | `{ label; position }` | — | Where the leg ends. |
| `status` | `'done' \| 'active' \| 'upcoming'` | — | Drives the line style and the timeline marker. |
| `carrier` | `string` | — | Optional. |
| `when` | `string` | — | Optional free text, e.g. "Arrives 3 Oct". |
| `progress` | `number` | — | How far along an active leg the shipment is, 0 to 1. |

## Source

`src/components/maps/shipment-journey.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check, Plane, Ship, TrainFront, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { arcBetween, fitToPoints, MapCanvas, MapMarker, setSourceData, unwrapLngs, useMap, type LngLat, type MapStyle } from './map-kit';

export type ShipmentMode = 'air' | 'sea' | 'truck' | 'rail';
export type LegStatus = 'done' | 'active' | 'upcoming';

export interface ShipmentLeg {
  id: string;
  mode: ShipmentMode;
  from: { label: string; position: LngLat };
  to: { label: string; position: LngLat };
  status: LegStatus;
  carrier?: string;
  /** Free text, e.g. "Departed 12 Sep" or "Arrives 3 Oct". */
  when?: string;
  /** How far along an active leg the shipment is, 0 to 1. */
  progress?: number;
}

const MODE_ICON = { air: Plane, sea: Ship, truck: Truck, rail: TrainFront } as const;
const MODE_BOW = { air: 0.28, sea: 0.14, truck: 0.05, rail: 0.06 } as const;

function legFeatures(legs: ShipmentLeg[]) {
  // Legs are contiguous, so unwrap the chain of stops once: a leg that crosses the Pacific stays one short arc.
  const chain = unwrapLngs([legs[0].from.position, ...legs.map((leg) => leg.to.position)]);
  return legs.map((leg, index) => ({ leg, path: arcBetween(chain[index], chain[index + 1], MODE_BOW[leg.mode]), from: chain[index], to: chain[index + 1] }));
}

/** ShipmentJourney — a multi-leg shipment: every leg on one map, and a timeline of who carries it next. */
export function ShipmentJourney({
  title,
  reference,
  legs,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  title: string;
  /** A tracking or booking number. */
  reference?: string;
  /** In order, and contiguous: each leg starts where the one before it ends. */
  legs: ShipmentLeg[];
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const built = React.useMemo(() => legFeatures(legs), [legs]);

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: false,
    onLoad: (instance) => {
      instance.addSource('legs', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
      instance.addLayer({ id: 'legs-upcoming', type: 'line', source: 'legs', filter: ['==', ['get', 'status'], 'upcoming'], layout: { 'line-join': 'round' }, paint: { 'line-color': '#a3a3a3', 'line-width': 2.5, 'line-dasharray': [2, 2] } });
      instance.addLayer({ id: 'legs-done', type: 'line', source: 'legs', filter: ['==', ['get', 'status'], 'done'], layout, paint: { 'line-color': '#2e2e2e', 'line-width': 3 } });
      instance.addLayer({ id: 'legs-active-casing', type: 'line', source: 'legs', filter: ['==', ['get', 'status'], 'active'], layout, paint: { 'line-color': '#ffffff', 'line-width': 8 } });
      instance.addLayer({ id: 'legs-active', type: 'line', source: 'legs', filter: ['==', ['get', 'status'], 'active'], layout, paint: { 'line-width': 4 } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'legs', {
      type: 'FeatureCollection',
      features: built.map(({ leg, path }) => ({ type: 'Feature', properties: { status: leg.status, id: leg.id }, geometry: { type: 'LineString', coordinates: path } })),
    });
    map.setPaintProperty('legs-active', 'line-color', accentColor);
  }, [map, ready, built, accentColor]);

  React.useEffect(() => {
    if (!map || !ready) return;
    const target = built.find(({ leg }) => leg.id === selectedId);
    fitToPoints(map, target ? target.path : built.flatMap(({ path }) => path), { top: 56, bottom: 56, left: 56, right: 56 }, { maxZoom: target ? 7 : 5 });
  }, [map, ready, built, selectedId]);

  const nodes = [built[0].from, ...built.map(({ to }) => to)];
  const labels = [legs[0].from.label, ...legs.map((leg) => leg.to.label)];
  const activeLeg = built.find(({ leg }) => leg.status === 'active');
  const ActiveIcon = activeLeg ? MODE_ICON[activeLeg.leg.mode] : null;
  const vehicle = activeLeg ? activeLeg.path[Math.round((activeLeg.leg.progress ?? 0.5) * (activeLeg.path.length - 1))] : null;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{title}</p>
          {reference ? <p className="truncate font-mono text-xs text-muted-foreground">{reference}</p> : null}
        </div>
        <Badge variant="outline">{legs.filter((leg) => leg.status === 'done').length}/{legs.length} legs done</Badge>
      </div>

      <div className="relative h-64 bg-muted">
        <MapCanvas containerRef={containerRef} />
        {nodes.map((node, index) => (
          <MapMarker key={index} map={map} position={node}>
            <span className="flex flex-col items-center gap-1">
              <span className={cn('block size-3 rounded-full ring-2 ring-background', index <= legs.filter((leg) => leg.status === 'done').length ? 'bg-foreground' : 'bg-background ring-foreground/40')} />
              {index === 0 || index === nodes.length - 1 ? (
                <span className="rounded bg-background px-1.5 py-0.5 text-[10px] font-medium shadow-sm ring-1 ring-border">{labels[index]}</span>
              ) : null}
            </span>
          </MapMarker>
        ))}
        {vehicle && ActiveIcon ? (
          <MapMarker map={map} position={vehicle} zIndex={5}>
            <span className="flex size-8 items-center justify-center rounded-full text-white shadow-md ring-2 ring-background" style={{ background: accentColor }}>
              <ActiveIcon className="size-4" />
            </span>
          </MapMarker>
        ) : null}
      </div>

      <ol className="divide-y">
        {legs.map((leg) => {
          const Icon = MODE_ICON[leg.mode];
          const selected = leg.id === selectedId;
          return (
            <li key={leg.id}>
              <button
                type="button"
                onClick={() => setSelectedId(selected ? null : leg.id)}
                aria-pressed={selected}
                className={cn('flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50', selected && 'bg-muted')}
              >
                <span
                  className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', leg.status === 'done' && 'bg-foreground text-background', leg.status === 'upcoming' && 'bg-muted text-muted-foreground')}
                  style={leg.status === 'active' ? { background: accentColor, color: '#fff' } : undefined}
                >
                  {leg.status === 'done' ? <Check className="size-4" /> : <Icon className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">
                    {leg.from.label} → {leg.to.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{[leg.carrier, leg.when].filter(Boolean).join(' · ')}</span>
                </span>
                <span className={cn('shrink-0 text-xs capitalize', leg.status === 'upcoming' ? 'text-muted-foreground' : 'font-medium')}>{leg.status === 'active' ? 'In transit' : leg.status}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
```
