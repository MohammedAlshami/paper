'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, MapCanvas, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface HeatPoint {
  position: LngLat;
  /** Hour of the day, 0 to 23. */
  hour: number;
  /** How much this point counts. Defaults to 1. */
  weight?: number;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const pad = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

/** HeatmapCard — where activity is dense, for the hours you pick. */
export function HeatmapCard({
  points,
  title = 'Order density',
  unit = 'orders',
  defaultRange = [0, 23],
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  points: HeatPoint[];
  title?: string;
  /** What one point is, in the plural. Shown next to the total. */
  unit?: string;
  /** The starting hour range, inclusive. */
  defaultRange?: [number, number];
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [range, setRange] = React.useState<[number, number]>(defaultRange);

  const perHour = React.useMemo(() => {
    const counts = HOURS.map(() => 0);
    points.forEach((point) => {
      counts[point.hour] += point.weight ?? 1;
    });
    return counts;
  }, [points]);
  const peak = Math.max(...perHour, 1);
  const inRange = perHour.slice(range[0], range[1] + 1).reduce((sum, count) => sum + count, 0);
  const peakHour = perHour.indexOf(Math.max(...perHour.slice(range[0], range[1] + 1))) + 0;

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: true,
    onLoad: (instance) => {
      instance.addSource('heat', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      instance.addLayer({
        id: 'heat',
        type: 'heatmap',
        source: 'heat',
        paint: {
          'heatmap-weight': ['*', ['get', 'weight'], 0.5],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 0.35, 14, 1],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 10, 14, 34],
          'heatmap-opacity': 0.85,
        },
      });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'heat', {
      type: 'FeatureCollection',
      features: points.map((point) => ({
        type: 'Feature' as const,
        properties: { hour: point.hour, weight: point.weight ?? 1 },
        geometry: { type: 'Point' as const, coordinates: point.position },
      })),
    });
    fitToPoints(map, points.map((point) => point.position), 48);
  }, [map, ready, points]);

  React.useEffect(() => {
    if (!map || !ready) return;
    map.setFilter('heat', ['all', ['>=', ['get', 'hour'], range[0]], ['<=', ['get', 'hour'], range[1]]]);
    // A ramp from clear to the accent colour: density reads as saturation.
    map.setPaintProperty('heat', 'heatmap-color', [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(255,255,255,0)',
      0.2,
      `${accentColor}40`,
      0.5,
      `${accentColor}b3`,
      0.85,
      accentColor,
      1,
      '#be185d',
    ]);
  }, [map, ready, range, accentColor]);

  const setFrom = (value: number) => setRange(([, to]) => [Math.min(value, to), to]);
  const setTo = (value: number) => setRange(([from]) => [from, Math.max(value, from)]);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="relative h-72 bg-muted">
        <MapCanvas containerRef={containerRef} />
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-background px-3 py-2 shadow-sm ring-1 ring-border">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-lg font-semibold tabular-nums">
            {inRange.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
          </p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex h-12 items-end gap-0.5" role="img" aria-label={`${unit} per hour`}>
          {perHour.map((count, hour) => {
            const inside = hour >= range[0] && hour <= range[1];
            return (
              <span
                key={hour}
                className={cn('flex-1 rounded-sm transition-colors', inside ? '' : 'bg-muted')}
                style={{ height: `${Math.max(6, (count / peak) * 100)}%`, ...(inside ? { background: accentColor, opacity: 0.35 + (count / peak) * 0.65 } : {}) }}
                title={`${pad(hour)} · ${count}`}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(
            [
              { label: 'From', value: range[0], set: setFrom },
              { label: 'To', value: range[1], set: setTo },
            ] as const
          ).map((slider) => (
            <label key={slider.label} className="block">
              <span className="flex justify-between text-xs">
                <span className="text-muted-foreground">{slider.label}</span>
                <span className="font-mono tabular-nums">{pad(slider.value)}</span>
              </span>
              <input
                type="range"
                min={0}
                max={23}
                value={slider.value}
                onChange={(event) => slider.set(Number(event.target.value))}
                className="mt-1 h-6 w-full"
                style={{ accentColor }}
              />
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Busiest hour in range: <span className="font-mono text-foreground">{pad(peakHour)}</span>
        </p>
      </div>
    </Card>
  );
}
