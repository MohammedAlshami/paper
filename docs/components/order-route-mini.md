# OrderRouteMini

One order as a list row, with its route on a thumbnail.

A compact row for order lists: a small map with the route drawn on it, where the order is going, a status badge and a line of detail. Each thumbnail only builds its map when it is near the screen, so a long list stays light.

**Category:** Tracking and delivery · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/order-route-mini.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

## Usage

```tsx
<OrderRouteMini
  title="Order #48213"
  from="Guerrero Market"
  to="412 Hayes St"
  route={route}
  position={driverPosition}
  status="on-the-way"
  detail="Arrives 2:40 pm"
  onClick={() => openOrder('48213')}
/>
```

## Anatomy

```tsx
import { OrderRouteMini } from '@/components/maps/order-route-mini';

// status: 'preparing' | 'on-the-way' | 'delivered' | 'delayed'
// Render one per order; the thumbnail map is created lazily as each row scrolls into view.
{orders.map((order) => <OrderRouteMini key={order.id} {...order} />)}
```

## Examples

### A single order

```tsx
<OrderRouteMini title="Order #48213" from="Guerrero Market" to="412 Hayes St" route={route} status="preparing" detail="Ready at 2:10 pm" />
```

## API reference

#### OrderRouteMini

A button-shaped row. It fills the width of its container.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | The order name. |
| `from` | `string` | — | Where it starts. |
| `to` | `string` | — | Where it is going. |
| `route` | `LngLat[]` | — | The route, origin to destination. Drawn on the thumbnail. |
| `position` | `LngLat` | — | Where the order is now. Adds a dot on the thumbnail. |
| `status` | `'preparing' \| 'on-the-way' \| 'delivered' \| 'delayed'` | — | Drives the badge. Delayed uses the accent colour. |
| `detail` | `string` | — | Free text next to the badge, e.g. "Arrives 2:40 pm". |
| `onClick` | `() => void` | — | Called when the row is pressed. |
| `routeColor` | `string` | `'#2e2e2e'` | Colour of the route line. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the position dot and the delayed badge. Map layers cannot read CSS variables, so pass a value. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/maps/order-route-mini.tsx`

```tsx
'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { fitToPoints, lineFeature, MapCanvas, MapMarker, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export type OrderStatus = 'preparing' | 'on-the-way' | 'delivered' | 'delayed';

const STATUS_LABEL: Record<OrderStatus, string> = {
  preparing: 'Preparing',
  'on-the-way': 'On the way',
  delivered: 'Delivered',
  delayed: 'Delayed',
};

/** Only builds the map once the row is near the viewport, so a long list of rows stays light. */
function useNearViewport() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [near, setNear] = React.useState(false);
  React.useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    const observer = new IntersectionObserver((entries) => entries.some((entry) => entry.isIntersecting) && setNear(true), { rootMargin: '200px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [near]);
  return { ref, near };
}

function Thumbnail({ route, position, routeColor, accentColor, mapStyle }: { route: LngLat[]; position?: LngLat; routeColor: string; accentColor: string; mapStyle?: MapStyle }) {
  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: false,
    options: { attributionControl: false },
    onLoad: (instance) => {
      // At thumbnail size the base map's place names are bigger than the streets they label.
      instance.getStyle().layers.filter((layer) => layer.type === 'symbol').forEach((layer) => instance.setLayoutProperty(layer.id, 'visibility', 'none'));
      instance.addSource('route', { type: 'geojson', data: lineFeature([]) });
      instance.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-width': 3 } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'route', lineFeature(route));
    map.setPaintProperty('route', 'line-color', routeColor);
    fitToPoints(map, route, 10);
  }, [map, ready, route, routeColor]);

  return (
    <>
      <MapCanvas containerRef={containerRef} />
      <MapMarker map={map} position={route[route.length - 1]}>
        <span className="block size-2.5 rounded-full bg-foreground ring-2 ring-background" />
      </MapMarker>
      {position ? (
        <MapMarker map={map} position={position} zIndex={2}>
          <span className="block size-3.5 rounded-full ring-2 ring-background" style={{ background: accentColor }} />
        </MapMarker>
      ) : null}
    </>
  );
}

/** OrderRouteMini — one order as a list row: a route thumbnail, where it is going, and its status. */
export function OrderRouteMini({
  title,
  from,
  to,
  route,
  position,
  status,
  detail,
  onClick,
  routeColor = '#2e2e2e',
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  title: string;
  from: string;
  to: string;
  /** The route, origin to destination. Drawn on the thumbnail. */
  route: LngLat[];
  /** Where the order is now. Adds a dot on the thumbnail. */
  position?: LngLat;
  status: OrderStatus;
  /** Free text under the status, e.g. "Arrives 2:40 pm". */
  detail?: string;
  onClick?: () => void;
  routeColor?: string;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const { ref, near } = useNearViewport();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('group flex w-full items-center gap-3 rounded-xl border bg-card p-2 text-left shadow-xs transition-colors hover:bg-muted/50', className)}
    >
      <div ref={ref} className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-muted">
        {near ? <Thumbnail route={route} position={position} routeColor={routeColor} accentColor={accentColor} mapStyle={mapStyle} /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {from} → {to}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <Badge variant={status === 'delayed' ? 'default' : 'outline'} style={status === 'delayed' ? { background: accentColor } : undefined}>
            {STATUS_LABEL[status]}
          </Badge>
          {detail ? <span className="truncate font-mono text-xs text-muted-foreground">{detail}</span> : null}
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
```
