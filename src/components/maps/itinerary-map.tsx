'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, lineFeature, MapCanvas, MapMarker, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface ItineraryStop {
  id: string;
  name: string;
  /** Free text, e.g. "9:30 am". */
  time?: string;
  note?: string;
  position: LngLat;
}

export interface ItineraryDay {
  id: string;
  /** e.g. "Day 1" */
  label: string;
  /** Free text, e.g. "The waterfront". */
  title?: string;
  stops: ItineraryStop[];
  /** The path between the stops, in order. */
  route: LngLat[];
  distanceKm?: number;
}

/** ItineraryMap — a trip day by day: switch days, and the stops, the route and the list stay in step. */
export function ItineraryMap({
  days,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  days: ItineraryDay[];
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [dayId, setDayId] = React.useState(days[0]?.id);
  const [stopId, setStopId] = React.useState<string | null>(null);
  const day = days.find((item) => item.id === dayId) ?? days[0];

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: true,
    onLoad: (instance) => {
      instance.addSource('day', { type: 'geojson', data: lineFeature([]) });
      const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
      instance.addLayer({ id: 'day-casing', type: 'line', source: 'day', layout, paint: { 'line-color': '#ffffff', 'line-width': 8 } });
      instance.addLayer({ id: 'day', type: 'line', source: 'day', layout, paint: { 'line-width': 4 } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready || !day) return;
    setSourceData(map, 'day', lineFeature(day.route));
    map.setPaintProperty('day', 'line-color', accentColor);
    fitToPoints(map, [...day.route, ...day.stops.map((stop) => stop.position)], 56);
    setStopId(null);
  }, [map, ready, day, accentColor]);

  const focus = (stop: ItineraryStop) => {
    setStopId(stop.id);
    map?.easeTo({ center: stop.position, duration: 400 });
  };

  if (!day) return null;

  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <div className="flex gap-1.5 overflow-x-auto border-b p-3" role="tablist" aria-label="Days">
        {days.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === day.id}
            onClick={() => setDayId(item.id)}
            className={cn('shrink-0 rounded-full px-3 py-1 text-sm transition-colors', item.id === day.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted')}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 @2xl:h-[28rem] @2xl:grid-cols-[20rem_1fr]">
        <div className="flex min-h-0 flex-col border-b @2xl:border-b-0 @2xl:border-r">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-bold">{day.title ?? day.label}</p>
            <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
              {day.stops.length} stops{day.distanceKm !== undefined ? ` · ${day.distanceKm.toFixed(1)} km on foot` : ''}
            </p>
          </div>
          <ol className="max-h-72 overflow-y-auto @2xl:max-h-none @2xl:min-h-0 @2xl:flex-1">
            {day.stops.map((stop, index) => {
              const active = stop.id === stopId;
              return (
                <li key={stop.id} className="relative">
                  {index < day.stops.length - 1 ? <span className="absolute bottom-0 left-[1.65rem] top-8 w-px bg-border" aria-hidden /> : null}
                  <button
                    type="button"
                    onClick={() => focus(stop)}
                    aria-pressed={active}
                    className={cn('relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50', active && 'bg-muted')}
                  >
                    <span
                      className={cn('z-10 flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ring-2 ring-card', active ? 'text-white' : 'bg-foreground text-background')}
                      style={active ? { background: accentColor } : undefined}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{stop.name}</span>
                      {stop.time || stop.note ? <span className="block text-xs text-muted-foreground">{[stop.time, stop.note].filter(Boolean).join(' · ')}</span> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="relative h-72 bg-muted @2xl:h-auto">
          <MapCanvas containerRef={containerRef} />
          {day.stops.map((stop, index) => {
            const active = stop.id === stopId;
            return (
              <MapMarker key={`${day.id}-${stop.id}`} map={map} position={stop.position} zIndex={active ? 5 : 0}>
                <button
                  type="button"
                  aria-label={stop.name}
                  onClick={() => focus(stop)}
                  className={cn('flex items-center justify-center rounded-full font-mono text-xs font-semibold shadow-md ring-2 ring-background transition-transform', active ? 'size-9 scale-110 text-white' : 'size-7 bg-foreground text-background hover:scale-110')}
                  style={active ? { background: accentColor } : undefined}
                >
                  {index + 1}
                </button>
              </MapMarker>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
