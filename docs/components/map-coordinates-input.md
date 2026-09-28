# MapCoordinatesInput

Latitude and longitude fields that move a pin, and back.

Two numeric fields and a mini map with a draggable pin, kept in step both ways. Typing a valid pair moves the pin; dragging or clicking fills the fields. Out-of-range values are flagged, and a button copies the pair.

**Category:** Location pickers and forms · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card button input
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/map-coordinates-input.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

## Usage

```tsx
<MapCoordinatesInput
  defaultValue={[-122.4194, 37.7749]}
  onChange={([longitude, latitude]) => setLocation({ latitude, longitude })}
/>
```

## Anatomy

```tsx
import { MapCoordinatesInput } from '@/components/maps/map-coordinates-input';

// Values are [longitude, latitude], like every position in these components.
// onChange fires only for valid pairs: latitude within ±90, longitude within ±180.
<MapCoordinatesInput defaultValue={position} onChange={setPosition} />
```

## Examples

### A different place

```tsx
<MapCoordinatesInput defaultValue={[2.3522, 48.8566]} />
```

## API reference

#### MapCoordinatesInput

A pair of fields and a pin that stay in step.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultValue` | `LngLat` | — | The starting position. |
| `onChange` | `(value: LngLat) => void` | — | Fires when the position changes and is valid. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the pin. Map layers cannot read CSS variables, so pass a value. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/maps/map-coordinates-input.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MapCanvas, MapMarker, useMap, type LngLat, type MapStyle } from './map-kit';

function parse(text: string, limit: number) {
  const value = Number(text);
  return text.trim() !== '' && Number.isFinite(value) && Math.abs(value) <= limit ? value : null;
}

/** MapCoordinatesInput — latitude and longitude fields kept in step with a draggable pin. */
export function MapCoordinatesInput({
  defaultValue,
  onChange,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  defaultValue: LngLat;
  onChange?: (value: LngLat) => void;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [position, setPosition] = React.useState(defaultValue);
  const [latText, setLatText] = React.useState(defaultValue[1].toFixed(5));
  const [lngText, setLngText] = React.useState(defaultValue[0].toFixed(5));
  const [copied, setCopied] = React.useState(false);

  const lat = parse(latText, 90);
  const lng = parse(lngText, 180);

  const { containerRef, map, ready } = useMap({ style: mapStyle, interactive: true, options: { center: defaultValue, zoom: 13 } });

  const commit = React.useCallback(
    (next: LngLat, fly = false) => {
      setPosition(next);
      onChange?.(next);
      if (fly) map?.easeTo({ center: next, duration: 350 });
    },
    [map, onChange],
  );

  const fromMap = (next: LngLat) => {
    setLatText(next[1].toFixed(5));
    setLngText(next[0].toFixed(5));
    commit(next);
  };

  React.useEffect(() => {
    if (!map || !ready) return;
    const onClick = (event: { lngLat: { lng: number; lat: number } }) => fromMap([event.lngLat.lng, event.lngLat.lat]);
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready]);

  const type = (which: 'lat' | 'lng', text: string) => {
    if (which === 'lat') setLatText(text);
    else setLngText(text);
    const nextLat = which === 'lat' ? parse(text, 90) : lat;
    const nextLng = which === 'lng' ? parse(text, 180) : lng;
    if (nextLat !== null && nextLng !== null) commit([nextLng, nextLat], true);
  };

  const copy = () => {
    void navigator.clipboard?.writeText(`${position[1].toFixed(5)}, ${position[0].toFixed(5)}`).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="grid grid-cols-2 gap-3 p-4">
        {(
          [
            { id: 'lat' as const, label: 'Latitude', text: latText, valid: lat !== null, hint: '−90 to 90' },
            { id: 'lng' as const, label: 'Longitude', text: lngText, valid: lng !== null, hint: '−180 to 180' },
          ] as const
        ).map((field) => (
          <label key={field.id} className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
            <Input
              value={field.text}
              inputMode="decimal"
              onChange={(event) => type(field.id, event.target.value)}
              aria-invalid={!field.valid}
              className="font-mono tabular-nums"
            />
            <span className={cn('block text-[11px]', field.valid ? 'text-muted-foreground' : 'text-destructive')}>{field.valid ? field.hint : `Enter a number, ${field.hint}`}</span>
          </label>
        ))}
      </div>

      <div className="relative h-52 bg-muted">
        <MapCanvas containerRef={containerRef} />
        <MapMarker map={map} position={position} draggable onDragEnd={fromMap}>
          <span className="block size-5 cursor-grab rounded-full ring-4 ring-background active:cursor-grabbing" style={{ background: accentColor }} aria-label="Drag to set the location" />
        </MapMarker>
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
        <p className="min-w-0 truncate font-mono text-xs tabular-nums text-muted-foreground">
          {position[1].toFixed(5)}, {position[0].toFixed(5)}
        </p>
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </Card>
  );
}
```
