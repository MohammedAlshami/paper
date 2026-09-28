'use client';

import * as React from 'react';
import { Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, lineFeature, MapCanvas, MapMarker, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface VehicleDetail {
  name: string;
  plate?: string;
  status: 'moving' | 'idle' | 'delayed' | 'offline';
  driver: { name: string; phone?: string };
  speedKph: number;
  /** 0 to 100. */
  fuelPercent: number;
  odometerKm?: number;
  position: LngLat;
}

export interface VehicleStop {
  label: string;
  /** Free text, e.g. "9:40 am". */
  time: string;
  /** How long the vehicle stayed, e.g. "12 min". */
  dwell?: string;
}

/** VehicleDetailPanel — one vehicle: speed, fuel, its driver, and where it has been today. */
export function VehicleDetailPanel({
  vehicle,
  trail,
  stops = [],
  onCall,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  vehicle: VehicleDetail;
  /** Today's path so far, oldest first. The last point is drawn as the vehicle. */
  trail: LngLat[];
  stops?: VehicleStop[];
  onCall?: () => void;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: false,
    onLoad: (instance) => {
      instance.addSource('trail', { type: 'geojson', data: lineFeature([]) });
      const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
      instance.addLayer({ id: 'trail-casing', type: 'line', source: 'trail', layout, paint: { 'line-color': '#ffffff', 'line-width': 7 } });
      instance.addLayer({ id: 'trail', type: 'line', source: 'trail', layout, paint: { 'line-width': 3.5 } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'trail', lineFeature(trail));
    map.setPaintProperty('trail', 'line-color', accentColor);
    fitToPoints(map, trail, 36);
  }, [map, ready, trail, accentColor]);

  const lowFuel = vehicle.fuelPercent < 20;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-base font-bold">{vehicle.name}</p>
          {vehicle.plate ? <p className="font-mono text-xs text-muted-foreground">{vehicle.plate}</p> : null}
        </div>
        <Badge variant={vehicle.status === 'delayed' ? 'default' : 'outline'} style={vehicle.status === 'delayed' ? { background: accentColor } : undefined}>
          {vehicle.status}
        </Badge>
      </div>

      <dl className="grid grid-cols-3 divide-x border-b">
        <div className="px-4 py-3">
          <dt className="text-xs text-muted-foreground">Speed</dt>
          <dd className="mt-0.5 text-xl font-semibold tabular-nums">
            {Math.round(vehicle.speedKph)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">km/h</span>
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs text-muted-foreground">Fuel</dt>
          <dd className="mt-0.5 text-xl font-semibold tabular-nums" style={lowFuel ? { color: accentColor } : undefined}>
            {Math.round(vehicle.fuelPercent)}%
          </dd>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted" role="img" aria-label={`Fuel ${Math.round(vehicle.fuelPercent)} percent`}>
            <div className="h-full rounded-full bg-foreground" style={{ width: `${vehicle.fuelPercent}%`, ...(lowFuel ? { background: accentColor } : {}) }} />
          </div>
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs text-muted-foreground">Odometer</dt>
          <dd className="mt-0.5 text-xl font-semibold tabular-nums">
            {vehicle.odometerKm !== undefined ? Math.round(vehicle.odometerKm).toLocaleString() : '—'}
            <span className="ml-1 text-xs font-normal text-muted-foreground">km</span>
          </dd>
        </div>
      </dl>

      <div className="flex items-center gap-3 border-b px-4 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
          {vehicle.driver.name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{vehicle.driver.name}</p>
          <p className="truncate text-xs text-muted-foreground">Driver{vehicle.driver.phone ? ` · ${vehicle.driver.phone}` : ''}</p>
        </div>
        <Button size="icon" variant="outline" aria-label="Call driver" onClick={onCall}>
          <Phone />
        </Button>
      </div>

      <div className="relative h-44 bg-muted">
        <MapCanvas containerRef={containerRef} />
        {trail.length ? (
          <MapMarker map={map} position={trail[0]}>
            <span className="block size-2.5 rounded-full bg-foreground ring-2 ring-background" />
          </MapMarker>
        ) : null}
        <MapMarker map={map} position={vehicle.position} zIndex={2}>
          <span className="block size-4 rounded-full ring-4 ring-background" style={{ background: accentColor }} />
        </MapMarker>
        <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground shadow-sm ring-1 ring-border">Today</p>
      </div>

      {stops.length ? (
        <ol className="divide-y">
          {stops.map((stop, index) => (
            <li key={index} className="flex items-baseline gap-3 px-4 py-2.5 text-sm">
              <span className="w-16 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{stop.time}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{stop.label}</span>
              {stop.dwell ? <span className="shrink-0 text-xs text-muted-foreground">{stop.dwell}</span> : null}
            </li>
          ))}
        </ol>
      ) : null}
    </Card>
  );
}
