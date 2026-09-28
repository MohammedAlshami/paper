'use client';

import * as React from 'react';
import { Briefcase, Home, LoaderCircle, MapPin, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { fitToPoints, MapCanvas, MapMarker, pointInRing, polygonFeature, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface Isochrone {
  minutes: number;
  /** The outer ring of the area reachable within `minutes`. */
  ring: LngLat[];
}

export interface CommutePlace {
  id: string;
  label: string;
  secondary?: string;
  position: LngLat;
}

/**
 * CommuteCalculator — "how long to work from here?": drop a home pin and see which drive-time band it falls in.
 * The bands are isochrones from a routing service; this component draws them, it does not compute them.
 */
export function CommuteCalculator({
  work,
  isochrones,
  defaultHome,
  search,
  modeLabel = 'By car',
  onChange,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  work: { label: string; position: LngLat };
  /** Any number of bands, in any order. */
  isochrones: Isochrone[];
  defaultHome: LngLat;
  search: (query: string) => Promise<CommutePlace[]>;
  /** Shown after the time, e.g. "By car" or "By bike". */
  modeLabel?: string;
  onChange?: (home: LngLat, minutes: number | null) => void;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const bands = React.useMemo(() => [...isochrones].sort((a, b) => b.minutes - a.minutes), [isochrones]);
  const [home, setHome] = React.useState(defaultHome);
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<CommutePlace[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  // The commute is the smallest band that contains home.
  const inside = React.useMemo(() => [...bands].reverse().find((band) => pointInRing(home, band.ring)), [bands, home]);
  const below = inside ? bands[bands.indexOf(inside) + 1] : undefined;
  const minutes = inside?.minutes ?? null;

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: true,
    onLoad: (instance) => {
      instance.addSource('bands', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      instance.addLayer({ id: 'bands-fill', type: 'fill', source: 'bands', paint: { 'fill-opacity': ['get', 'opacity'] } });
      instance.addLayer({ id: 'bands-line', type: 'line', source: 'bands', paint: { 'line-width': 1.25, 'line-opacity': 0.6 } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'bands', {
      type: 'FeatureCollection',
      features: bands.map((band, index) => polygonFeature(band.ring, { opacity: 0.1 + (index / Math.max(1, bands.length - 1)) * 0.22 })),
    });
    map.setPaintProperty('bands-fill', 'fill-color', accentColor);
    map.setPaintProperty('bands-line', 'line-color', accentColor);
    fitToPoints(map, [...(bands[0]?.ring ?? []), work.position], 24);
  }, [map, ready, bands, work.position, accentColor]);

  React.useEffect(() => {
    onChange?.(home, minutes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home[0], home[1], minutes]);

  React.useEffect(() => {
    if (!map || !ready) return;
    const onClick = (event: { lngLat: { lng: number; lat: number } }) => setHome([event.lngLat.lng, event.lngLat.lat]);
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

  const choose = (place: CommutePlace) => {
    setQuery(place.label);
    setOpen(false);
    setSuggestions([]);
    setHome(place.position);
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
          placeholder="Where would you live?"
          aria-label="Where would you live?"
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
        <MapMarker map={map} position={work.position} zIndex={3}>
          <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-md ring-2 ring-background" title={work.label}>
            <Briefcase className="size-4" />
          </span>
        </MapMarker>
        <MapMarker map={map} position={home} anchor="bottom" draggable onDragEnd={setHome} zIndex={4}>
          <span className="flex size-9 cursor-grab items-center justify-center rounded-full text-white shadow-md ring-2 ring-background active:cursor-grabbing" style={{ background: accentColor }}>
            <Home className="size-4" />
          </span>
        </MapMarker>
      </div>

      <div className="flex items-end justify-between gap-4 p-4">
        <div role="status" aria-live="polite">
          <p className="text-xs text-muted-foreground">To {work.label}</p>
          <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums">
            {inside ? (below ? `${below.minutes}–${inside.minutes} min` : `Under ${inside.minutes} min`) : `Over ${bands[0]?.minutes ?? 0} min`}
          </p>
          <p className="text-xs text-muted-foreground">{modeLabel}</p>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          {[...bands].reverse().map((band) => (
            <span key={band.minutes} className="flex items-center gap-1.5">
              <span className="block size-2.5 rounded-sm" style={{ background: accentColor, opacity: 0.25 + (bands.indexOf(band) / Math.max(1, bands.length - 1)) * 0.35 }} />
              {band.minutes}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
