'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { fitToPoints, lineFeature, MapCanvas, MapMarker, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export type OrderStatus = 'preparing' | 'on-the-way' | 'delivered' | 'delayed';

const STATUS_LABEL: Record<OrderStatus, string> = {
  preparing: 'Preparing',
  'on-the-way': 'On the way',
  delivered: 'Delivered',
  delayed: 'Delayed',
};

/** Only builds the map once the row is near the viewport, so a long list of rows stays light. */
function useNearViewport() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [near, setNear] = React.useState(false);
  React.useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    const observer = new IntersectionObserver((entries) => entries.some((entry) => entry.isIntersecting) && setNear(true), { rootMargin: '200px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [near]);
  return { ref, near };
}

function Thumbnail({ route, position, routeColor, accentColor, mapStyle }: { route: LngLat[]; position?: LngLat; routeColor: string; accentColor: string; mapStyle?: MapStyle }) {
  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: false,
    options: { attributionControl: false },
    onLoad: (instance) => {
      // At thumbnail size the base map's place names are bigger than the streets they label.
      instance.getStyle().layers.filter((layer) => layer.type === 'symbol').forEach((layer) => instance.setLayoutProperty(layer.id, 'visibility', 'none'));
      instance.addSource('route', { type: 'geojson', data: lineFeature([]) });
      instance.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-width': 3 } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'route', lineFeature(route));
    map.setPaintProperty('route', 'line-color', routeColor);
    fitToPoints(map, route, 10);
  }, [map, ready, route, routeColor]);

  return (
    <>
      <MapCanvas containerRef={containerRef} />
      <MapMarker map={map} position={route[route.length - 1]}>
        <span className="block size-2.5 rounded-full bg-foreground ring-2 ring-background" />
      </MapMarker>
      {position ? (
        <MapMarker map={map} position={position} zIndex={2}>
          <span className="block size-3.5 rounded-full ring-2 ring-background" style={{ background: accentColor }} />
        </MapMarker>
      ) : null}
    </>
  );
}

/** OrderRouteMini — one order as a list row: a route thumbnail, where it is going, and its status. */
export function OrderRouteMini({
  title,
  from,
  to,
  route,
  position,
  status,
  detail,
  onClick,
  routeColor = '#2e2e2e',
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  title: string;
  from: string;
  to: string;
  /** The route, origin to destination. Drawn on the thumbnail. */
  route: LngLat[];
  /** Where the order is now. Adds a dot on the thumbnail. */
  position?: LngLat;
  status: OrderStatus;
  /** Free text under the status, e.g. "Arrives 2:40 pm". */
  detail?: string;
  onClick?: () => void;
  routeColor?: string;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const { ref, near } = useNearViewport();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('group flex w-full items-center gap-3 rounded-xl border bg-card p-2 text-left shadow-xs transition-colors hover:bg-muted/50', className)}
    >
      <div ref={ref} className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-muted">
        {near ? <Thumbnail route={route} position={position} routeColor={routeColor} accentColor={accentColor} mapStyle={mapStyle} /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {from} → {to}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <Badge variant={status === 'delayed' ? 'default' : 'outline'} style={status === 'delayed' ? { background: accentColor } : undefined}>
            {STATUS_LABEL[status]}
          </Badge>
          {detail ? <span className="truncate font-mono text-xs text-muted-foreground">{detail}</span> : null}
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
