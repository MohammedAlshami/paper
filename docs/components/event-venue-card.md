# EventVenueCard

When and where, and where to park.

An event card: a date badge, the title, time and venue, a map with the venue and each parking option, and the parking listed nearest first with price, note and the walk to the door.

**Category:** Store and place discovery · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/event-venue-card.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

## Usage

```tsx
<EventVenueCard
  title="Neon Harbor Live"
  month="OCT"
  day={14}
  time="Doors 7 pm · Show 8 pm"
  venue="Harbor Hall"
  address="1805 Geary Blvd"
  position={venuePosition}
  parking={parking}
/>
```

## Anatomy

```tsx
import { EventVenueCard, type ParkingOption } from '@/components/maps/event-venue-card';

// ParkingOption: id, name, position, price?, note?
// Distances and walking times are measured from the venue.
<EventVenueCard title={title} month="OCT" day={14} time={time} venue={venue} address={address} position={position} parking={parking} />
```

## Examples

### Street parking only

```tsx
<EventVenueCard title="Sunday Flea" month="NOV" day={3} time="10 am to 4 pm" venue="Harbor Hall lot" address="1805 Geary Blvd" position={position} parking={[streetParking]} />
```

## API reference

#### EventVenueCard

An event, its venue and its nearby parking.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | The event name. |
| `month` | `string` | — | Three letters, e.g. "OCT". |
| `day` | `string \| number` | — | Day of the month. |
| `time` | `string` | — | Free text, e.g. "Doors 7 pm · Show 8 pm". |
| `venue` | `string` | — | The venue name. |
| `address` | `string` | — | The venue address. |
| `position` | `LngLat` | — | Where the venue is. |
| `parking` | `ParkingOption[]` | — | Nearby parking. Listed nearest first. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the venue pin and the month. Map layers cannot read CSS variables, so pass a value. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/maps/event-venue-card.tsx`

```tsx
'use client';

import * as React from 'react';
import { Footprints, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { distanceKm, fitToPoints, formatDistance, MapCanvas, MapMarker, useMap, walkMinutes, type LngLat, type MapStyle } from './map-kit';

export interface ParkingOption {
  id: string;
  name: string;
  position: LngLat;
  /** Free text, e.g. "$18 flat" or "Free after 6 pm". */
  price?: string;
  note?: string;
}

/** EventVenueCard — when and where an event is, and where to park near it. */
export function EventVenueCard({
  title,
  month,
  day,
  time,
  venue,
  address,
  position,
  parking,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  title: string;
  /** Three letters, e.g. "OCT". */
  month: string;
  day: string | number;
  /** Free text, e.g. "Doors 7 pm · Show 8 pm". */
  time: string;
  venue: string;
  address: string;
  position: LngLat;
  parking: ParkingOption[];
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const sorted = React.useMemo(() => parking.map((option) => ({ option, km: distanceKm(position, option.position) })).sort((a, b) => a.km - b.km), [parking, position]);
  const { containerRef, map, ready } = useMap({ style: mapStyle, interactive: false });

  React.useEffect(() => {
    if (!map || !ready) return;
    fitToPoints(map, [position, ...parking.map((option) => option.position)], { top: 48, bottom: 48, left: 56, right: 56 });
  }, [map, ready, position, parking]);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-center gap-4 p-4">
        <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border bg-background">
          <span className="text-[11px] font-semibold uppercase leading-none tracking-wide" style={{ color: accentColor }}>
            {month}
          </span>
          <span className="mt-0.5 text-xl font-semibold leading-none tabular-nums">{day}</span>
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold leading-tight">{title}</h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{time}</p>
          <p className="truncate text-sm">
            {venue} <span className="text-muted-foreground">· {address}</span>
          </p>
        </div>
      </div>

      <div className="relative h-52 bg-muted">
        <MapCanvas containerRef={containerRef} />
        <MapMarker map={map} position={position} anchor="bottom" zIndex={5}>
          <MapPin className="size-9 fill-current text-white drop-shadow-md" style={{ color: accentColor }} strokeWidth={1.5} />
        </MapMarker>
        {sorted.map(({ option }) => (
          <MapMarker key={option.id} map={map} position={option.position} zIndex={option.id === selectedId ? 4 : 0}>
            <button
              type="button"
              aria-label={`Parking: ${option.name}`}
              onClick={() => setSelectedId(option.id === selectedId ? null : option.id)}
              className={cn('flex size-6 items-center justify-center rounded-md font-mono text-xs font-bold shadow-md ring-2 ring-background transition-transform', option.id === selectedId ? 'scale-125 bg-foreground text-background' : 'bg-background text-foreground hover:scale-110')}
            >
              P
            </button>
          </MapMarker>
        ))}
      </div>

      <div className="border-t">
        <p className="px-4 pt-3 text-xs font-medium text-muted-foreground">Parking nearby</p>
        <ul className="divide-y">
          {sorted.map(({ option, km }) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => setSelectedId(option.id === selectedId ? null : option.id)}
                aria-pressed={option.id === selectedId}
                className={cn('flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50', option.id === selectedId && 'bg-muted')}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-bold">P</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{option.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{[option.price, option.note].filter(Boolean).join(' · ')}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Footprints className="size-3" />
                  {walkMinutes(km)} min · {formatDistance(km)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
```
