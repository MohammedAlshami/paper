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
