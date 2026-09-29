# NearbyList

What is close, nearest first, with the walk.

Places sorted by how far they are from a point, each with its distance, a walking-time chip and an open or closed marker. There is no map: it is the list on its own, for a sheet, a sidebar or a search result.

**Category:** Store and place discovery · **Family:** maps · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add 
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/nearby-list.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

Files to copy: `src/components/maps/nearby-list.tsx`, `src/components/maps/map-kit.tsx`

## Usage

```tsx
<NearbyList
  places={places}
  origin={[-122.4213, 37.7638]}
  limit={6}
  onSelect={(place) => openPlace(place.id)}
/>
```

## Anatomy

```tsx
import { NearbyList } from '@/components/maps/nearby-list';

// Distances are straight-line (haversine); walking time assumes 5 km/h.
// Pair it with any map, or use it alone.
<NearbyList places={places} origin={position} limit={5} />
```

## Examples

### The three nearest

```tsx
<NearbyList places={places} origin={position} limit={3} />
```

## API reference

#### NearbyList

A list of places ordered by distance.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `places` | `NearbyPlace[]` | — | id, name, category, position, and optionally openNow and hours. |
| `origin` | `LngLat` | — | Where distances are measured from. |
| `selectedId` | `string \| null` | — | Highlights a row. |
| `onSelect` | `(place: NearbyPlace) => void` | — | Called when a row is pressed. |
| `limit` | `number` | — | Show only the nearest N. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the selected row edge. |
| `className` | `string` | — | Merged onto the list. |

## Source

`src/components/maps/nearby-list.tsx`

```tsx
'use client';

import * as React from 'react';
import { Footprints } from 'lucide-react';
import { cn } from '@/lib/utils';
import { distanceKm, formatDistance, walkMinutes, type LngLat } from './map-kit';

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  position: LngLat;
  openNow?: boolean;
  /** Free text, e.g. "Closes 6 pm". */
  hours?: string;
}

/** NearbyList — places sorted by how far they are, each with a walking-time chip. No map: just the list. */
export function NearbyList({
  places,
  origin,
  selectedId,
  onSelect,
  limit,
  accentColor = '#ec4899',
  className,
}: {
  places: NearbyPlace[];
  /** Where distances are measured from. */
  origin: LngLat;
  selectedId?: string | null;
  onSelect?: (place: NearbyPlace) => void;
  /** Show only the nearest N. */
  limit?: number;
  accentColor?: string;
  className?: string;
}) {
  const sorted = React.useMemo(
    () => places.map((place) => ({ place, km: distanceKm(origin, place.position) })).sort((a, b) => a.km - b.km).slice(0, limit),
    [places, origin, limit],
  );

  return (
    <ol className={cn('divide-y overflow-hidden rounded-xl border bg-card', className)}>
      {sorted.map(({ place, km }, index) => (
        <li key={place.id}>
          <button
            type="button"
            onClick={() => onSelect?.(place)}
            aria-pressed={place.id === selectedId}
            className={cn('flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-muted/50', place.id === selectedId && 'bg-muted')}
            style={place.id === selectedId ? { borderLeftColor: accentColor } : undefined}
          >
            <span className="w-4 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{index + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{place.name}</span>
              <span className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                {place.category}
                {place.openNow !== undefined ? (
                  <span className="flex items-center gap-1">
                    <span className={cn('size-1.5 rounded-full', place.openNow ? 'bg-foreground' : 'border border-muted-foreground')} aria-hidden />
                    {place.openNow ? 'Open' : 'Closed'}
                    {place.hours ? ` · ${place.hours}` : ''}
                  </span>
                ) : null}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <span className="font-mono text-xs tabular-nums">{formatDistance(km)}</span>
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                <Footprints className="size-3" />
                {walkMinutes(km)} min
              </span>
            </span>
          </button>
        </li>
      ))}
      {!sorted.length ? <li className="px-4 py-10 text-center text-sm text-muted-foreground">Nothing nearby.</li> : null}
    </ol>
  );
}
```
