'use client';

import * as React from 'react';
import { Building2, Clock, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fitToPoints, MapCanvas, MapMarker, useMap, type LngLat, type MapStyle } from './map-kit';

export interface Branch {
  id: string;
  name: string;
  /** Branches are grouped under this heading. */
  region: string;
  address: string;
  position: LngLat;
  phone?: string;
  email?: string;
  /** Free text, e.g. "Mon to Fri, 9 am to 5 pm". */
  hours?: string;
}

/** BranchDirectory — offices grouped by region, with a map and contact details for the one you pick. */
export function BranchDirectory({
  branches,
  defaultSelectedId,
  onSelect,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  branches: Branch[];
  defaultSelectedId?: string;
  onSelect?: (branch: Branch) => void;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [selectedId, setSelectedId] = React.useState(defaultSelectedId ?? null);
  const picked = React.useRef(false);
  const groups = React.useMemo(() => {
    const byRegion = new Map<string, Branch[]>();
    branches.forEach((branch) => byRegion.set(branch.region, [...(byRegion.get(branch.region) ?? []), branch]));
    return Array.from(byRegion.entries());
  }, [branches]);

  const { containerRef, map, ready } = useMap({ style: mapStyle, interactive: true });

  const select = (branch: Branch) => {
    picked.current = true;
    setSelectedId(branch.id);
    onSelect?.(branch);
  };

  React.useEffect(() => {
    if (!map || !ready) return;
    fitToPoints(map, branches.map((branch) => branch.position), 56);
  }, [map, ready, branches]);

  React.useEffect(() => {
    const selected = branches.find((branch) => branch.id === selectedId);
    if (!map || !ready || !selected || !picked.current) return;
    map.easeTo({ center: selected.position, zoom: Math.max(map.getZoom(), 8), duration: 500 });
    // Only move the camera when the selection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready, selectedId]);

  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <div className="grid grid-cols-1 @2xl:h-[32rem] @2xl:grid-cols-[21rem_1fr]">
        <div className="max-h-96 min-h-0 overflow-y-auto border-b @2xl:max-h-none @2xl:border-b-0 @2xl:border-r">
          {groups.map(([region, items]) => (
            <section key={region}>
              <h3 className="sticky top-0 z-10 border-b bg-muted/80 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground backdrop-blur">{region}</h3>
              <ul className="divide-y">
                {items.map((branch) => {
                  const active = branch.id === selectedId;
                  return (
                    <li key={branch.id}>
                      <button
                        type="button"
                        onClick={() => select(branch)}
                        aria-pressed={active}
                        className={cn('block w-full border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-muted/50', active && 'bg-muted')}
                        style={active ? { borderLeftColor: accentColor } : undefined}
                      >
                        <span className="block text-sm font-bold">{branch.name}</span>
                        <span className="block text-xs text-muted-foreground">{branch.address}</span>
                      </button>
                      {active ? (
                        <div className="space-y-2 bg-muted px-4 pb-3 pt-1 text-sm">
                          {branch.hours ? (
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="size-3.5 shrink-0" />
                              {branch.hours}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap gap-2">
                            {branch.phone ? (
                              <Button asChild size="sm" variant="outline">
                                <a href={`tel:${branch.phone.replace(/\s/g, '')}`}>
                                  <Phone /> {branch.phone}
                                </a>
                              </Button>
                            ) : null}
                            {branch.email ? (
                              <Button asChild size="sm" variant="outline">
                                <a href={`mailto:${branch.email}`}>
                                  <Mail /> Email
                                </a>
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className="relative h-72 bg-muted @2xl:h-auto">
          <MapCanvas containerRef={containerRef} />
          {branches.map((branch) => {
            const active = branch.id === selectedId;
            return (
              <MapMarker key={branch.id} map={map} position={branch.position} zIndex={active ? 10 : 0}>
                <button
                  type="button"
                  aria-label={branch.name}
                  onClick={() => select(branch)}
                  className={cn('flex items-center justify-center rounded-full shadow-md ring-2 ring-background transition-transform', active ? 'size-9 scale-110 text-white' : 'size-7 bg-foreground text-background hover:scale-110')}
                  style={active ? { background: accentColor } : undefined}
                >
                  <Building2 className={active ? 'size-4' : 'size-3.5'} />
                </button>
              </MapMarker>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
