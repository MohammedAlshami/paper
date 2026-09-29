# DispatchBoard

Drag a job onto a driver. Or tap it, on a phone.

Unassigned jobs on one side, drivers below them, and a map of both. Drag a job onto a driver to assign it, or tap a job and then tap Assign, which is what touchscreens use. Assigned jobs appear as removable chips and as dashed lines on the map.

**Category:** Fleet and operations · **Family:** maps · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card button
```

And the packages the file imports: `maplibre-gl lucide-react`

Copy the file below into `src/components/maps/dispatch-board.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).

Files to copy: `src/components/maps/dispatch-board.tsx`, `src/components/maps/map-kit.tsx`

## Usage

```tsx
<DispatchBoard
  jobs={jobs}
  drivers={drivers}
  defaultAssignments={{ j1: 'd2' }}
  onAssign={(job, driver) => api.assign(job.id, driver.id)}
  onUnassign={(job, driver) => api.unassign(job.id, driver.id)}
/>
```

## Anatomy

```tsx
import { DispatchBoard, type DispatchJob, type DispatchDriver } from '@/components/maps/dispatch-board';

// assignments is a map of job id to driver id, and the board keeps it for you.
// Dragging uses the browser's own drag and drop; tap-to-assign covers touch.
<DispatchBoard jobs={jobs} drivers={drivers} onAssign={assign} />
```

## Examples

### Nothing assigned yet

```tsx
<DispatchBoard jobs={jobs} drivers={drivers} />
```

## API reference

#### DispatchBoard

Jobs, drivers and a map. Below 42rem wide it stacks them.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `jobs` | `DispatchJob[]` | — | id, title, address, position, and optionally window. |
| `drivers` | `DispatchDriver[]` | — | id, name, vehicle? and position. |
| `defaultAssignments` | `Record<string, string>` | `{}` | Job id to driver id, at the start. |
| `onAssign` | `(job, driver) => void` | — | Called when a job is assigned by drag or by tap. |
| `onUnassign` | `(job, driver) => void` | — | Called when an assignment is removed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the selected job and the drop target. Map layers cannot read CSS variables, so pass a value. |
| `mapStyle` | `string \| StyleSpecification` | `OpenFreeMap positron` | Any MapLibre style URL or object. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/maps/dispatch-board.tsx`

```tsx
'use client';

import * as React from 'react';
import { Car, GripVertical, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, lineFeature, MapCanvas, MapMarker, setSourceData, useMap, type LngLat, type MapStyle } from './map-kit';

export interface DispatchJob {
  id: string;
  title: string;
  address: string;
  position: LngLat;
  /** Free text, e.g. "Before 3 pm". */
  window?: string;
}

export interface DispatchDriver {
  id: string;
  name: string;
  vehicle?: string;
  position: LngLat;
}

/**
 * DispatchBoard — unassigned jobs on one side, the map on the other. Drag a job onto a driver to assign it,
 * or tap a job and then tap Assign, which is what touchscreens use.
 */
export function DispatchBoard({
  jobs,
  drivers,
  defaultAssignments = {},
  onAssign,
  onUnassign,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  jobs: DispatchJob[];
  drivers: DispatchDriver[];
  /** Job id to driver id. */
  defaultAssignments?: Record<string, string>;
  onAssign?: (job: DispatchJob, driver: DispatchDriver) => void;
  onUnassign?: (job: DispatchJob, driver: DispatchDriver) => void;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [assignments, setAssignments] = React.useState(defaultAssignments);
  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(null);
  const [overDriverId, setOverDriverId] = React.useState<string | null>(null);

  const unassigned = jobs.filter((job) => !assignments[job.id]);
  const jobById = React.useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);
  const driverById = React.useMemo(() => new Map(drivers.map((driver) => [driver.id, driver])), [drivers]);

  const assign = (jobId: string, driverId: string) => {
    const job = jobById.get(jobId);
    const driver = driverById.get(driverId);
    if (!job || !driver) return;
    setAssignments((current) => ({ ...current, [jobId]: driverId }));
    setSelectedJobId(null);
    setOverDriverId(null);
    onAssign?.(job, driver);
  };

  const unassign = (jobId: string) => {
    const job = jobById.get(jobId);
    const driver = driverById.get(assignments[jobId]);
    setAssignments(({ [jobId]: _removed, ...rest }) => rest);
    if (job && driver) onUnassign?.(job, driver);
  };

  const { containerRef, map, ready } = useMap({
    style: mapStyle,
    interactive: true,
    onLoad: (instance) => {
      instance.addSource('links', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      instance.addLayer({ id: 'links', type: 'line', source: 'links', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#2e2e2e', 'line-width': 2, 'line-dasharray': [1.5, 1.5] } });
    },
  });

  React.useEffect(() => {
    if (!map || !ready) return;
    setSourceData(map, 'links', {
      type: 'FeatureCollection',
      features: Object.entries(assignments).flatMap(([jobId, driverId]) => {
        const job = jobById.get(jobId);
        const driver = driverById.get(driverId);
        return job && driver ? [lineFeature([driver.position, job.position])] : [];
      }),
    });
  }, [map, ready, assignments, jobById, driverById]);

  React.useEffect(() => {
    if (!map || !ready) return;
    fitToPoints(map, [...jobs.map((job) => job.position), ...drivers.map((driver) => driver.position)], { top: 48, bottom: 48, left: 48, right: 48 });
  }, [map, ready, jobs, drivers]);

  const selectJob = (job: DispatchJob) => {
    setSelectedJobId((current) => (current === job.id ? null : job.id));
    map?.easeTo({ center: job.position, duration: 350 });
  };

  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <div className="grid grid-cols-1 @2xl:h-[34rem] @2xl:grid-cols-[22rem_1fr]">
        <div className="flex min-h-0 flex-col border-b @2xl:border-b-0 @2xl:border-r">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-bold">Unassigned</h3>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{unassigned.length} jobs</span>
          </div>
          <ul className="max-h-56 divide-y overflow-y-auto @2xl:max-h-none @2xl:min-h-0 @2xl:flex-1">
            {unassigned.map((job) => (
              <li key={job.id}>
                <button
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', job.id);
                    event.dataTransfer.effectAllowed = 'move';
                    setSelectedJobId(job.id);
                  }}
                  onClick={() => selectJob(job)}
                  aria-pressed={job.id === selectedJobId}
                  className={cn('flex w-full cursor-grab items-center gap-2 border-l-2 border-transparent px-3 py-2.5 text-left transition-colors hover:bg-muted/50 active:cursor-grabbing', job.id === selectedJobId && 'bg-muted')}
                  style={job.id === selectedJobId ? { borderLeftColor: accentColor } : undefined}
                >
                  <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{job.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{[job.address, job.window].filter(Boolean).join(' · ')}</span>
                  </span>
                </button>
              </li>
            ))}
            {!unassigned.length ? <li className="px-4 py-8 text-center text-sm text-muted-foreground">Every job has a driver.</li> : null}
          </ul>

          <div className="border-t">
            <h3 className="px-4 pb-1 pt-3 text-sm font-bold">Drivers</h3>
            <ul className="max-h-56 divide-y overflow-y-auto pb-1">
              {drivers.map((driver) => {
                const mine = jobs.filter((job) => assignments[job.id] === driver.id);
                return (
                  <li
                    key={driver.id}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setOverDriverId(driver.id);
                    }}
                    onDragLeave={() => setOverDriverId((current) => (current === driver.id ? null : current))}
                    onDrop={(event) => {
                      event.preventDefault();
                      assign(event.dataTransfer.getData('text/plain'), driver.id);
                    }}
                    className={cn('px-4 py-2.5 transition-colors', overDriverId === driver.id && 'bg-muted')}
                    style={overDriverId === driver.id ? { boxShadow: `inset 2px 0 0 ${accentColor}` } : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <Car className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{driver.name}</span>
                        {driver.vehicle ? <span className="block truncate text-xs text-muted-foreground">{driver.vehicle}</span> : null}
                      </span>
                      {selectedJobId && !assignments[selectedJobId] ? (
                        <Button size="xs" onClick={() => assign(selectedJobId, driver.id)}>
                          Assign
                        </Button>
                      ) : (
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">{mine.length} {mine.length === 1 ? 'job' : 'jobs'}</span>
                      )}
                    </div>
                    {mine.length ? (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {mine.map((job) => (
                          <li key={job.id} className="flex items-center gap-1 rounded-full bg-muted py-0.5 pl-2.5 pr-1 text-xs">
                            <Package className="size-3 text-muted-foreground" />
                            <span className="max-w-32 truncate">{job.title}</span>
                            <button type="button" aria-label={`Unassign ${job.title}`} onClick={() => unassign(job.id)} className="rounded-full p-0.5 hover:bg-background">
                              <X className="size-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="relative h-72 bg-muted @2xl:h-auto">
          <MapCanvas containerRef={containerRef} />
          {jobs.map((job) => {
            const assigned = Boolean(assignments[job.id]);
            const active = job.id === selectedJobId;
            return (
              <MapMarker key={job.id} map={map} position={job.position} zIndex={active ? 10 : 0}>
                <button
                  type="button"
                  aria-label={job.title}
                  onClick={() => (assigned ? undefined : selectJob(job))}
                  className={cn('flex items-center justify-center rounded-full shadow-md ring-2 ring-background transition-transform', active ? 'size-9 scale-110 text-white' : assigned ? 'size-6 bg-background text-muted-foreground' : 'size-7 bg-foreground text-background hover:scale-110')}
                  style={active ? { background: accentColor } : undefined}
                >
                  <Package className={active ? 'size-4' : 'size-3'} />
                </button>
              </MapMarker>
            );
          })}
          {drivers.map((driver) => (
            <MapMarker key={driver.id} map={map} position={driver.position} zIndex={3}>
              <span className={cn('flex size-8 items-center justify-center rounded-full bg-background shadow-md ring-2 transition-all', overDriverId === driver.id ? 'scale-125' : 'ring-foreground')} style={overDriverId === driver.id ? { boxShadow: `0 0 0 2px ${accentColor}` } : undefined}>
                <Car className="size-4" />
              </span>
            </MapMarker>
          ))}
        </div>
      </div>
    </Card>
  );
}
```
