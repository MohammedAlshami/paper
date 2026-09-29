# RegionChoropleth

Regions shaded by a number, and ranked beside the map.

A map of regions coloured along a scale by one metric, with a legend and a ranked list. Hovering a region or a list row highlights both. You bring the boundaries (any GeoJSON) and the numbers; the map is a picture of the data, so panning and zooming are off.

**Category:** Data visualisation · **Family:** maps · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/region-choropleth.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

Files to copy: `src/components/maps/region-choropleth.tsx`, `src/components/maps/map-kit.tsx`

## Usage

```tsx
<RegionChoropleth
  geojson={usStates}
  data={ordersByState}
  title="Top states"
  metricLabel="Same-day orders per 10,000 residents"
/>
```

## Anatomy

```tsx
import { RegionChoropleth, type RegionDatum } from '@/components/maps/region-choropleth';

// geojson: a FeatureCollection of Polygons or MultiPolygons.
// Each feature needs a property named featureKey (default "name"); data ids match it.
// data: { id: 'California', value: 128 }[]
<RegionChoropleth geojson={geojson} data={data} title="Top states" />
```

## Examples

### A custom colour scale

```tsx
<RegionChoropleth
  geojson={usStates}
  data={ordersByState}
  title="Top states"
  colors={['#f3f3f3', '#a3a3a3', '#2e2e2e']}
  topN={5}
/>
```

## API reference

#### RegionChoropleth

A map, a legend and a ranked list over one metric. Regions with no matching datum are drawn in grey.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `geojson` | `FeatureCollection<Polygon \| MultiPolygon>` | — | The region boundaries. |
| `data` | `RegionDatum[]` | — | One { id, value } per region. The id matches the feature property named featureKey. |
| `title` | `string` | — | Heading of the ranked list. |
| `metricLabel` | `string` | — | What the number means, shown under the title. |
| `formatValue` | `(value: number) => string` | `toLocaleString` | Formats values in the legend, the list and the hover label. |
| `featureKey` | `string` | `'name'` | The feature property that identifies a region. |
| `colors` | `string[]` | `pink scale` | Two or more hex colours, lowest value first. Values are interpolated along them. |
| `topN` | `number` | `8` | How many regions the ranked list shows. |
| `onSelect` | `(region: RegionDatum) => void` | — | Called when a region or a list row is clicked. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/maps/region-choropleth.tsx`

```tsx
'use client';

import * as React from 'react';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, MapCanvas, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface RegionDatum {
  /** Matches the region's `featureKey` property in the GeoJSON, e.g. its name. */
  id: string;
  value: number;
}

type Regions = FeatureCollection<Polygon | MultiPolygon, Record<string, unknown>>;

const DEFAULT_COLORS = ['#fce7f3', '#f9a8d4', '#f472b6', '#ec4899', '#9d174d'];
const NO_DATA = '#ececec';

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Colour at `t` (0 to 1) along a list of colour stops. */
function scale(colors: string[], t: number) {
  const position = Math.min(1, Math.max(0, t)) * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(position));
  const from = hexToRgb(colors[index]);
  const to = hexToRgb(colors[index + 1]);
  const mix = position - index;
  return `rgb(${from.map((channel, i) => Math.round(channel + (to[i] - channel) * mix)).join(',')})`;
}

function collectPoints(geojson: Regions): LngLat[] {
  const points: LngLat[] = [];
  const visit = (coordinates: unknown): void => {
    if (Array.isArray(coordinates) && typeof coordinates[0] === 'number') points.push(coordinates as LngLat);
    else if (Array.isArray(coordinates)) coordinates.forEach(visit);
  };
  geojson.features.forEach((feature) => visit(feature.geometry.coordinates));
  return points;
}

/** RegionChoropleth — regions shaded by a metric, with a legend and a ranked list that follows the hover. */
export function RegionChoropleth({
  geojson,
  data,
  title,
  metricLabel,
  formatValue = (value) => value.toLocaleString(),
  featureKey = 'name',
  colors = DEFAULT_COLORS,
  topN = 8,
  onSelect,
  mapStyle,
  className,
}: {
  /** Region boundaries. Each feature needs a property named `featureKey`. */
  geojson: Regions;
  data: RegionDatum[];
  title: string;
  /** What the number means, e.g. "Orders per 10,000 residents". */
  metricLabel?: string;
  formatValue?: (value: number) => string;
  featureKey?: string;
  /** Colour stops, lowest value first. Two or more hex colours. */
  colors?: string[];
  /** How many regions the ranked list shows. */
  topN?: number;
  onSelect?: (region: RegionDatum) => void;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [hovered, setHovered] = React.useState<string | null>(null);

  const { min, max, byId } = React.useMemo(() => {
    const values = data.map((datum) => datum.value);
    return { min: Math.min(...values), max: Math.max(...values), byId: new Map(data.map((datum) => [datum.id, datum])) };
  }, [data]);

  const painted = React.useMemo(
    () => ({
      ...geojson,
      features: geojson.features.map((feature) => {
        const datum = byId.get(String(feature.properties[featureKey]));
        return {
          ...feature,
          properties: { ...feature.properties, _color: datum ? scale(colors, max === min ? 1 : (datum.value - min) / (max - min)) : NO_DATA },
        };
      }),
    }),
    [geojson, byId, colors, min, max, featureKey],
  );

  const paintedRef = React.useRef(painted);
  paintedRef.current = painted;

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: true,
    // The map is a picture of the data, so panning and zooming are off; hover and click still work.
    options: { dragPan: false, scrollZoom: false, doubleClickZoom: false, touchZoomRotate: false, keyboard: false, dragRotate: false },
    onLoad: (instance) => {
      instance.addSource('regions', { type: 'geojson', data: paintedRef.current, promoteId: featureKey });
      // Put the fills under the map's own labels so place names stay readable.
      const firstLabel = instance.getStyle().layers.find((layer) => layer.type === 'symbol')?.id;
      instance.addLayer(
        {
          id: 'regions-fill',
          type: 'fill',
          source: 'regions',
          paint: {
            'fill-color': ['get', '_color'],
            'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.95, 0.78],
          },
        },
        firstLabel,
      );
      instance.addLayer({ id: 'regions-line', type: 'line', source: 'regions', paint: { 'line-color': '#ffffff', 'line-width': 0.75 } }, firstLabel);
    },
  });

  const bounds = React.useMemo(() => collectPoints(geojson), [geojson]);

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'regions', painted);
  }, [map, ready, painted]);

  React.useEffect(() => {
    if (!map || !ready) return;
    fitToPoints(map, bounds, { top: 16, bottom: 16, left: 16, right: 16 });
  }, [map, ready, bounds]);

  React.useEffect(() => {
    if (!map || !ready) return;
    const enter = (event: { features?: { properties?: Record<string, unknown> }[] }) => {
      const id = event.features?.[0]?.properties?.[featureKey];
      setHovered(id === undefined ? null : String(id));
      map.getCanvas().style.cursor = 'pointer';
    };
    const leave = () => {
      setHovered(null);
      map.getCanvas().style.cursor = '';
    };
    const click = (event: { features?: { properties?: Record<string, unknown> }[] }) => {
      const datum = byId.get(String(event.features?.[0]?.properties?.[featureKey]));
      if (datum) onSelect?.(datum);
    };
    map.on('mousemove', 'regions-fill', enter);
    map.on('mouseleave', 'regions-fill', leave);
    map.on('click', 'regions-fill', click);
    return () => {
      map.off('mousemove', 'regions-fill', enter);
      map.off('mouseleave', 'regions-fill', leave);
      map.off('click', 'regions-fill', click);
    };
  }, [map, ready, featureKey, byId, onSelect]);

  React.useEffect(() => {
    if (!map || !ready || hovered === null) return;
    map.setFeatureState({ source: 'regions', id: hovered }, { hover: true });
    return () => {
      map.setFeatureState({ source: 'regions', id: hovered }, { hover: false });
    };
  }, [map, ready, hovered]);

  const ranked = React.useMemo(() => [...data].sort((a, b) => b.value - a.value).slice(0, topN), [data, topN]);
  const hoveredDatum = hovered ? byId.get(hovered) : undefined;

  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <div className="grid grid-cols-1 @2xl:h-[30rem] @2xl:grid-cols-[1fr_17rem]">
        <div className="relative h-72 bg-muted @2xl:h-auto">
          <MapCanvas containerRef={containerRef} />

          <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-background px-3 py-1.5 text-xs shadow-sm ring-1 ring-border">
            {hovered ? (
              <>
                <span className="font-bold">{hovered}</span>
                <span className="ml-2 font-mono tabular-nums text-muted-foreground">{hoveredDatum ? formatValue(hoveredDatum.value) : 'No data'}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Hover a region</span>
            )}
          </p>

          <div className="pointer-events-none absolute bottom-3 left-3 w-44 rounded-lg bg-background p-2.5 shadow-sm ring-1 ring-border">
            <div className="h-2 rounded-full" style={{ background: `linear-gradient(to right, ${colors.join(', ')})` }} />
            <div className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
              <span>{formatValue(min)}</span>
              <span>{formatValue(max)}</span>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col border-t @2xl:border-l @2xl:border-t-0">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-bold">{title}</p>
            {metricLabel ? <p className="mt-0.5 text-xs text-muted-foreground">{metricLabel}</p> : null}
          </div>
          <ol className="divide-y overflow-y-auto @2xl:min-h-0 @2xl:flex-1">
            {ranked.map((datum, index) => (
              <li key={datum.id}>
                <button
                  type="button"
                  onMouseEnter={() => setHovered(datum.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onSelect?.(datum)}
                  className={cn('block w-full px-4 py-2 text-left transition-colors', hovered === datum.id && 'bg-muted')}
                >
                  <span className="flex items-baseline gap-2">
                    <span className="w-4 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">{datum.id}</span>
                    <span className="font-mono text-xs tabular-nums">{formatValue(datum.value)}</span>
                  </span>
                  <span className="ml-6 mt-1 block h-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(datum.value / max) * 100}%`, background: scale(colors, max === min ? 1 : (datum.value - min) / (max - min)) }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Card>
  );
}
```
