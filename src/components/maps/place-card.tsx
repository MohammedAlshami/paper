'use client';

import * as React from 'react';
import { ArrowUpRight, Clock, Footprints, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { distanceKm, formatDistance, MapCanvas, MapMarker, useMap, walkMinutes, type LngLat, type MapStyle } from './map-kit';

export interface Place {
  name: string;
  category: string;
  address: string;
  position: LngLat;
  rating?: number;
  reviewCount?: number;
  /** 1 to 4, shown as $ to $$$$. */
  priceLevel?: 1 | 2 | 3 | 4;
  openNow?: boolean;
  /** Free text, e.g. "Closes 9 pm". */
  hours?: string;
  photoUrl?: string;
}

function HeroMap({ position, accentColor, mapStyle }: { position: LngLat; accentColor: string; mapStyle?: MapStyle }) {
  const { containerRef, map } = useMap({ style: mapStyle, interactive: false, options: { center: position, zoom: 15.5, attributionControl: false } });
  return (
    <>
      <MapCanvas containerRef={containerRef} />
      <MapMarker map={map} position={position} anchor="bottom">
        <MapPin className="size-9 fill-current text-white drop-shadow-md" style={{ color: accentColor }} strokeWidth={1.5} />
      </MapMarker>
    </>
  );
}

/** PlaceCard — one place: its photo (or a map when there is none), rating, how far it is, and a way to get there. */
export function PlaceCard({
  place,
  userPosition,
  onOpenInMaps,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  place: Place;
  /** Adds the distance and the walking time. */
  userPosition?: LngLat;
  /** Overrides the default, which opens OpenStreetMap in a new tab. */
  onOpenInMaps?: (place: Place) => void;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [photoFailed, setPhotoFailed] = React.useState(false);
  const km = userPosition ? distanceKm(userPosition, place.position) : undefined;
  const url = `https://www.openstreetmap.org/?mlat=${place.position[1]}&mlon=${place.position[0]}#map=17/${place.position[1]}/${place.position[0]}`;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="relative h-44 bg-muted">
        {place.photoUrl && !photoFailed ? (
          <img src={place.photoUrl} alt={place.name} onError={() => setPhotoFailed(true)} className="size-full object-cover" />
        ) : (
          <HeroMap position={place.position} accentColor={accentColor} mapStyle={mapStyle} />
        )}
        {place.openNow !== undefined ? (
          <Badge className="absolute left-3 top-3 shadow-sm" variant={place.openNow ? 'default' : 'secondary'}>
            {place.openNow ? 'Open now' : 'Closed'}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold leading-tight">{place.name}</h3>
            {place.priceLevel ? (
              <span className="shrink-0 font-mono text-sm">
                {'$'.repeat(place.priceLevel)}
                <span className="text-muted-foreground/40">{'$'.repeat(4 - place.priceLevel)}</span>
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{place.category}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
          {place.rating ? (
            <span className="flex items-center gap-1 font-medium">
              <Star className="size-3.5 fill-current" style={{ color: accentColor }} />
              {place.rating.toFixed(1)}
              {place.reviewCount ? <span className="font-normal text-muted-foreground">({place.reviewCount.toLocaleString()})</span> : null}
            </span>
          ) : null}
          {km !== undefined ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Footprints className="size-3.5" />
              {formatDistance(km)} · {walkMinutes(km)} min
            </span>
          ) : null}
          {place.hours ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3.5" />
              {place.hours}
            </span>
          ) : null}
        </div>

        <p className="text-sm text-muted-foreground">{place.address}</p>

        {onOpenInMaps ? (
          <Button className="w-full" onClick={() => onOpenInMaps(place)}>
            Open in maps <ArrowUpRight />
          </Button>
        ) : (
          <Button asChild className="w-full">
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open in maps <ArrowUpRight />
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
}
