'use client';

import * as React from 'react';
import { Check, LoaderCircle, MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { distanceKm, MapCanvas, MapMarker, pointInRing, polygonFeature, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface ServiceZone {
  id: string;
  name: string;
  /** The outer ring of the zone, as [longitude, latitude] pairs. */
  ring: LngLat[];
  /** Free text shown when an address is inside, e.g. "Free delivery over $30". */
  fee?: string;
  eta?: string;
}

export interface ServicePlace {
  id: string;
  label: string;
  secondary?: string;
  position: LngLat;
}

/** ServiceAreaChecker — "do we deliver to you?": type an address or drop a pin, and get a yes or a no. */
export function ServiceAreaChecker({
  zones,
  defaultPosition,
  search,
  onCheck,
  onNotify,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  zones: ServiceZone[];
  defaultPosition: LngLat;
  /** Your geocoder: text in, places out. */
  search: (query: string) => Promise<ServicePlace[]>;
  /** Fires each time the pin lands somewhere, with the zone it is in (or null). */
  onCheck?: (position: LngLat, zone: ServiceZone | null) => void;
  /** Shown as a button when the pin is outside every zone. */
  onNotify?: (position: LngLat) => void;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [position, setPosition] = React.useState(defaultPosition);
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<ServicePlace[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const zone = React.useMemo(() => zones.find((candidate) => pointInRing(position, candidate.ring)) ?? null, [zones, position]);
  const nearestKm = React.useMemo(
    () => Math.min(...zones.flatMap((candidate) => candidate.ring.map((point) => distanceKm(position, point)))),
    [zones, position],
  );

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: true,
    options: { center: defaultPosition, zoom: 10.6 },
    onLoad: (instance) => {
      instance.addSource('zones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      instance.addLayer({ id: 'zones-fill', type: 'fill', source: 'zones', paint: { 'fill-opacity': 0.07 } });
      instance.addLayer({ id: 'zones-line', type: 'line', source: 'zones', paint: { 'line-width': 2, 'line-dasharray': [2, 1] } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'zones', { type: 'FeatureCollection', features: zones.map((item) => polygonFeature(item.ring, { id: item.id })) });
    map.setPaintProperty('zones-fill', 'fill-color', accentColor);
    map.setPaintProperty('zones-line', 'line-color', accentColor);
  }, [map, ready, zones, accentColor]);

  React.useEffect(() => {
    onCheck?.(position, zone);
    // Report when the pin moves or the zone changes, not when the callback identity does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1], zone?.id]);

  React.useEffect(() => {
    if (!map || !ready) return;
    const onClick = (event: { lngLat: { lng: number; lat: number } }) => setPosition([event.lngLat.lng, event.lngLat.lat]);
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, ready]);

  React.useEffect(() => {
    const text = query.trim();
    if (!open || text.length < 2) {
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
  }, [query, open, search]);

  const choose = (place: ServicePlace) => {
    setQuery(place.label);
    setOpen(false);
    setSuggestions([]);
    setPosition(place.position);
    map?.flyTo({ center: place.position, zoom: 13, duration: 600 });
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
          placeholder="Enter your address"
          aria-label="Enter your address"
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

      <div className="relative h-64 bg-muted">
        <MapCanvas containerRef={containerRef} />
        <MapMarker map={map} position={position} anchor="bottom" draggable onDragEnd={setPosition}>
          <MapPin className="size-10 cursor-grab fill-current text-white drop-shadow-md active:cursor-grabbing" style={{ color: zone ? accentColor : '#2e2e2e' }} strokeWidth={1.5} />
        </MapMarker>
        <p className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm ring-1 ring-border">
          <span className="block h-0.5 w-4 rounded-full" style={{ background: accentColor }} /> Delivery zone
        </p>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <span
            className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', zone ? 'text-white' : 'bg-muted text-muted-foreground')}
            style={zone ? { background: accentColor } : undefined}
          >
            {zone ? <Check className="size-4" /> : <X className="size-4" />}
          </span>
          <div className="min-w-0 flex-1" role="status" aria-live="polite">
            <p className="text-sm font-bold">{zone ? 'Yes, we deliver here' : 'Not in our delivery area yet'}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {zone ? [zone.name, zone.eta, zone.fee].filter(Boolean).join(' · ') : `The nearest zone edge is ${nearestKm < 1 ? `${Math.round(nearestKm * 1000)} m` : `${nearestKm.toFixed(1)} km`} away.`}
            </p>
          </div>
          {!zone && onNotify ? (
            <Button size="sm" variant="outline" onClick={() => onNotify(position)}>
              Notify me
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
