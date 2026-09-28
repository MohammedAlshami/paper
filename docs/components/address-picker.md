# AddressPicker

Search for an address or drop a pin, then confirm.

A search box with suggestions above a map with a draggable pin. Searching moves the pin, and dragging it or clicking the map looks up the new address. The map is a form control here, so the geocoding is yours: pass any provider.

**Category:** Location pickers and forms · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card button input
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/address-picker.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

## Usage

```tsx
<AddressPicker
  defaultValue={{ position: [-122.421, 37.7604], address: '800 Valencia Street' }}
  search={(query) => geocoder.search(query)}
  reverseGeocode={(position) => geocoder.reverse(position)}
  onConfirm={(location) => saveAddress(location)}
/>
```

## Anatomy

```tsx
import { AddressPicker } from '@/components/maps/address-picker';

// search:         (query) => Promise<{ id, label, secondary?, position }[]>
// reverseGeocode: (position) => Promise<string>  (optional; without it a moved pin has no address)
// Both are called for you: search is debounced by 200 ms and starts at two characters.
<AddressPicker defaultValue={value} search={search} reverseGeocode={reverse} />
```

## Examples

### Starting from a dropped pin

```tsx
<AddressPicker
  defaultValue={{ position: [-122.4265, 37.7545] }}
  search={search}
  reverseGeocode={reverse}
  confirmLabel="Deliver here"
/>
```

## API reference

#### AddressPicker

A search-and-pin form control. It keeps its own value; use onChange and onConfirm to read it.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultValue` | `PickedLocation` | — | The starting pin: a position and, optionally, an address. |
| `search` | `(query: string) => Promise<PlaceSuggestion[]>` | — | Your geocoder. Called after 200 ms of no typing, for two or more characters. |
| `reverseGeocode` | `(position: LngLat) => Promise<string>` | — | Turns a dragged or clicked position into an address. Optional. |
| `onChange` | `(value: PickedLocation) => void` | — | Fires whenever the pin moves: by search, drag, or click. |
| `onConfirm` | `(value: PickedLocation) => void` | — | Called when the confirm button is pressed. |
| `confirmLabel` | `string` | `'Confirm location'` | The confirm button text. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the pin. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

#### Types

The shapes this component reads and returns.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `PlaceSuggestion` | `{ id; label; secondary?; position }` | — | One search result. |
| `PickedLocation` | `{ position; address? }` | — | The pin and, once known, its address. |

## Source

`src/components/maps/address-picker.tsx`

```tsx
'use client';

import * as React from 'react';
import { LoaderCircle, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MapCanvas, MapMarker, useMap, type LngLat, type MapStyle } from './map-kit';

export interface PlaceSuggestion {
  id: string;
  label: string;
  secondary?: string;
  position: LngLat;
}

export interface PickedLocation {
  position: LngLat;
  address?: string;
}

/**
 * AddressPicker — search for an address or drop a pin, then confirm. Geocoding is yours:
 * pass `search` (text → places) and `reverseGeocode` (position → address) from any provider.
 */
export function AddressPicker({
  defaultValue,
  search,
  reverseGeocode,
  onChange,
  onConfirm,
  confirmLabel = 'Confirm location',
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  defaultValue: PickedLocation;
  search: (query: string) => Promise<PlaceSuggestion[]>;
  reverseGeocode?: (position: LngLat) => Promise<string>;
  /** Fires whenever the pin moves, by search, drag, or click. */
  onChange?: (value: PickedLocation) => void;
  onConfirm?: (value: PickedLocation) => void;
  confirmLabel?: string;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const [query, setQuery] = React.useState(defaultValue.address ?? '');
  const [suggestions, setSuggestions] = React.useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [resolving, setResolving] = React.useState(false);

  const { containerRef, map, ready } = useMap({ style: mapStyle, interactive: true, options: { center: defaultValue.position, zoom: 15.5 } });

  const commit = React.useCallback(
    (next: PickedLocation) => {
      setValue(next);
      onChange?.(next);
    },
    [onChange],
  );

  const moveTo = React.useCallback(
    async (position: LngLat) => {
      commit({ position });
      if (!reverseGeocode) return;
      setResolving(true);
      const address = await reverseGeocode(position);
      setResolving(false);
      setQuery(address);
      commit({ position, address });
    },
    [commit, reverseGeocode],
  );

  React.useEffect(() => {
    const text = query.trim();
    if (!open || text.length < 2 || text === value.address) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(() => {
      void search(text).then((results) => {
        setSuggestions(results);
        setSearching(false);
      });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query, open, search, value.address]);

  React.useEffect(() => {
    if (!map || !ready) return;
    const onClick = (event: { lngLat: { lng: number; lat: number } }) => void moveTo([event.lngLat.lng, event.lngLat.lat]);
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, ready, moveTo]);

  const choose = (place: PlaceSuggestion) => {
    setQuery(place.label);
    setOpen(false);
    setSuggestions([]);
    commit({ position: place.position, address: place.label });
    map?.flyTo({ center: place.position, zoom: 16, duration: 700 });
  };

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="relative border-b p-3">
        <Search className="pointer-events-none absolute left-6 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={(event) => {
            event.target.select();
            setOpen(true);
          }}
          onBlur={() => setOpen(false)}
          placeholder="Search for an address"
          aria-label="Search for an address"
          className="pl-9"
        />
        {open && (suggestions.length || searching) ? (
          <ul className="absolute inset-x-3 top-full z-20 mt-1 overflow-hidden rounded-lg bg-background shadow-lg ring-1 ring-border">
            {searching && !suggestions.length ? (
              <li className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" /> Searching
              </li>
            ) : null}
            {suggestions.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  // Choose on mousedown so the input's blur does not close the list first.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(place);
                  }}
                  className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-muted"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{place.label}</span>
                    {place.secondary ? <span className="block truncate text-xs text-muted-foreground">{place.secondary}</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="relative h-72 bg-muted">
        <MapCanvas containerRef={containerRef} />
        <MapMarker
          map={map}
          position={value.position}
          anchor="bottom"
          draggable
          onDragEnd={(position) => void moveTo(position)}
        >
          <span className="relative flex cursor-grab flex-col items-center active:cursor-grabbing">
            <MapPin className="size-10 fill-current text-white drop-shadow-md" style={{ color: accentColor }} strokeWidth={1.5} />
          </span>
        </MapMarker>
        <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm ring-1 ring-border">
          Drag the pin, or click the map
        </p>
      </div>

      <div className="space-y-3 p-4">
        <div className="min-h-10">
          <p className="text-xs text-muted-foreground">Selected location</p>
          <p className="mt-0.5 flex items-center gap-2 text-sm font-bold">
            {resolving ? (
              <>
                <LoaderCircle className="size-4 animate-spin text-muted-foreground" /> Finding address
              </>
            ) : (
              (value.address ?? 'Dropped pin')
            )}
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
            {value.position[1].toFixed(5)}, {value.position[0].toFixed(5)}
          </p>
        </div>
        <Button className="w-full" onClick={() => onConfirm?.(value)}>
          {confirmLabel}
        </Button>
      </div>
    </Card>
  );
}
```
