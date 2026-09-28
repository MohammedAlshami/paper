# PropertyMapCard

Listings as price tags; pick one to see what is around it.

Listings as price pills on a map. Selecting one opens its price, beds, baths and size, draws a dashed neighbourhood ring around it, and counts the other listings inside the ring.

**Category:** Travel and real estate · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card button
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/property-map-card.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

## Usage

```tsx
<PropertyMapCard
  listings={listings}
  defaultSelectedId="l1"
  radiusKm={0.8}
  onView={(listing) => router.push(`/listings/${listing.id}`)}
/>
```

## Anatomy

```tsx
import { PropertyMapCard, type Listing } from '@/components/maps/property-map-card';

// Listing: id, price (whole units), beds, baths, sqft?, address, position
// Prices show compactly on the pins: $845K, $1.3M.
<PropertyMapCard listings={listings} />
```

## Examples

### A wider neighbourhood

```tsx
<PropertyMapCard listings={listings} defaultSelectedId="l3" radiusKm={1.2} />
```

## API reference

#### PropertyMapCard

Price pins, a selected listing card, and a neighbourhood ring.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `listings` | `Listing[]` | — | The homes to show. |
| `radiusKm` | `number` | `0.8` | The neighbourhood ring around the selected listing. |
| `defaultSelectedId` | `string` | — | The listing selected at the start. Defaults to the first. |
| `onView` | `(listing: Listing) => void` | — | Called when View is pressed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the selected pin and the ring. Map layers cannot read CSS variables, so pass a value. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/maps/property-map-card.tsx`

```tsx
'use client';

import * as React from 'react';
import { Bath, BedDouble, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { circleRing, distanceKm, fitToPoints, MapCanvas, MapMarker, polygonFeature, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface Listing {
  id: string;
  /** Asking price, in whole currency units. */
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  address: string;
  position: LngLat;
}

function compactPrice(price: number) {
  return price >= 1_000_000 ? `$${(price / 1_000_000).toFixed(price % 1_000_000 ? 2 : 0).replace(/0$/, '')}M` : `$${Math.round(price / 1000)}K`;
}

/** PropertyMapCard — listings as price tags on a map; pick one to see it and everything within walking distance. */
export function PropertyMapCard({
  listings,
  radiusKm = 0.8,
  defaultSelectedId,
  onView,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  listings: Listing[];
  /** The neighbourhood ring drawn around the selected listing. */
  radiusKm?: number;
  defaultSelectedId?: string;
  onView?: (listing: Listing) => void;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [selectedId, setSelectedId] = React.useState(defaultSelectedId ?? listings[0]?.id);
  const selected = listings.find((listing) => listing.id === selectedId);
  const nearby = selected ? listings.filter((listing) => listing.id !== selected.id && distanceKm(selected.position, listing.position) <= radiusKm) : [];

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: true,
    onLoad: (instance) => {
      instance.addSource('radius', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      instance.addLayer({ id: 'radius-fill', type: 'fill', source: 'radius', paint: { 'fill-opacity': 0.1 } });
      instance.addLayer({ id: 'radius-line', type: 'line', source: 'radius', paint: { 'line-width': 1.5, 'line-dasharray': [2, 1.5] } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    fitToPoints(map, listings.map((listing) => listing.position), { top: 56, bottom: 150, left: 56, right: 56 });
  }, [map, ready, listings]);

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'radius', selected ? polygonFeature(circleRing(selected.position, radiusKm)) : { type: 'FeatureCollection', features: [] });
    map.setPaintProperty('radius-fill', 'fill-color', accentColor);
    map.setPaintProperty('radius-line', 'line-color', accentColor);
  }, [map, ready, selected, radiusKm, accentColor]);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="relative h-[26rem] bg-muted">
        <MapCanvas containerRef={containerRef} />
        {listings.map((listing) => {
          const active = listing.id === selectedId;
          return (
            <MapMarker key={listing.id} map={map} position={listing.position} zIndex={active ? 10 : 0}>
              <button
                type="button"
                onClick={() => setSelectedId(listing.id)}
                aria-pressed={active}
                aria-label={`${listing.address}, ${compactPrice(listing.price)}`}
                className={cn('rounded-full px-2.5 py-1 font-mono text-xs font-semibold tabular-nums shadow-md ring-2 ring-background transition-transform', active ? 'scale-110 text-white' : 'bg-background text-foreground hover:scale-105')}
                style={active ? { background: accentColor } : undefined}
              >
                {compactPrice(listing.price)}
              </button>
            </MapMarker>
          );
        })}

        {selected ? (
          <div className="absolute inset-x-3 bottom-3 rounded-xl bg-background p-4 shadow-lg ring-1 ring-border">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xl font-semibold tabular-nums">${selected.price.toLocaleString()}</p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{selected.address}</p>
              </div>
              <Button size="sm" onClick={() => onView?.(selected)}>
                View
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5">
                <BedDouble className="size-4 text-muted-foreground" /> {selected.beds} bd
              </span>
              <span className="flex items-center gap-1.5">
                <Bath className="size-4 text-muted-foreground" /> {selected.baths} ba
              </span>
              {selected.sqft ? (
                <span className="flex items-center gap-1.5">
                  <Ruler className="size-4 text-muted-foreground" /> {selected.sqft.toLocaleString()} sqft
                </span>
              ) : null}
              <span className="ml-auto text-xs text-muted-foreground">
                {nearby.length} other {nearby.length === 1 ? 'listing' : 'listings'} within {radiusKm * 1000} m
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
```
