# ProofOfDelivery

The record of a drop-off: photo, place, time, signature.

A delivery confirmation: the drop-off photo, a small map with a pin where the driver confirmed it, the address, driver and note, a timestamp, and the recipient’s signature. Without a photo it shows a quiet placeholder.

**Category:** Tracking and delivery · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/proof-of-delivery.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

## Usage

```tsx
<ProofOfDelivery
  deliveredAt="Tue 29 Sep, 2:41 pm"
  recipient="Jordan Ellis"
  address="412 Hayes St, front door"
  position={[-122.434, 37.7758]}
  photoUrl={photo.url}
  photoCaption="Left at the front door"
  signaturePath={signature.path}
  driver="Marcus Lee"
  note="Ring the bell twice."
/>
```

## Anatomy

```tsx
import { ProofOfDelivery } from '@/components/maps/proof-of-delivery';

// signaturePath is an SVG path drawn in a 200 x 64 box.
// Everything but deliveredAt, recipient, address and position is optional.
<ProofOfDelivery deliveredAt={at} recipient={name} address={address} position={position} />
```

## Examples

### No photo, no signature

```tsx
<ProofOfDelivery deliveredAt="Tue 29 Sep, 2:41 pm" recipient="Jordan Ellis" address="412 Hayes St" position={position} />
```

## API reference

#### ProofOfDelivery

A read-only delivery record.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `deliveredAt` | `string` | — | Free text, e.g. "Tue 29 Sep, 2:41 pm". |
| `recipient` | `string` | — | Who received it, shown under the signature. |
| `address` | `string` | — | Where it was left. |
| `position` | `LngLat` | — | Where the driver was when they confirmed the drop-off. |
| `photoUrl` | `string` | — | The drop-off photo. If it fails to load, a placeholder is shown. |
| `photoCaption` | `string` | — | Shown over the photo. |
| `signaturePath` | `string` | — | An SVG path in a 200 × 64 box. |
| `driver` | `string` | — | Optional. |
| `note` | `string` | — | Optional delivery note. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the check mark and the map pin. Map layers cannot read CSS variables, so pass a value. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/maps/proof-of-delivery.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check, ImageOff, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MapCanvas, MapMarker, useMap, type LngLat, type MapStyle } from './map-kit';

/** ProofOfDelivery — the record of a drop-off: the photo, where it was taken, when, and who signed. */
export function ProofOfDelivery({
  deliveredAt,
  recipient,
  address,
  position,
  photoUrl,
  photoCaption,
  signaturePath,
  driver,
  note,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  /** Free text, e.g. "Tue 29 Sep, 2:41 pm". */
  deliveredAt: string;
  recipient: string;
  address: string;
  /** Where the driver was when they confirmed the drop-off. */
  position: LngLat;
  photoUrl?: string;
  photoCaption?: string;
  /** An SVG path drawn in a 200 × 64 box: the signature. */
  signaturePath?: string;
  driver?: string;
  note?: string;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [photoFailed, setPhotoFailed] = React.useState(false);
  const { containerRef, map } = useMap({ style: mapStyle, interactive: false, options: { center: position, zoom: 16, attributionControl: false } });

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-white" style={{ background: accentColor }}>
          <Check className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold">Delivered</p>
          <p className="truncate text-xs text-muted-foreground">{deliveredAt}</p>
        </div>
      </div>

      <div className="relative aspect-[16/10] bg-muted">
        {photoUrl && !photoFailed ? (
          <img src={photoUrl} alt={photoCaption ?? 'Drop-off photo'} onError={() => setPhotoFailed(true)} className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-6" />
            <span className="text-xs">No photo</span>
          </div>
        )}
        {photoCaption ? <p className="absolute bottom-2 left-2 rounded-md bg-background/90 px-2 py-1 text-xs shadow-sm">{photoCaption}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 border-t p-4 sm:grid-cols-[9rem_1fr]">
        <div className="relative h-32 overflow-hidden rounded-lg bg-muted sm:h-auto sm:min-h-28">
          <MapCanvas containerRef={containerRef} />
          <MapMarker map={map} position={position} anchor="bottom">
            <MapPin className="size-8 fill-current text-white drop-shadow" style={{ color: accentColor }} strokeWidth={1.5} />
          </MapMarker>
        </div>
        <dl className="min-w-0 space-y-2 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Left at</dt>
            <dd className="truncate font-bold">{address}</dd>
          </div>
          {driver ? (
            <div>
              <dt className="text-xs text-muted-foreground">Driver</dt>
              <dd className="truncate">{driver}</dd>
            </div>
          ) : null}
          {note ? (
            <div>
              <dt className="text-xs text-muted-foreground">Note</dt>
              <dd className="text-muted-foreground">{note}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      {signaturePath ? (
        <div className="border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">Signed by {recipient}</p>
          <svg viewBox="0 0 200 64" className="mt-1 h-14 w-full max-w-[14rem]" role="img" aria-label={`Signature of ${recipient}`}>
            <path d={signaturePath} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="0" y1="58" x2="200" y2="58" stroke="currentColor" strokeOpacity="0.15" />
          </svg>
        </div>
      ) : null}
    </Card>
  );
}
```
