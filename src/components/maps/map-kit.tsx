'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import type { Feature, GeoJSON as GeoJSONData, LineString, Polygon } from 'geojson';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { cn } from '@/lib/utils';

// Vite bundles the worker (and its shared chunk) and hands back a URL; other bundlers have their own equivalent.
maplibregl.setWorkerUrl(maplibreWorkerUrl);

export type LngLat = [longitude: number, latitude: number];

/** OpenFreeMap's light style: open source, no API key. */
export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

export type MapStyle = string | maplibregl.StyleSpecification;

/**
 * useMap — creates a MapLibre map in the container `containerRef` points at, keeps it sized,
 * and tears it down on unmount. `onLoad` runs once the style has loaded: add sources and layers there.
 */
export function useMap({
  style = MAP_STYLE,
  interactive = false,
  options,
  onLoad,
}: {
  style?: MapStyle;
  interactive?: boolean;
  /** Extra MapLibre options, read once when the map is created. */
  options?: Partial<maplibregl.MapOptions>;
  onLoad?: (map: maplibregl.Map) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<maplibregl.Map | null>(null);
  const [ready, setReady] = React.useState(false);
  const onLoadRef = React.useRef(onLoad);
  onLoadRef.current = onLoad;

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // On a touchscreen a one-finger drag should scroll the page, not pan the map: ask for two fingers.
    const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    const instance = new maplibregl.Map({
      container,
      style,
      interactive,
      cooperativeGestures: interactive && touch,
      attributionControl: { compact: true },
      ...options,
    });

    instance.on('load', () => {
      // MapLibre opens the compact attribution on first paint; keep it as the small (i) until tapped.
      const attribution = container.querySelector('.maplibregl-ctrl-attrib');
      attribution?.classList.remove('maplibregl-compact-show');
      attribution?.removeAttribute('open');
      onLoadRef.current?.(instance);
      setReady(true);
    });

    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(container);
    setMap(instance);

    return () => {
      observer.disconnect();
      instance.remove();
      setMap(null);
      setReady(false);
    };
    // The map is created once per style/interactivity; data and markers sync in the caller's own effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, interactive]);

  return { containerRef, map, ready };
}

/**
 * MapCanvas — the element `useMap` draws into. MapLibre's stylesheet forces `position: relative`
 * on its container, so it needs a sized wrapper rather than absolute positioning of its own.
 */
export function MapCanvas({ containerRef, className }: { containerRef: React.RefObject<HTMLDivElement | null>; className?: string }) {
  return (
    <div className={cn('absolute inset-0', className)}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

/** MapMarker — renders React children as a MapLibre marker at `position`. */
export function MapMarker({
  map,
  position,
  children,
  anchor = 'center',
  draggable,
  onDragEnd,
  zIndex,
}: {
  map: maplibregl.Map | null;
  position: LngLat;
  children: React.ReactNode;
  anchor?: maplibregl.PositionAnchor;
  draggable?: boolean;
  onDragEnd?: (position: LngLat) => void;
  zIndex?: number;
}) {
  const [element] = React.useState(() => document.createElement('div'));
  const marker = React.useRef<maplibregl.Marker | null>(null);
  const onDragEndRef = React.useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  React.useEffect(() => {
    if (!map) return;
    const instance = new maplibregl.Marker({ element, anchor, draggable }).setLngLat(position).addTo(map);
    instance.on('dragend', () => {
      const { lng, lat } = instance.getLngLat();
      onDragEndRef.current?.([lng, lat]);
    });
    marker.current = instance;
    return () => {
      instance.remove();
      marker.current = null;
    };
    // Position changes are applied by the effect below rather than by recreating the marker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, element, anchor, draggable]);

  React.useEffect(() => {
    marker.current?.setLngLat(position);
  }, [position[0], position[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    element.style.zIndex = zIndex === undefined ? '' : String(zIndex);
  }, [element, zIndex]);

  return createPortal(children, element);
}

/** A GeoJSON line through `coordinates`. */
export function lineFeature(coordinates: LngLat[]): Feature<LineString> {
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } };
}

/** A GeoJSON polygon from one outer ring. The ring is closed for you. */
export function polygonFeature(ring: LngLat[], properties: Record<string, unknown> = {}): Feature<Polygon> {
  const closed = ring.length && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) ? [...ring, ring[0]] : ring;
  return { type: 'Feature', properties, geometry: { type: 'Polygon', coordinates: [closed] } };
}

/** A ring approximating a circle of `radiusKm` around `center`. */
export function circleRing(center: LngLat, radiusKm: number, steps = 64): LngLat[] {
  const points: LngLat[] = [];
  const latRad = (center[1] * Math.PI) / 180;
  for (let i = 0; i < steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    points.push([center[0] + ((radiusKm / (111.32 * Math.cos(latRad))) * Math.cos(angle)), center[1] + (radiusKm / 110.574) * Math.sin(angle)]);
  }
  return points;
}

/** Whether `point` is inside `ring` (ray casting). */
export function pointInRing(point: LngLat, ring: LngLat[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > point[1] !== yj > point[1] && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** A curved line from `from` to `to`, bowed to one side. Good for flows between places. */
export function arcBetween(from: LngLat, to: LngLat, bow = 0.2, steps = 40): LngLat[] {
  const mid: LngLat = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const control: LngLat = [mid[0] - dy * bow, mid[1] + dx * bow];
  const points: LngLat[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    points.push([
      (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * control[0] + t ** 2 * to[0],
      (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * control[1] + t ** 2 * to[1],
    ]);
  }
  return points;
}

/** Shift longitudes by whole turns so each point sits within 180° of the one before it, for routes that cross the antimeridian. */
export function unwrapLngs(points: LngLat[]): LngLat[] {
  const out: LngLat[] = [];
  points.forEach((point, index) => {
    let lng = point[0];
    if (index) {
      const previous = out[index - 1][0];
      while (lng - previous > 180) lng -= 360;
      while (lng - previous < -180) lng += 360;
    }
    out.push([lng, point[1]]);
  });
  return out;
}

/** Walking time in minutes for a distance, at 5 km/h. */
export function walkMinutes(km: number) {
  return Math.max(1, Math.round((km / 5) * 60));
}

/** Replace the data of a GeoJSON source that was added to the map. */
export function setSourceData(map: maplibregl.Map, sourceId: string, data: GeoJSONData) {
  (map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined)?.setData(data);
}

/** Fit the map to a set of points, without animating. */
export function fitToPoints(
  map: maplibregl.Map,
  points: LngLat[],
  padding: number | maplibregl.PaddingOptions = 48,
  options?: maplibregl.FitBoundsOptions,
) {
  if (!points.length) return;
  const bounds = new maplibregl.LngLatBounds(points[0], points[0]);
  points.forEach((point) => bounds.extend(point));
  map.fitBounds(bounds, { padding, duration: 0, maxZoom: 16, ...options });
}

/** Distance between two positions in kilometres (haversine). */
export function distanceKm(a: LngLat, b: LngLat) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Compass bearing from one position to another, in degrees clockwise from north. */
export function bearing(from: LngLat, to: LngLat) {
  const rad = Math.PI / 180;
  const y = Math.sin((to[0] - from[0]) * rad) * Math.cos(to[1] * rad);
  const x = Math.cos(from[1] * rad) * Math.sin(to[1] * rad) - Math.sin(from[1] * rad) * Math.cos(to[1] * rad) * Math.cos((to[0] - from[0]) * rad);
  return ((Math.atan2(y, x) / rad) + 360) % 360;
}

export function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
