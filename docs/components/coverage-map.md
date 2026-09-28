# CoverageMap

Where a network reaches, and how well.

Coverage areas around each site, shaded by signal strength, with site markers you can select and a legend that filters the map by strength and shows how many sites there are of each.

**Category:** Data visualisation · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/coverage-map.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

## Usage

```tsx
<CoverageMap
  cells={sites.map((site) => ({ id: site.id, name: site.name, position: site.position, radiusKm: site.range, signal: site.quality }))}
  title="Network coverage"
/>
```

## Anatomy

```tsx
import { CoverageMap, type CoverageCell } from '@/components/maps/coverage-map';

// CoverageCell: id, name, position, radiusKm, signal ('strong' | 'ok' | 'weak')
// Each cell is drawn as a circle; overlapping cells add up, so dense areas read darker.
<CoverageMap cells={cells} />
```

## Examples

### Fewer sites

```tsx
<CoverageMap cells={cells.slice(0, 5)} title="Core network" />
```

## API reference

#### CoverageMap

Circles of coverage with a filtering legend.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `cells` | `CoverageCell[]` | — | The sites and how far each reaches. |
| `title` | `string` | `'Network coverage'` | Label next to the legend. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the coverage shading. Map layers cannot read CSS variables, so pass a value. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/maps/coverage-map.tsx`

```tsx
'use client';

import * as React from 'react';
import { RadioTower } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { circleRing, fitToPoints, MapCanvas, MapMarker, polygonFeature, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export type Signal = 'strong' | 'ok' | 'weak';

export interface CoverageCell {
  id: string;
  name: string;
  position: LngLat;
  radiusKm: number;
  signal: Signal;
}

const SIGNALS: { id: Signal; label: string; opacity: number }[] = [
  { id: 'strong', label: 'Strong', opacity: 0.42 },
  { id: 'ok', label: 'Fair', opacity: 0.24 },
  { id: 'weak', label: 'Weak', opacity: 0.11 },
];

/** CoverageMap — where a network or service reaches, and how well, with a legend that filters the map. */
export function CoverageMap({
  cells,
  title = 'Network coverage',
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  cells: CoverageCell[];
  title?: string;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [hidden, setHidden] = React.useState<Signal[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const visible = cells.filter((cell) => !hidden.includes(cell.signal));
  const selected = cells.find((cell) => cell.id === selectedId);
  const counts = SIGNALS.map((signal) => ({ ...signal, count: cells.filter((cell) => cell.signal === signal.id).length }));

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: true,
    onLoad: (instance) => {
      instance.addSource('coverage', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      instance.addLayer({ id: 'coverage-fill', type: 'fill', source: 'coverage', paint: { 'fill-opacity': ['get', 'opacity'] } });
      instance.addLayer({ id: 'coverage-line', type: 'line', source: 'coverage', paint: { 'line-width': 1, 'line-opacity': 0.5 } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'coverage', {
      type: 'FeatureCollection',
      features: visible.map((cell) => polygonFeature(circleRing(cell.position, cell.radiusKm), { opacity: SIGNALS.find((signal) => signal.id === cell.signal)!.opacity })),
    });
    map.setPaintProperty('coverage-fill', 'fill-color', accentColor);
    map.setPaintProperty('coverage-line', 'line-color', accentColor);
  }, [map, ready, visible, accentColor]);

  React.useEffect(() => {
    if (!map || !ready) return;
    fitToPoints(map, cells.flatMap((cell) => circleRing(cell.position, cell.radiusKm, 8)), 40);
  }, [map, ready, cells]);

  const toggle = (signal: Signal) => setHidden((current) => (current.includes(signal) ? current.filter((item) => item !== signal) : [...current, signal]));

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="relative h-72 bg-muted">
        <MapCanvas containerRef={containerRef} />
        {visible.map((cell) => (
          <MapMarker key={cell.id} map={map} position={cell.position} zIndex={cell.id === selectedId ? 5 : 0}>
            <button
              type="button"
              aria-label={cell.name}
              onClick={() => setSelectedId(cell.id === selectedId ? null : cell.id)}
              className={cn('flex items-center justify-center rounded-full shadow-md ring-2 ring-background transition-transform', cell.id === selectedId ? 'size-8 scale-110 text-white' : 'size-6 bg-foreground text-background hover:scale-110')}
              style={cell.id === selectedId ? { background: accentColor } : undefined}
            >
              <RadioTower className={cell.id === selectedId ? 'size-4' : 'size-3'} />
            </button>
          </MapMarker>
        ))}
        {selected ? (
          <div className="absolute inset-x-3 bottom-3 rounded-lg bg-background p-3 shadow-lg ring-1 ring-border">
            <p className="text-sm font-bold">{selected.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {SIGNALS.find((signal) => signal.id === selected.signal)?.label} signal · reaches {selected.radiusKm} km
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
        <p className="text-sm font-bold">{title}</p>
        <div className="flex flex-wrap gap-3" role="group" aria-label="Signal strength">
          {counts.map((signal) => {
            const off = hidden.includes(signal.id);
            return (
              <button key={signal.id} type="button" onClick={() => toggle(signal.id)} aria-pressed={!off} className={cn('flex items-center gap-1.5 text-xs transition-opacity', off && 'opacity-40')}>
                <span className="block size-3 rounded-sm ring-1 ring-inset" style={{ background: accentColor, opacity: signal.opacity + 0.15, ['--tw-ring-color' as string]: accentColor }} />
                {signal.label}
                <span className="font-mono tabular-nums text-muted-foreground">{signal.count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
```
