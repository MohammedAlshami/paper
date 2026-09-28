'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { arcBetween, fitToPoints, MapCanvas, MapMarker, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface FlowNode {
  id: string;
  label: string;
  position: LngLat;
}

export interface Flow {
  from: string;
  to: string;
  value: number;
}

/** OriginDestinationFlow — arcs between places, as thick as the volume between them, with the biggest flows ranked. */
export function OriginDestinationFlow({
  nodes,
  flows,
  title = 'Busiest routes',
  metricLabel,
  formatValue = (value) => value.toLocaleString(),
  topN = 8,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  nodes: FlowNode[];
  flows: Flow[];
  title?: string;
  /** What the number means, e.g. "Shipments this month". */
  metricLabel?: string;
  formatValue?: (value: number) => string;
  /** How many flows the ranked list shows. */
  topN?: number;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const byId = React.useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const ranked = React.useMemo(() => flows.map((flow, index) => ({ flow, index })).sort((a, b) => b.flow.value - a.flow.value), [flows]);
  const max = ranked[0]?.flow.value ?? 1;

  const volume = React.useMemo(() => {
    const totals = new Map<string, number>();
    flows.forEach((flow) => {
      totals.set(flow.from, (totals.get(flow.from) ?? 0) + flow.value);
      totals.set(flow.to, (totals.get(flow.to) ?? 0) + flow.value);
    });
    return totals;
  }, [flows]);
  const maxVolume = Math.max(...volume.values(), 1);

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: true,
    options: { dragPan: false, scrollZoom: false, doubleClickZoom: false, touchZoomRotate: false, keyboard: false, dragRotate: false },
    onLoad: (instance) => {
      instance.addSource('flows', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
      instance.addLayer({
        id: 'flows',
        type: 'line',
        source: 'flows',
        layout,
        paint: {
          'line-width': ['get', 'width'],
          'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.95, 0.45],
        },
      });
      instance.addLayer({ id: 'flows-hit', type: 'line', source: 'flows', layout, paint: { 'line-width': 14, 'line-opacity': 0 } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'flows', {
      type: 'FeatureCollection',
      features: flows.flatMap((flow, index) => {
        const from = byId.get(flow.from);
        const to = byId.get(flow.to);
        if (!from || !to) return [];
        return [
          {
            type: 'Feature' as const,
            id: index,
            properties: { width: 1.5 + (flow.value / max) * 7 },
            geometry: { type: 'LineString' as const, coordinates: arcBetween(from.position, to.position, 0.18) },
          },
        ];
      }),
    });
    map.setPaintProperty('flows', 'line-color', accentColor);
    fitToPoints(map, nodes.map((node) => node.position), { top: 40, bottom: 40, left: 48, right: 48 });
  }, [map, ready, flows, byId, nodes, max, accentColor]);

  React.useEffect(() => {
    if (!map || !ready) return;
    const move = (event: { features?: { id?: string | number }[] }) => {
      const id = event.features?.[0]?.id;
      setHovered(typeof id === 'number' ? id : null);
      map.getCanvas().style.cursor = 'pointer';
    };
    const leave = () => {
      setHovered(null);
      map.getCanvas().style.cursor = '';
    };
    map.on('mousemove', 'flows-hit', move);
    map.on('mouseleave', 'flows-hit', leave);
    return () => {
      map.off('mousemove', 'flows-hit', move);
      map.off('mouseleave', 'flows-hit', leave);
    };
  }, [map, ready]);

  React.useEffect(() => {
    if (!map || !ready || hovered === null) return;
    map.setFeatureState({ source: 'flows', id: hovered }, { hover: true });
    return () => {
      map.setFeatureState({ source: 'flows', id: hovered }, { hover: false });
    };
  }, [map, ready, hovered]);

  const active = hovered === null ? null : flows[hovered];

  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <div className="grid grid-cols-1 @2xl:h-[30rem] @2xl:grid-cols-[1fr_17rem]">
        <div className="relative h-72 bg-muted @2xl:h-auto">
          <MapCanvas containerRef={containerRef} />
          {nodes.map((node) => {
            const size = 8 + ((volume.get(node.id) ?? 0) / maxVolume) * 14;
            const lit = active && (active.from === node.id || active.to === node.id);
            return (
              <MapMarker key={node.id} map={map} position={node.position} zIndex={lit ? 3 : 1}>
                <span className="flex flex-col items-center gap-1">
                  <span className="block rounded-full bg-foreground ring-2 ring-background" style={{ width: size, height: size, ...(lit ? { background: accentColor } : {}) }} />
                  <span className={cn('rounded bg-background/90 px-1 text-[10px] font-medium shadow-sm', lit && 'font-bold')}>{node.label}</span>
                </span>
              </MapMarker>
            );
          })}
          <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-background px-3 py-1.5 text-xs shadow-sm ring-1 ring-border">
            {active ? (
              <>
                <span className="font-bold">
                  {byId.get(active.from)?.label} → {byId.get(active.to)?.label}
                </span>
                <span className="ml-2 font-mono tabular-nums text-muted-foreground">{formatValue(active.value)}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Hover a route</span>
            )}
          </p>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col border-t @2xl:border-l @2xl:border-t-0">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-bold">{title}</p>
            {metricLabel ? <p className="mt-0.5 text-xs text-muted-foreground">{metricLabel}</p> : null}
          </div>
          <ol className="divide-y overflow-y-auto @2xl:min-h-0 @2xl:flex-1">
            {ranked.slice(0, topN).map(({ flow, index }, rank) => (
              <li key={index}>
                <button
                  type="button"
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  className={cn('block w-full px-4 py-2 text-left transition-colors', hovered === index && 'bg-muted')}
                >
                  <span className="flex items-baseline gap-2">
                    <span className="w-4 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{rank + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">
                      {byId.get(flow.from)?.label} → {byId.get(flow.to)?.label}
                    </span>
                    <span className="font-mono text-xs tabular-nums">{formatValue(flow.value)}</span>
                  </span>
                  <span className="ml-6 mt-1 block h-1 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full" style={{ width: `${(flow.value / max) * 100}%`, background: accentColor }} />
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
