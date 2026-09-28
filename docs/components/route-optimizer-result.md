# RouteOptimizerResult

The route as booked against the route after optimising.

Both routes on one map (as booked in grey and dashed, optimised in the accent colour), a Before, After or Both toggle that also renumbers the stops, and a table of distance and drive time with what was saved.

**Category:** Fleet and operations · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/route-optimizer-result.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

## Usage

```tsx
<RouteOptimizerResult
  stops={stops}
  before={{ route: bookedRoute, distanceKm: 29.0, durationMin: 53 }}
  after={{ route: optimisedRoute, distanceKm: 16.3, durationMin: 31 }}
/>
```

## Anatomy

```tsx
import { RouteOptimizerResult, type OptimizerStop } from '@/components/maps/route-optimizer-result';

// OptimizerStop: label, position, beforeIndex, afterIndex (both zero-based).
// The two routes come from your routing service: one through the stops in booking order,
// one in the order its optimiser chose.
<RouteOptimizerResult stops={stops} before={before} after={after} />
```

## Examples

### Showing only the new route

```tsx
<RouteOptimizerResult stops={stops} before={before} after={after} />
```

## API reference

#### RouteOptimizerResult

A before-and-after comparison of one set of stops.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `stops` | `OptimizerStop[]` | — | label, position, beforeIndex and afterIndex. |
| `before` | `RouteResult` | — | route (LngLat[]), distanceKm and durationMin for the original order. |
| `after` | `RouteResult` | — | The same for the optimised order. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the optimised route and the savings badge. Map layers cannot read CSS variables, so pass a value. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/maps/route-optimizer-result.tsx`

```tsx
'use client';

import * as React from 'react';
import { ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, lineFeature, MapCanvas, MapMarker, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface OptimizerStop {
  label: string;
  position: LngLat;
  /** Zero-based position in the original order. */
  beforeIndex: number;
  /** Zero-based position in the optimised order. */
  afterIndex: number;
}

export interface RouteResult {
  route: LngLat[];
  distanceKm: number;
  durationMin: number;
}

type View = 'before' | 'after' | 'both';

function saving(before: number, after: number) {
  return { amount: before - after, percent: before ? Math.round(((before - after) / before) * 100) : 0 };
}

/** RouteOptimizerResult — the route as booked against the route after optimising, and what it saved. */
export function RouteOptimizerResult({
  stops,
  before,
  after,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  stops: OptimizerStop[];
  before: RouteResult;
  after: RouteResult;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [view, setView] = React.useState<View>('both');

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: false,
    onLoad: (instance) => {
      instance.addSource('before', { type: 'geojson', data: lineFeature([]) });
      instance.addSource('after', { type: 'geojson', data: lineFeature([]) });
      const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
      instance.addLayer({ id: 'before', type: 'line', source: 'before', layout, paint: { 'line-color': '#a3a3a3', 'line-width': 3, 'line-dasharray': [2, 1.5] } });
      instance.addLayer({ id: 'after-casing', type: 'line', source: 'after', layout, paint: { 'line-color': '#ffffff', 'line-width': 8 } });
      instance.addLayer({ id: 'after', type: 'line', source: 'after', layout, paint: { 'line-width': 4 } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'before', lineFeature(before.route));
    setSourceData(map, 'after', lineFeature(after.route));
    map.setPaintProperty('after', 'line-color', accentColor);
    fitToPoints(map, stops.map((stop) => stop.position), { top: 40, bottom: 40, left: 48, right: 48 });
  }, [map, ready, before, after, stops, accentColor]);

  React.useEffect(() => {
    if (!map || !ready) return;
    const show = (id: string, visible: boolean) => map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
    show('before', view !== 'after');
    show('after', view !== 'before');
    show('after-casing', view !== 'before');
  }, [map, ready, view]);

  const distance = saving(before.distanceKm, after.distanceKm);
  const time = saving(before.durationMin, after.durationMin);

  const rows = [
    { label: 'Distance', before: `${before.distanceKm.toFixed(1)} km`, after: `${after.distanceKm.toFixed(1)} km`, saved: `${distance.amount.toFixed(1)} km`, percent: distance.percent },
    { label: 'Drive time', before: `${before.durationMin} min`, after: `${after.durationMin} min`, saved: `${time.amount} min`, percent: time.percent },
  ];

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold">Route optimised</p>
          <Badge className="text-white" style={{ background: accentColor }}>
            <ArrowDown /> {distance.percent}% shorter
          </Badge>
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Which route to show">
          {(['before', 'after', 'both'] as const).map((option) => (
            <button key={option} type="button" onClick={() => setView(option)} aria-pressed={view === option}>
              <Badge variant={view === option ? 'default' : 'outline'} className="capitalize">
                {option}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-64 bg-muted">
        <MapCanvas containerRef={containerRef} />
        {stops.map((stop) => {
          const index = view === 'before' ? stop.beforeIndex : stop.afterIndex;
          return (
            <MapMarker key={stop.label} map={map} position={stop.position} zIndex={1}>
              <span className="flex size-6 items-center justify-center rounded-full bg-foreground font-mono text-[11px] font-semibold text-background shadow-md ring-2 ring-background" title={stop.label}>
                {index + 1}
              </span>
            </MapMarker>
          );
        })}
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-3 rounded-full bg-background px-3 py-1.5 text-xs shadow-sm ring-1 ring-border">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="block h-0.5 w-4 border-t-2 border-dashed border-muted-foreground/60" /> As booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="block h-0.5 w-4 rounded-full" style={{ background: accentColor }} /> Optimised
          </span>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-4 py-2 font-medium" />
            <th className="px-2 py-2 font-medium">Booked</th>
            <th className="px-2 py-2 font-medium">Optimised</th>
            <th className="px-4 py-2 text-right font-medium">Saved</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b last:border-0">
              <th scope="row" className="px-4 py-2.5 text-left font-medium">
                {row.label}
              </th>
              <td className="px-2 py-2.5 font-mono tabular-nums text-muted-foreground line-through decoration-muted-foreground/40">{row.before}</td>
              <td className="px-2 py-2.5 font-mono font-semibold tabular-nums">{row.after}</td>
              <td className="px-4 py-2.5 text-right font-mono tabular-nums" style={{ color: accentColor }}>
                −{row.saved} ({row.percent}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
```
