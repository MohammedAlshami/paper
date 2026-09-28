# WeatherAlertMap

The regions under a storm, a flood or a closure.

Alert areas shaded by severity (warning, watch, advisory), a severity legend that filters the map, and a list of active alerts with their time windows. Selecting an alert outlines it and zooms to it.

**Category:** Travel and real estate · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/weather-alert-map.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

## Usage

```tsx
<WeatherAlertMap
  alerts={alerts}
  defaultSelectedId="w1"
  onSelect={(alert) => track('alert_opened', alert.id)}
/>
```

## Anatomy

```tsx
import { WeatherAlertMap, type WeatherAlert } from '@/components/maps/weather-alert-map';

// WeatherAlert: id, title, severity ('advisory' | 'watch' | 'warning'), ring, window?, description?
// Works for road closures and outages too: severity is just three levels of "how bad".
<WeatherAlertMap alerts={alerts} />
```

## Examples

### Warnings only

```tsx
<WeatherAlertMap alerts={alerts.filter((alert) => alert.severity === 'warning')} />
```

## API reference

#### WeatherAlertMap

Alert areas, a filtering legend, and a list. Panning and zooming are off.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `alerts` | `WeatherAlert[]` | — | The active alerts. |
| `defaultSelectedId` | `string` | — | The alert selected at the start. |
| `onSelect` | `(alert: WeatherAlert) => void` | — | Called when an alert is selected. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the alert shading and the warning badge. Map layers cannot read CSS variables, so pass a value. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/maps/weather-alert-map.tsx`

```tsx
'use client';

import * as React from 'react';
import { TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, MapCanvas, polygonFeature, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export type Severity = 'advisory' | 'watch' | 'warning';

export interface WeatherAlert {
  id: string;
  title: string;
  severity: Severity;
  /** The affected area's outer ring. */
  ring: LngLat[];
  /** Free text, e.g. "Until 9 pm tonight". */
  window?: string;
  description?: string;
}

const SEVERITIES: { id: Severity; label: string; opacity: number }[] = [
  { id: 'warning', label: 'Warning', opacity: 0.42 },
  { id: 'watch', label: 'Watch', opacity: 0.26 },
  { id: 'advisory', label: 'Advisory', opacity: 0.12 },
];

/** WeatherAlertMap — the regions under a storm, a flood or a closure, coloured by how serious it is. */
export function WeatherAlertMap({
  alerts,
  defaultSelectedId,
  onSelect,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  alerts: WeatherAlert[];
  defaultSelectedId?: string;
  onSelect?: (alert: WeatherAlert) => void;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [hidden, setHidden] = React.useState<Severity[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(defaultSelectedId ?? null);
  const visible = alerts.filter((alert) => !hidden.includes(alert.severity));
  const ordered = [...visible].sort((a, b) => SEVERITIES.findIndex((s) => s.id === b.severity) - SEVERITIES.findIndex((s) => s.id === a.severity));

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: true,
    options: { dragPan: false, scrollZoom: false, doubleClickZoom: false, touchZoomRotate: false, keyboard: false, dragRotate: false },
    onLoad: (instance) => {
      instance.addSource('alerts', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      instance.addLayer({ id: 'alerts-fill', type: 'fill', source: 'alerts', paint: { 'fill-opacity': ['get', 'opacity'] } });
      instance.addLayer({
        id: 'alerts-line',
        type: 'line',
        source: 'alerts',
        paint: { 'line-width': ['case', ['get', 'selected'], 3, 1.25], 'line-opacity': ['case', ['get', 'selected'], 1, 0.6] },
      });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'alerts', {
      type: 'FeatureCollection',
      features: ordered.map((alert) => polygonFeature(alert.ring, { opacity: SEVERITIES.find((s) => s.id === alert.severity)!.opacity, selected: alert.id === selectedId })),
    });
    map.setPaintProperty('alerts-fill', 'fill-color', accentColor);
    map.setPaintProperty('alerts-line', 'line-color', accentColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready, visible.length, selectedId, accentColor, alerts]);

  React.useEffect(() => {
    if (!map || !ready) return;
    const target = alerts.find((alert) => alert.id === selectedId);
    fitToPoints(map, target ? target.ring : alerts.flatMap((alert) => alert.ring), 40);
  }, [map, ready, alerts, selectedId]);

  const select = (alert: WeatherAlert) => {
    setSelectedId((current) => (current === alert.id ? null : alert.id));
    onSelect?.(alert);
  };

  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <div className="grid grid-cols-1 @2xl:h-[28rem] @2xl:grid-cols-[1fr_19rem]">
        <div className="relative h-72 bg-muted @2xl:h-auto">
          <MapCanvas containerRef={containerRef} />
          <div className="absolute bottom-3 left-3 flex gap-1 rounded-lg bg-background p-1 shadow-sm ring-1 ring-border" role="group" aria-label="Severity">
            {SEVERITIES.map((severity) => {
              const off = hidden.includes(severity.id);
              return (
                <button
                  key={severity.id}
                  type="button"
                  aria-pressed={!off}
                  onClick={() => setHidden((current) => (off ? current.filter((item) => item !== severity.id) : [...current, severity.id]))}
                  className={cn('flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-opacity hover:bg-muted', off && 'opacity-40')}
                >
                  <span className="block size-3 rounded-sm" style={{ background: accentColor, opacity: severity.opacity + 0.2 }} />
                  {severity.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col border-t @2xl:border-l @2xl:border-t-0">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-bold">Active alerts</p>
            <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">{visible.length} showing</p>
          </div>
          <ul className="divide-y overflow-y-auto @2xl:min-h-0 @2xl:flex-1">
            {ordered.map((alert) => (
              <li key={alert.id}>
                <button
                  type="button"
                  onClick={() => select(alert)}
                  aria-pressed={alert.id === selectedId}
                  className={cn('block w-full px-4 py-3 text-left transition-colors hover:bg-muted/50', alert.id === selectedId && 'bg-muted')}
                >
                  <span className="flex items-center gap-2">
                    <Badge variant={alert.severity === 'warning' ? 'default' : 'outline'} className="capitalize" style={alert.severity === 'warning' ? { background: accentColor } : undefined}>
                      {alert.severity === 'warning' ? <TriangleAlert /> : null}
                      {alert.severity}
                    </Badge>
                    {alert.window ? <span className="truncate text-xs text-muted-foreground">{alert.window}</span> : null}
                  </span>
                  <span className="mt-1.5 block text-sm font-bold">{alert.title}</span>
                  {alert.description && alert.id === selectedId ? <span className="mt-1 block text-xs text-muted-foreground">{alert.description}</span> : null}
                </button>
              </li>
            ))}
            {!ordered.length ? <li className="px-4 py-8 text-center text-sm text-muted-foreground">No alerts at this severity.</li> : null}
          </ul>
        </div>
      </div>
    </Card>
  );
}
```
