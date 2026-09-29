# DeliveryTrackerCard

Where the order is, who has it, and when it arrives.

A live map with the store, the driver and the destination; the route split into what has been travelled and what is left; an ETA; a step bar; and the driver with message and call actions.

**Category:** Tracking and delivery · **Family:** maps · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card button
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/delivery-tracker-card.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

Files to copy: `src/components/maps/delivery-tracker-card.tsx`, `src/components/maps/map-kit.tsx`

## Usage

```tsx
<DeliveryTrackerCard
  orderId="#48213"
  origin={{ label: 'Bi-Rite Market', position: [-122.4241, 37.7615] }}
  destination={{ label: '412 Hayes St', position: [-122.434, 37.7758] }}
  driver={{ name: 'Marcus Lee', vehicle: 'White Toyota Prius', rating: 4.9, position: driverPosition }}
  route={route}
  steps={steps}
  currentStepId="on-the-way"
  etaMinutes={6}
  onCall={() => call(driver)}
  onMessage={() => message(driver)}
/>
```

## Anatomy

```tsx
import { DeliveryTrackerCard } from '@/components/maps/delivery-tracker-card';

// route is [longitude, latitude][] from any routing API (OSRM, Mapbox, Google).
// When driver.position changes, the marker moves and the route re-splits into
// travelled (grey) and remaining (dark) — push a new position, nothing else.
<DeliveryTrackerCard route={route} driver={{ ...driver, position }} ... />
```

## Examples

### Just left the store

```tsx
<DeliveryTrackerCard
  {...order}
  driver={{ ...driver, position: route[3] }}
  currentStepId="picked-up"
  etaMinutes={9}
/>
```

### Arriving now

```tsx
<DeliveryTrackerCard
  {...order}
  driver={{ ...driver, position: route[route.length - 4] }}
  currentStepId="arriving"
  etaMinutes={1}
/>
```

## API reference

#### DeliveryTrackerCard

A map card for one order in flight. The map itself is MapLibre GL; the rest is shadcn/ui.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orderId` | `string` | — | Shown above the headline. |
| `origin` | `DeliveryStop` | — | The store or warehouse: a label and a position. |
| `destination` | `DeliveryStop` | — | Where the order is going. Its label is shown under the headline. |
| `driver` | `DeliveryDriver` | — | Name, vehicle, optional plate and rating, and the live position. |
| `route` | `LngLat[]` | — | The full planned route, origin to destination, as [longitude, latitude] pairs. |
| `steps` | `DeliveryStep[]` | — | The stages of the journey, in order. Each is an id and a label. |
| `currentStepId` | `string` | — | The active step; earlier steps render as done. |
| `etaMinutes` | `number` | — | Minutes remaining, shown in the pill on the map. |
| `onCall` | `() => void` | — | Called when the call button is pressed. |
| `onMessage` | `() => void` | — | Called when the message button is pressed. |
| `routeColor` | `string` | `'#2e2e2e'` | Colour of the route line. Map layers cannot read CSS variables, so pass a value. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the driver marker, the active step and the ETA icon. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. The default needs no API key. |
| `interactive` | `boolean` | `false` | Allow panning and zooming. Off by default so the card behaves like a card. |
| `className` | `string` | — | Merged onto the card. |

#### Types

The shapes this component reads.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `LngLat` | `[number, number]` | — | [longitude, latitude]. Longitude first, as in GeoJSON. |
| `DeliveryStop` | `{ label; position }` | — | A named place on the map. |
| `DeliveryDriver` | `{ name; vehicle; plate?; rating?; position }` | — | The person carrying the order, and where they are right now. |
| `DeliveryStep` | `{ id; label }` | — | One stage of the journey. |

## Source

`src/components/maps/delivery-tracker-card.tsx`

```tsx
'use client';

import * as React from 'react';
import { Car, CircleCheck, Clock, House, MessageCircle, Phone, Star, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, lineFeature, MapCanvas, MapMarker, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface DeliveryStop {
  label: string;
  position: LngLat;
}

export interface DeliveryDriver {
  name: string;
  vehicle: string;
  plate?: string;
  rating?: number;
  position: LngLat;
}

export interface DeliveryStep {
  id: string;
  label: string;
}

function nearestIndex(route: LngLat[], point: LngLat) {
  let best = 0;
  let bestDistance = Infinity;
  route.forEach(([x, y], index) => {
    const distance = (x - point[0]) ** 2 + (y - point[1]) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

/** DeliveryTrackerCard — a live map, the ETA, the driver, and where the order is in its journey. */
export function DeliveryTrackerCard({
  orderId,
  origin,
  destination,
  driver,
  route,
  steps,
  currentStepId,
  etaMinutes,
  onCall,
  onMessage,
  routeColor = '#2e2e2e',
  accentColor = '#ec4899',
  mapStyle,
  interactive = false,
  className,
}: {
  orderId: string;
  origin: DeliveryStop;
  destination: DeliveryStop;
  driver: DeliveryDriver;
  /** The full planned route, origin to destination, as [longitude, latitude] pairs. */
  route: LngLat[];
  steps: DeliveryStep[];
  currentStepId: string;
  /** Minutes until arrival. Zero or less shows "Delivered". */
  etaMinutes: number;
  onCall?: () => void;
  onMessage?: () => void;
  routeColor?: string;
  accentColor?: string;
  /** Any MapLibre style URL or object. The default is OpenFreeMap, which needs no API key. */
  mapStyle?: MapStyle;
  interactive?: boolean;
  className?: string;
}) {
  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive,
    onLoad: (instance) => {
      instance.addSource('route-done', { type: 'geojson', data: lineFeature([]) });
      instance.addSource('route-todo', { type: 'geojson', data: lineFeature([]) });
      const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
      instance.addLayer({ id: 'route-done', type: 'line', source: 'route-done', layout, paint: { 'line-width': 4, 'line-opacity': 0.3 } });
      instance.addLayer({ id: 'route-todo-casing', type: 'line', source: 'route-todo', layout, paint: { 'line-color': '#ffffff', 'line-width': 8 } });
      instance.addLayer({ id: 'route-todo', type: 'line', source: 'route-todo', layout, paint: { 'line-width': 4 } });
    },
  });

  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === currentStepId),
  );
  const split = React.useMemo(() => nearestIndex(route, driver.position), [route, driver.position]);

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'route-done', lineFeature([...route.slice(0, split + 1), driver.position]));
    setSourceData(map, 'route-todo', lineFeature([driver.position, ...route.slice(split + 1)]));
    map.setPaintProperty('route-done', 'line-color', routeColor);
    map.setPaintProperty('route-todo', 'line-color', routeColor);
  }, [map, ready, route, split, driver.position, routeColor]);

  React.useEffect(() => {
    if (!map || !ready) return;
    fitToPoints(map, route, { top: 72, bottom: 64, left: 56, right: 56 });
  }, [map, ready, route]);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="relative h-72 bg-muted">
        <MapCanvas containerRef={containerRef} />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ring-border">
          {etaMinutes > 0 ? <Clock className="size-3.5" style={{ color: accentColor }} /> : <CircleCheck className="size-3.5" style={{ color: accentColor }} />}
          {etaMinutes > 0 ? `Arriving in ${etaMinutes} min` : 'Delivered'}
        </div>
      </div>

      <MapMarker map={map} position={origin.position}>
        <span className="flex size-7 items-center justify-center rounded-full bg-background text-foreground shadow ring-1 ring-border">
          <Store className="size-3.5" />
        </span>
      </MapMarker>
      <MapMarker map={map} position={destination.position}>
        <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-md ring-2 ring-background">
          <House className="size-4" />
        </span>
      </MapMarker>
      <MapMarker map={map} position={driver.position} zIndex={2}>
        <span className="relative flex size-9 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ background: accentColor }} />
          <span
            className="relative flex size-9 items-center justify-center rounded-full text-white shadow-md ring-2 ring-background"
            style={{ background: accentColor }}
          >
            <Car className="size-4" />
          </span>
        </span>
      </MapMarker>

      <CardContent className="space-y-5 py-5">
        <div>
          <p className="font-mono text-xs text-muted-foreground">Order {orderId}</p>
          <p className="mt-1 text-lg font-semibold leading-tight">{steps[currentIndex]?.label}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{destination.label}</p>
        </div>

        <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((step, index) => (
            <li key={step.id} className="space-y-1.5">
              <span
                className={cn('block h-1 rounded-full', index < currentIndex && 'bg-foreground', index > currentIndex && 'bg-muted')}
                style={index === currentIndex ? { background: accentColor } : undefined}
              />
              <span
                className={cn(
                  'block truncate text-[11px]',
                  index === currentIndex ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>

        <div className="flex items-center gap-3 border-t pt-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {driver.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium">
              {driver.name}
              {driver.rating ? (
                <span className="flex items-center gap-0.5 text-xs font-normal text-muted-foreground">
                  <Star className="size-3 fill-current" style={{ color: accentColor }} />
                  {driver.rating.toFixed(1)}
                </span>
              ) : null}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {driver.vehicle}
              {driver.plate ? ` · ${driver.plate}` : ''}
            </p>
          </div>
          <Button size="icon" variant="outline" aria-label="Message driver" onClick={onMessage}>
            <MessageCircle />
          </Button>
          <Button size="icon" aria-label="Call driver" onClick={onCall}>
            <Phone />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```
