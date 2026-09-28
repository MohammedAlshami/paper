'use client';

import * as React from 'react';
import { Car, MapPin, MessageCircle, Phone, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, lineFeature, MapCanvas, MapMarker, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface ArrivingDriver {
  name: string;
  vehicle: string;
  plate: string;
  rating?: number;
  position: LngLat;
}

/** DriverArrivingSheet — the ride-share moment: the car closing in on your pickup, and who is in it. */
export function DriverArrivingSheet({
  pickup,
  driver,
  route,
  etaMinutes,
  pin,
  onCall,
  onMessage,
  onCancel,
  routeColor = '#2e2e2e',
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  pickup: { label: string; position: LngLat };
  driver: ArrivingDriver;
  /** The route from the driver to the pickup point. */
  route: LngLat[];
  etaMinutes: number;
  /** A code the rider reads out so the driver knows it is them. */
  pin?: string;
  onCall?: () => void;
  onMessage?: () => void;
  onCancel?: () => void;
  routeColor?: string;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: false,
    onLoad: (instance) => {
      instance.addSource('approach', { type: 'geojson', data: lineFeature([]) });
      const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
      instance.addLayer({ id: 'approach-casing', type: 'line', source: 'approach', layout, paint: { 'line-color': '#ffffff', 'line-width': 8 } });
      instance.addLayer({ id: 'approach', type: 'line', source: 'approach', layout, paint: { 'line-width': 4 } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'approach', lineFeature([driver.position, ...route]));
    map.setPaintProperty('approach', 'line-color', routeColor);
    fitToPoints(map, [driver.position, ...route, pickup.position], { top: 56, bottom: 48, left: 48, right: 48 });
  }, [map, ready, route, driver.position, pickup.position, routeColor]);

  const arriving = etaMinutes <= 1;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="relative h-60 bg-muted">
        <MapCanvas containerRef={containerRef} />
        <MapMarker map={map} position={pickup.position} anchor="bottom">
          <span className="flex flex-col items-center">
            <span className="rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background shadow-md">{pickup.label}</span>
            <MapPin className="-mt-0.5 size-6 fill-foreground text-background" strokeWidth={1.5} />
          </span>
        </MapMarker>
        <MapMarker map={map} position={driver.position} zIndex={2}>
          <span className="relative flex size-9 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ background: accentColor }} />
            <span className="relative flex size-9 items-center justify-center rounded-full text-white shadow-md ring-2 ring-background" style={{ background: accentColor }}>
              <Car className="size-4" />
            </span>
          </span>
        </MapMarker>
      </div>

      <div className="relative z-10 -mt-4 space-y-5 rounded-t-2xl bg-card px-5 pb-5 pt-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)]">
        <span className="mx-auto block h-1 w-10 rounded-full bg-border" aria-hidden />
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{arriving ? 'Your driver is here' : 'Your driver is arriving'}</p>
            <p className="mt-0.5 text-2xl font-semibold tracking-tight">{arriving ? 'Now' : `${etaMinutes} min`}</p>
          </div>
          {pin ? (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Share this PIN</p>
              <p className="mt-0.5 font-mono text-lg font-semibold tracking-[0.3em]">{pin}</p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3 rounded-xl border p-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {driver.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-bold">
              {driver.name}
              {driver.rating ? (
                <span className="flex items-center gap-0.5 text-xs font-normal text-muted-foreground">
                  <Star className="size-3 fill-current" style={{ color: accentColor }} />
                  {driver.rating.toFixed(2)}
                </span>
              ) : null}
            </p>
            <p className="truncate text-xs text-muted-foreground">{driver.vehicle}</p>
          </div>
          <span className="shrink-0 rounded-md border-2 border-foreground/80 px-2 py-1 font-mono text-sm font-semibold tracking-wider">{driver.plate}</span>
        </div>

        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Button variant="outline" onClick={onMessage}>
            <MessageCircle /> Message
          </Button>
          <Button onClick={onCall}>
            <Phone /> Call
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
