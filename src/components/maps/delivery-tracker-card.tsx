'use client';

import * as React from 'react';
import { Car, CircleCheck, Clock, House, MessageCircle, Phone, Star, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, lineFeature, MapCanvas, MapMarker, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface DeliveryStop {
  label: string;
  position: LngLat;
}

export interface DeliveryDriver {
  name: string;
  vehicle: string;
  plate?: string;
  rating?: number;
  position: LngLat;
}

export interface DeliveryStep {
  id: string;
  label: string;
}

function nearestIndex(route: LngLat[], point: LngLat) {
  let best = 0;
  let bestDistance = Infinity;
  route.forEach(([x, y], index) => {
    const distance = (x - point[0]) ** 2 + (y - point[1]) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

/** DeliveryTrackerCard — a live map, the ETA, the driver, and where the order is in its journey. */
export function DeliveryTrackerCard({
  orderId,
  origin,
  destination,
  driver,
  route,
  steps,
  currentStepId,
  etaMinutes,
  onCall,
  onMessage,
  routeColor = '#2e2e2e',
  accentColor = '#ec4899',
  mapStyle,
  interactive = false,
  className,
}: {
  orderId: string;
  origin: DeliveryStop;
  destination: DeliveryStop;
  driver: DeliveryDriver;
  /** The full planned route, origin to destination, as [longitude, latitude] pairs. */
  route: LngLat[];
  steps: DeliveryStep[];
  currentStepId: string;
  /** Minutes until arrival. Zero or less shows "Delivered". */
  etaMinutes: number;
  onCall?: () => void;
  onMessage?: () => void;
  routeColor?: string;
  accentColor?: string;
  /** Any MapLibre style URL or object. The default is OpenFreeMap, which needs no API key. */
  mapStyle?: MapStyle;
  interactive?: boolean;
  className?: string;
}) {
  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive,
    onLoad: (instance) => {
      instance.addSource('route-done', { type: 'geojson', data: lineFeature([]) });
      instance.addSource('route-todo', { type: 'geojson', data: lineFeature([]) });
      const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
      instance.addLayer({ id: 'route-done', type: 'line', source: 'route-done', layout, paint: { 'line-width': 4, 'line-opacity': 0.3 } });
      instance.addLayer({ id: 'route-todo-casing', type: 'line', source: 'route-todo', layout, paint: { 'line-color': '#ffffff', 'line-width': 8 } });
      instance.addLayer({ id: 'route-todo', type: 'line', source: 'route-todo', layout, paint: { 'line-width': 4 } });
    },
  });

  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === currentStepId),
  );
  const split = React.useMemo(() => nearestIndex(route, driver.position), [route, driver.position]);

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'route-done', lineFeature([...route.slice(0, split + 1), driver.position]));
    setSourceData(map, 'route-todo', lineFeature([driver.position, ...route.slice(split + 1)]));
    map.setPaintProperty('route-done', 'line-color', routeColor);
    map.setPaintProperty('route-todo', 'line-color', routeColor);
  }, [map, ready, route, split, driver.position, routeColor]);

  React.useEffect(() => {
    if (!map || !ready) return;
    fitToPoints(map, route, { top: 72, bottom: 64, left: 56, right: 56 });
  }, [map, ready, route]);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="relative h-72 bg-muted">
        <MapCanvas containerRef={containerRef} />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ring-border">
          {etaMinutes > 0 ? <Clock className="size-3.5" style={{ color: accentColor }} /> : <CircleCheck className="size-3.5" style={{ color: accentColor }} />}
          {etaMinutes > 0 ? `Arriving in ${etaMinutes} min` : 'Delivered'}
        </div>
      </div>

      <MapMarker map={map} position={origin.position}>
        <span className="flex size-7 items-center justify-center rounded-full bg-background text-foreground shadow ring-1 ring-border">
          <Store className="size-3.5" />
        </span>
      </MapMarker>
      <MapMarker map={map} position={destination.position}>
        <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-md ring-2 ring-background">
          <House className="size-4" />
        </span>
      </MapMarker>
      <MapMarker map={map} position={driver.position} zIndex={2}>
        <span className="relative flex size-9 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ background: accentColor }} />
          <span
            className="relative flex size-9 items-center justify-center rounded-full text-white shadow-md ring-2 ring-background"
            style={{ background: accentColor }}
          >
            <Car className="size-4" />
          </span>
        </span>
      </MapMarker>

      <CardContent className="space-y-5 py-5">
        <div>
          <p className="font-mono text-xs text-muted-foreground">Order {orderId}</p>
          <p className="mt-1 text-lg font-semibold leading-tight">{steps[currentIndex]?.label}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{destination.label}</p>
        </div>

        <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((step, index) => (
            <li key={step.id} className="space-y-1.5">
              <span
                className={cn('block h-1 rounded-full', index < currentIndex && 'bg-foreground', index > currentIndex && 'bg-muted')}
                style={index === currentIndex ? { background: accentColor } : undefined}
              />
              <span
                className={cn(
                  'block truncate text-[11px]',
                  index === currentIndex ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>

        <div className="flex items-center gap-3 border-t pt-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {driver.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium">
              {driver.name}
              {driver.rating ? (
                <span className="flex items-center gap-0.5 text-xs font-normal text-muted-foreground">
                  <Star className="size-3 fill-current" style={{ color: accentColor }} />
                  {driver.rating.toFixed(1)}
                </span>
              ) : null}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {driver.vehicle}
              {driver.plate ? ` · ${driver.plate}` : ''}
            </p>
          </div>
          <Button size="icon" variant="outline" aria-label="Message driver" onClick={onMessage}>
            <MessageCircle />
          </Button>
          <Button size="icon" aria-label="Call driver" onClick={onCall}>
            <Phone />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
