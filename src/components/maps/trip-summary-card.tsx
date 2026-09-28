'use client';

import * as React from 'react';
import { Bike, Footprints } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { distanceKm, fitToPoints, lineFeature, MapCanvas, MapMarker, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export type TripActivity = 'run' | 'walk' | 'ride';

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return hours ? `${hours}h ${String(rest).padStart(2, '0')}m` : `${rest} min`;
}

function formatPace(minutesPerKm: number) {
  const whole = Math.floor(minutesPerKm);
  return `${whole}:${String(Math.round((minutesPerKm - whole) * 60)).padStart(2, '0')}`;
}

/** The elevation profile as an area chart. `values` are metres, evenly spaced along the route. */
function ElevationProfile({ values, color }: { values: number[]; color: string }) {
  const id = React.useId();
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const points = values.map((value, index) => [(index / (values.length - 1)) * 100, 30 - ((value - min) / span) * 26] as const);
  const line = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-14 w-full" role="img" aria-label={`Elevation from ${Math.round(min)} to ${Math.round(max)} metres`}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={`${line} L100 32 L0 32 Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

/** TripSummaryCard — a finished trip: the route on a map, the numbers, and the elevation profile. */
export function TripSummaryCard({
  title,
  activity = 'walk',
  date,
  athlete,
  route,
  elevation,
  distanceKm: distance,
  durationMin,
  elevationGainM,
  routeColor = '#ec4899',
  mapStyle,
  className,
}: {
  title: string;
  activity?: TripActivity;
  /** Free text, e.g. "Sat, 27 Sep · 8:12 am". */
  date?: string;
  athlete?: string;
  route: LngLat[];
  /** Metres above sea level, evenly spaced along the route. */
  elevation: number[];
  distanceKm: number;
  durationMin: number;
  elevationGainM: number;
  /** Colour of the route line and the elevation profile. Map layers cannot read CSS variables. */
  routeColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: false,
    onLoad: (instance) => {
      instance.addSource('trip', { type: 'geojson', data: lineFeature([]) });
      const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
      instance.addLayer({ id: 'trip-casing', type: 'line', source: 'trip', layout, paint: { 'line-color': '#ffffff', 'line-width': 8 } });
      instance.addLayer({ id: 'trip', type: 'line', source: 'trip', layout, paint: { 'line-width': 4 } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'trip', lineFeature(route));
    map.setPaintProperty('trip', 'line-color', routeColor);
    fitToPoints(map, route, 32);
  }, [map, ready, route, routeColor]);

  const start = route[0];
  const finish = route[route.length - 1];
  const isLoop = distanceKm(start, finish) < 0.1;
  const Icon = activity === 'ride' ? Bike : Footprints;

  const stats = [
    { label: 'Distance', value: `${distance.toFixed(1)} km` },
    { label: 'Time', value: formatDuration(durationMin) },
    activity === 'ride'
      ? { label: 'Speed', value: `${(distance / (durationMin / 60)).toFixed(1)} km/h` }
      : { label: 'Pace', value: `${formatPace(durationMin / distance)} /km` },
    { label: 'Elev. gain', value: `${Math.round(elevationGainM)} m` },
  ];

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{[date, athlete].filter(Boolean).join(' · ')}</p>
        </div>
      </div>

      <div className="relative h-52 bg-muted">
        <MapCanvas containerRef={containerRef} />
        <MapMarker map={map} position={start}>
          <span className="block size-3.5 rounded-full bg-foreground ring-4 ring-background" aria-label={isLoop ? 'Start and finish' : 'Start'} />
        </MapMarker>
        {!isLoop ? (
          <MapMarker map={map} position={finish}>
            <span className="block size-3.5 rounded-full ring-4 ring-background" style={{ background: routeColor }} aria-label="Finish" />
          </MapMarker>
        ) : null}
      </div>

      <dl className="grid grid-cols-4 divide-x border-t">
        {stats.map((stat) => (
          <div key={stat.label} className="px-3 py-3">
            <dt className="text-[11px] text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="border-t px-4 pb-3 pt-3">
        <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
          <span>Elevation</span>
          <span className="font-mono tabular-nums">
            {Math.round(Math.min(...elevation))}–{Math.round(Math.max(...elevation))} m
          </span>
        </div>
        <ElevationProfile values={elevation} color={routeColor} />
      </div>
    </Card>
  );
}
