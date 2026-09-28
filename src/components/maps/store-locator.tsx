'use client';

import * as React from 'react';
import { ArrowUpRight, Search, Star, Store as StoreIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { distanceKm, fitToPoints, formatDistance, MapCanvas, MapMarker, useMap, type LngLat, type MapStyle } from './map-kit';

export interface Store {
  id: string;
  name: string;
  address: string;
  category: string;
  position: LngLat;
  rating?: number;
  openNow?: boolean;
  /** Free text, e.g. "Closes 8 pm". */
  hours?: string;
}

/** StoreLocator — search and filter a list of places, with the list and the map kept in step. */
export function StoreLocator({
  stores,
  userPosition,
  selectedId: controlledId,
  onSelect,
  onDirections,
  accentColor = '#ec4899',
  mapStyle,
  className,
}: {
  stores: Store[];
  /** Where the visitor is. Adds a "you are here" dot, distances, and sorts nearest first. */
  userPosition?: LngLat;
  /** Controls the selection. Leave it out and the component keeps its own. */
  selectedId?: string | null;
  onSelect?: (store: Store) => void;
  onDirections?: (store: Store) => void;
  accentColor?: string;
  mapStyle?: MapStyle;
  className?: string;
}) {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [ownId, setOwnId] = React.useState<string | null>(null);
  const selectedId = controlledId === undefined ? ownId : controlledId;

  const categories = React.useMemo(() => Array.from(new Set(stores.map((store) => store.category))), [stores]);

  const visible = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return stores
      .filter((store) => (filter === 'all' ? true : filter === 'open' ? store.openNow : store.category === filter))
      .filter((store) => !needle || `${store.name} ${store.address} ${store.category}`.toLowerCase().includes(needle))
      .map((store) => ({ store, distance: userPosition ? distanceKm(userPosition, store.position) : undefined }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [stores, query, filter, userPosition]);

  const selected = visible.find((item) => item.store.id === selectedId);
  const { containerRef, map, ready } = useMap({ style: mapStyle, interactive: true });

  const select = (store: Store) => {
    setOwnId(store.id);
    onSelect?.(store);
  };

  const visibleKey = visible.map((item) => item.store.id).join(',');
  React.useEffect(() => {
    if (!map || !ready) return;
    const points = visible.map((item) => item.store.position);
    if (userPosition) points.push(userPosition);
    fitToPoints(map, points, { top: 48, bottom: 128, left: 48, right: 48 });
    // Refit when the visible set changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready, visibleKey]);

  React.useEffect(() => {
    if (!map || !ready || !selected) return;
    map.easeTo({ center: selected.store.position, duration: 350 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready, selectedId]);

  const chips = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open now' },
    ...categories.map((category) => ({ id: category, label: category })),
  ];

  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <div className="grid grid-cols-1 @2xl:h-[32rem] @2xl:grid-cols-[19rem_1fr]">
        <div className="flex min-h-0 min-w-0 flex-col border-b @2xl:border-b-0 @2xl:border-r">
          <div className="space-y-3 border-b p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search stores"
                aria-label="Search stores"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <button key={chip.id} type="button" onClick={() => setFilter(chip.id)} aria-pressed={filter === chip.id}>
                  <Badge variant={filter === chip.id ? 'default' : 'outline'}>{chip.label}</Badge>
                </button>
              ))}
            </div>
          </div>

          <ul className="max-h-64 divide-y overflow-y-auto @2xl:max-h-none @2xl:min-h-0 @2xl:flex-1">
            {visible.map(({ store, distance }) => (
              <li key={store.id}>
                <button
                  type="button"
                  onClick={() => select(store)}
                  aria-pressed={store.id === selectedId}
                  className={cn(
                    'flex w-full items-start gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-muted/60',
                    store.id === selectedId && 'bg-muted',
                  )}
                  style={store.id === selectedId ? { borderLeftColor: accentColor } : undefined}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{store.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {store.category} · {store.address}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-xs">
                      {store.openNow !== undefined ? (
                        <span className={store.openNow ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                          {store.openNow ? 'Open' : 'Closed'}
                        </span>
                      ) : null}
                      {store.hours ? <span className="text-muted-foreground">{store.hours}</span> : null}
                    </span>
                  </span>
                  {distance !== undefined ? (
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{formatDistance(distance)}</span>
                  ) : null}
                </button>
              </li>
            ))}
            {!visible.length ? <li className="px-4 py-10 text-center text-sm text-muted-foreground">No stores match.</li> : null}
          </ul>
        </div>

        <div className="relative h-72 bg-muted @2xl:h-auto">
          <MapCanvas containerRef={containerRef} />

          {userPosition ? (
            <MapMarker map={map} position={userPosition}>
              <span className="block size-3.5 rounded-full bg-foreground ring-4 ring-background" aria-label="You are here" />
            </MapMarker>
          ) : null}

          {visible.map(({ store }) => {
            const active = store.id === selectedId;
            return (
              <MapMarker key={store.id} map={map} position={store.position} zIndex={active ? 10 : 0}>
                <button
                  type="button"
                  onClick={() => select(store)}
                  aria-label={store.name}
                  className={cn(
                    'flex items-center justify-center rounded-full shadow-md ring-2 ring-background transition-transform',
                    active ? 'size-9 scale-110 text-white' : 'size-7 bg-foreground text-background hover:scale-110',
                  )}
                  style={active ? { background: accentColor } : undefined}
                >
                  <StoreIcon className={active ? 'size-4' : 'size-3.5'} />
                </button>
              </MapMarker>
            );
          })}

          {selected ? (
            <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-lg bg-background p-3 shadow-lg ring-1 ring-border">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{selected.store.name}</p>
                <p className="mt-0.5 flex items-center gap-2 truncate text-xs text-muted-foreground">
                  {selected.store.rating ? (
                    <span className="flex items-center gap-0.5">
                      <Star className="size-3 fill-current" style={{ color: accentColor }} />
                      {selected.store.rating.toFixed(1)}
                    </span>
                  ) : null}
                  <span className="truncate">{selected.store.address}</span>
                </p>
              </div>
              <Button size="sm" onClick={() => onDirections?.(selected.store)}>
                Directions <ArrowUpRight />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
