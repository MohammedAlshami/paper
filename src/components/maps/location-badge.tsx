'use client';

import * as React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapCanvas, MapMarker, useMap, type LngLat, type MapStyle } from './map-kit';

function Preview({ position, accentColor, mapStyle }: { position: LngLat; accentColor: string; mapStyle?: MapStyle }) {
  const { containerRef, map } = useMap({ style: mapStyle, interactive: false, options: { center: position, zoom: 9.5, attributionControl: false } });
  return (
    <div className="relative h-36 overflow-hidden rounded-lg bg-muted">
      <MapCanvas containerRef={containerRef} />
      <MapMarker map={map} position={position} anchor="bottom">
        <MapPin className="size-8 fill-current text-white drop-shadow" style={{ color: accentColor }} strokeWidth={1.5} />
      </MapMarker>
    </div>
  );
}

/** LocationBadge — a city as an inline chip; hover, focus or tap it for a small map. */
export function LocationBadge({
  city,
  region,
  country,
  position,
  flag,
  defaultOpen = false,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  city: string;
  region?: string;
  country?: string;
  position: LngLat;
  /** An emoji flag or any short glyph shown before the name. */
  flag?: string;
  /** Start with the preview showing. */
  defaultOpen?: boolean;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();

  return (
    <span
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) setOpen(false);
        }}
        className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-sm shadow-xs transition-colors hover:bg-muted"
      >
        {flag ? <span aria-hidden>{flag}</span> : <MapPin className="size-3.5" style={{ color: accentColor }} />}
        <span className="font-medium">{city}</span>
        {country ? <span className="text-muted-foreground">{country}</span> : null}
      </button>

      {open ? (
        <span id={id} role="dialog" aria-label={`Map of ${city}`} className="absolute left-0 top-full z-30 mt-2 block w-64 rounded-xl bg-background p-2 shadow-xl ring-1 ring-border">
          <Preview position={position} accentColor={accentColor} mapStyle={mapStyle} />
          <span className="mt-2 block px-1 pb-1">
            <span className="block text-sm font-bold">{[city, region].filter(Boolean).join(', ')}</span>
            <span className="block font-mono text-xs tabular-nums text-muted-foreground">
              {position[1].toFixed(3)}, {position[0].toFixed(3)}
            </span>
          </span>
        </span>
      ) : null}
    </span>
  );
}
