'use client';

import * as React from 'react';
import { Flag, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { distanceKm, fitToPoints, lineFeature, MapCanvas, MapMarker, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface ReplayStop {
  /** How far along the route the stop is, 0 to 1. */
  at: number;
  label: string;
  /** How long the vehicle stayed, in minutes. */
  dwellMin: number;
}

const SPEEDS = [1, 2, 4, 8] as const;
/** At 1×, the whole trip plays in this many seconds. */
const SECONDS_AT_1X = 40;

function clock(startMinutes: number, offsetMinutes: number) {
  const total = Math.floor(startMinutes + offsetMinutes);
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** TripReplay — a recorded trip you can scrub and play back, with its stops on the timeline. */
export function TripReplay({
  route,
  movingMin,
  stops = [],
  startMinutes = 8 * 60,
  title = 'Trip replay',
  defaultProgress = 0,
  autoPlay = false,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  route: LngLat[];
  /** How long the vehicle spent moving, in minutes, not counting stops. */
  movingMin: number;
  stops?: ReplayStop[];
  /** When the trip started, in minutes after midnight. */
  startMinutes?: number;
  title?: string;
  /** Where the scrubber starts, 0 to 1. */
  defaultProgress?: number;
  autoPlay?: boolean;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [time, setTime] = React.useState(() => defaultProgress * (movingMin + stops.reduce((sum, stop) => sum + stop.dwellMin, 0)));
  const [playing, setPlaying] = React.useState(autoPlay);
  const [speed, setSpeed] = React.useState<(typeof SPEEDS)[number]>(2);

  const sortedStops = React.useMemo(() => [...stops].sort((a, b) => a.at - b.at), [stops]);
  const totalMin = movingMin + sortedStops.reduce((sum, stop) => sum + stop.dwellMin, 0);

  const cumulative = React.useMemo(() => {
    const totals = [0];
    for (let i = 1; i < route.length; i += 1) totals.push(totals[i - 1] + distanceKm(route[i - 1], route[i]));
    return totals;
  }, [route]);
  const lengthKm = cumulative[cumulative.length - 1];

  /** Where the vehicle is `minutes` into the trip: along the route, or parked at a stop. */
  const at = React.useCallback(
    (minutes: number) => {
      let clockMin = minutes;
      let movedMin = 0;
      let travelled = 0;
      for (const stop of sortedStops) {
        const legMin = (stop.at - travelled) * movingMin;
        if (clockMin <= legMin) {
          movedMin += clockMin;
          return { fraction: movedMin / movingMin, stop: null as ReplayStop | null };
        }
        clockMin -= legMin;
        movedMin += legMin;
        travelled = stop.at;
        if (clockMin <= stop.dwellMin) return { fraction: stop.at, stop };
        clockMin -= stop.dwellMin;
      }
      return { fraction: Math.min(1, (movedMin + clockMin) / movingMin), stop: null as ReplayStop | null };
    },
    [sortedStops, movingMin],
  );

  const now = at(time);
  const positionAt = React.useCallback(
    (fraction: number): { position: LngLat; index: number } => {
      const target = fraction * lengthKm;
      let index = cumulative.findIndex((distance) => distance >= target);
      if (index <= 0) index = 1;
      const span = cumulative[index] - cumulative[index - 1] || 1;
      const t = (target - cumulative[index - 1]) / span;
      const a = route[index - 1];
      const b = route[index];
      return { position: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], index: index - 1 };
    },
    [cumulative, lengthKm, route],
  );
  const current = positionAt(now.fraction);

  React.useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const tick = (nowMs: number) => {
      const dt = (nowMs - last) / 1000;
      last = nowMs;
      setTime((value) => {
        const next = value + (dt * speed * totalMin) / SECONDS_AT_1X;
        if (next >= totalMin) {
          setPlaying(false);
          return totalMin;
        }
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, totalMin]);

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: false,
    onLoad: (instance) => {
      instance.addSource('done', { type: 'geojson', data: lineFeature([]) });
      instance.addSource('todo', { type: 'geojson', data: lineFeature([]) });
      const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
      instance.addLayer({ id: 'todo', type: 'line', source: 'todo', layout, paint: { 'line-color': '#a3a3a3', 'line-width': 3, 'line-opacity': 0.7 } });
      instance.addLayer({ id: 'done-casing', type: 'line', source: 'done', layout, paint: { 'line-color': '#ffffff', 'line-width': 8 } });
      instance.addLayer({ id: 'done', type: 'line', source: 'done', layout, paint: { 'line-width': 4 } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'done', lineFeature([...route.slice(0, current.index + 1), current.position]));
    setSourceData(map, 'todo', lineFeature([current.position, ...route.slice(current.index + 1)]));
    map.setPaintProperty('done', 'line-color', accentColor);
  }, [map, ready, route, current.index, current.position, accentColor]);

  React.useEffect(() => {
    if (!map || !ready) return;
    fitToPoints(map, route, 40);
  }, [map, ready, route]);

  const speedNow = now.stop ? 0 : (lengthKm / (movingMin / 60));
  const stopMarks = React.useMemo(() => {
    let offset = 0;
    let travelled = 0;
    return sortedStops.map((stop) => {
      offset += (stop.at - travelled) * movingMin;
      travelled = stop.at;
      const mark = { stop, position: positionAt(stop.at).position, startsAt: offset };
      offset += stop.dwellMin;
      return mark;
    });
  }, [sortedStops, movingMin, positionAt]);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="relative h-64 bg-muted">
        <MapCanvas containerRef={containerRef} />
        {stopMarks.map(({ stop, position }) => (
          <MapMarker key={stop.label} map={map} position={position}>
            <span className="flex size-6 items-center justify-center rounded-full bg-background shadow-md ring-2 ring-foreground/70">
              <Flag className="size-3" />
            </span>
          </MapMarker>
        ))}
        <MapMarker map={map} position={current.position} zIndex={4}>
          <span className="block size-4 rounded-full ring-4 ring-background" style={{ background: accentColor }} />
        </MapMarker>
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-background px-3 py-2 shadow-sm ring-1 ring-border">
          <p className="text-xs text-muted-foreground">{now.stop ? `Stopped: ${now.stop.label}` : title}</p>
          <p className="font-mono text-lg font-semibold tabular-nums">{clock(startMinutes, time)}</p>
        </div>
        <div className="pointer-events-none absolute right-3 top-3 rounded-lg bg-background px-3 py-2 text-right shadow-sm ring-1 ring-border">
          <p className="text-xs text-muted-foreground">Speed</p>
          <p className="font-mono text-lg font-semibold tabular-nums">
            {Math.round(speedNow)} <span className="text-xs font-normal text-muted-foreground">km/h</span>
          </p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="relative pt-3">
          {stopMarks.map(({ stop, startsAt }) => (
            <span
              key={stop.label}
              className="pointer-events-none absolute top-0 -translate-x-1/2 text-[10px] text-muted-foreground"
              style={{ left: `${((startsAt + stop.dwellMin / 2) / totalMin) * 100}%` }}
              title={`${stop.label}, ${stop.dwellMin} min`}
            >
              ▾
            </span>
          ))}
          <input
            type="range"
            min={0}
            max={totalMin}
            step={totalMin / 1000}
            value={time}
            onChange={(event) => {
              setPlaying(false);
              setTime(Number(event.target.value));
            }}
            aria-label="Position in the trip"
            className="h-6 w-full"
            style={{ accentColor }}
          />
          <div className="flex justify-between font-mono text-xs tabular-nums text-muted-foreground">
            <span>{clock(startMinutes, 0)}</span>
            <span>{clock(startMinutes, totalMin)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            size="sm"
            onClick={() => {
              if (time >= totalMin) setTime(0);
              setPlaying((value) => !value);
            }}
          >
            {playing ? <Pause /> : <Play />} {playing ? 'Pause' : time >= totalMin ? 'Replay' : 'Play'}
          </Button>
          <div className="flex gap-1" role="group" aria-label="Playback speed">
            {SPEEDS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSpeed(option)}
                aria-pressed={speed === option}
                className={cn('rounded-md px-2 py-1 font-mono text-xs tabular-nums transition-colors', speed === option ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted')}
              >
                {option}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
