# GeofenceAlertFeed

Who crossed which boundary, with a snapshot of where.

A newest-first feed of vehicles entering and leaving zones. Every row carries its own tiny snapshot of the zone and where the vehicle was; selecting a row shows that event on a larger map above.

**Category:** Fleet and operations · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/geofence-alert-feed.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

## Usage

```tsx
<GeofenceAlertFeed
  events={events}
  onSelect={(event) => openVehicle(event.vehicle)}
/>
```

## Anatomy

```tsx
import { GeofenceAlertFeed, type GeofenceEvent } from '@/components/maps/geofence-alert-feed';

// GeofenceEvent: id, vehicle, type ('enter' | 'exit'), zone { name; ring }, at, position
// position is where the vehicle crossed the boundary. The first event gets a "newest" dot.
<GeofenceAlertFeed events={events} />
```

## Examples

### An older event selected

```tsx
<GeofenceAlertFeed events={events} defaultSelectedId="g3" />
```

## API reference

#### GeofenceAlertFeed

A snapshot map above a list of events.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `events` | `GeofenceEvent[]` | — | Newest first. |
| `defaultSelectedId` | `string` | — | The event shown on the map at the start. Defaults to the first. |
| `onSelect` | `(event: GeofenceEvent) => void` | — | Called when a row is selected. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the zone outline and the newest dot. Map layers cannot read CSS variables, so pass a value. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/maps/geofence-alert-feed.tsx`

```tsx
'use client';

import * as React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, MapCanvas, MapMarker, polygonFeature, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface GeofenceEvent {
  id: string;
  vehicle: string;
  type: 'enter' | 'exit';
  zone: { name: string; ring: LngLat[] };
  /** Free text, e.g. "2:41 pm". */
  at: string;
  /** Where the vehicle was when it crossed the boundary. */
  position: LngLat;
}

/** A tiny drawing of the zone and where the vehicle was, so every row carries its own snapshot. */
function Snapshot({ event, accentColor }: { event: GeofenceEvent; accentColor: string }) {
  const points = [...event.zone.ring, event.position];
  // A degree of longitude is shorter than a degree of latitude away from the equator; scale x to match.
  const shrink = Math.cos((points[0][1] * Math.PI) / 180);
  const xs = points.map((point) => point[0] * shrink);
  const ys = points.map((point) => point[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = Math.max(maxX - minX, maxY - minY) || 1;
  const project = ([x, y]: LngLat) => `${(((x * shrink - minX) / scale) * 34 + 3).toFixed(1)},${(((maxY - y) / scale) * 34 + 3).toFixed(1)}`;
  const [dotX, dotY] = project(event.position).split(',');
  return (
    <svg viewBox="0 0 40 40" className="size-11 shrink-0 rounded-lg bg-muted" aria-hidden>
      <polygon points={event.zone.ring.map(project).join(' ')} fill={accentColor} fillOpacity="0.18" stroke={accentColor} strokeWidth="1" strokeDasharray="2 1.5" />
      <circle cx={dotX} cy={dotY} r="3" fill="#2e2e2e" stroke="#fff" strokeWidth="1.2" />
    </svg>
  );
}

/** GeofenceAlertFeed — who crossed which boundary, newest first, with a snapshot of where it happened. */
export function GeofenceAlertFeed({
  events,
  defaultSelectedId,
  onSelect,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  events: GeofenceEvent[];
  defaultSelectedId?: string;
  onSelect?: (event: GeofenceEvent) => void;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [selectedId, setSelectedId] = React.useState(defaultSelectedId ?? events[0]?.id ?? null);
  const selected = events.find((event) => event.id === selectedId) ?? events[0];

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: false,
    onLoad: (instance) => {
      instance.addSource('zone', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      instance.addLayer({ id: 'zone-fill', type: 'fill', source: 'zone', paint: { 'fill-opacity': 0.16 } });
      instance.addLayer({ id: 'zone-line', type: 'line', source: 'zone', paint: { 'line-width': 2, 'line-dasharray': [2, 1] } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready || !selected) return;
    setSourceData(map, 'zone', polygonFeature(selected.zone.ring));
    map.setPaintProperty('zone-fill', 'fill-color', accentColor);
    map.setPaintProperty('zone-line', 'line-color', accentColor);
    fitToPoints(map, [...selected.zone.ring, selected.position], 36);
  }, [map, ready, selected, accentColor]);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      {selected ? (
        <div className="relative h-48 bg-muted">
          <MapCanvas containerRef={containerRef} />
          <MapMarker map={map} position={selected.position} zIndex={2}>
            <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-md ring-2 ring-background">
              {selected.type === 'enter' ? <LogIn className="size-4" /> : <LogOut className="size-4" />}
            </span>
          </MapMarker>
          <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-background px-3 py-1 text-xs shadow-sm ring-1 ring-border">
            <span className="font-bold">{selected.vehicle}</span> {selected.type === 'enter' ? 'entered' : 'left'} {selected.zone.name}
          </p>
        </div>
      ) : null}

      <ul className="divide-y">
        {events.map((event, index) => (
          <li key={event.id}>
            <button
              type="button"
              onClick={() => {
                setSelectedId(event.id);
                onSelect?.(event);
              }}
              aria-pressed={event.id === selected?.id}
              className={cn('flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50', event.id === selected?.id && 'bg-muted')}
            >
              <Snapshot event={event} accentColor={accentColor} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">
                  <span className="font-bold">{event.vehicle}</span> {event.type === 'enter' ? 'entered' : 'left'} <span className="font-medium">{event.zone.name}</span>
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {event.type === 'enter' ? <LogIn className="size-3" /> : <LogOut className="size-3" />}
                  {event.type === 'enter' ? 'Entered' : 'Exited'}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {index === 0 ? <span className="size-1.5 rounded-full" style={{ background: accentColor }} aria-label="Newest" /> : null}
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{event.at}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
```
