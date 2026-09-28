'use client';

import * as React from 'react';
import { ClipboardCheck, ShoppingCart, StickyNote, TriangleAlert, Wrench, Hammer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate, formatKm, formatMoney } from './fleet-kit';

export type TimelineEventType = 'purchase' | 'service' | 'repair' | 'inspection' | 'incident' | 'note';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  /** ISO date. */
  date: string;
  odometerKm?: number;
  cost?: number;
  detail?: string;
}

const TYPES: Record<TimelineEventType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  purchase: { label: 'Purchase', icon: ShoppingCart },
  service: { label: 'Service', icon: Wrench },
  repair: { label: 'Repair', icon: Hammer },
  inspection: { label: 'Inspection', icon: ClipboardCheck },
  incident: { label: 'Incident', icon: TriangleAlert },
  note: { label: 'Note', icon: StickyNote },
};

/** VehicleTimeline — a vehicle's life in order, newest first, grouped by year, filterable by type. */
export function VehicleTimeline({
  events,
  currency = 'USD',
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  events: TimelineEvent[];
  currency?: string;
  onSelect?: (event: TimelineEvent) => void;
  accentColor?: string;
  className?: string;
}) {
  const [filter, setFilter] = React.useState<'all' | TimelineEventType>('all');
  const [openId, setOpenId] = React.useState<string | null>(null);

  const types = React.useMemo(() => Array.from(new Set(events.map((event) => event.type))), [events]);
  const sorted = React.useMemo(
    () => events.filter((event) => filter === 'all' || event.type === filter).sort((a, b) => b.date.localeCompare(a.date)),
    [events, filter],
  );
  const years = React.useMemo(() => {
    const byYear = new Map<string, TimelineEvent[]>();
    sorted.forEach((event) => byYear.set(event.date.slice(0, 4), [...(byYear.get(event.date.slice(0, 4)) ?? []), event]));
    return Array.from(byYear.entries());
  }, [sorted]);
  const total = sorted.reduce((sum, event) => sum + (event.cost ?? 0), 0);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-center gap-1.5 border-b p-3">
        {[{ id: 'all' as const, label: 'All' }, ...types.map((type) => ({ id: type, label: TYPES[type].label }))].map((chip) => (
          <button key={chip.id} type="button" onClick={() => setFilter(chip.id)} aria-pressed={filter === chip.id}>
            <Badge variant={filter === chip.id ? 'default' : 'outline'}>{chip.label}</Badge>
          </button>
        ))}
        <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">{formatMoney(total, currency)} total</span>
      </div>

      <div className="max-h-[32rem] overflow-y-auto">
        {years.map(([year, items]) => (
          <section key={year}>
            <h4 className="sticky top-0 z-10 border-b bg-muted/80 px-4 py-1.5 font-mono text-xs tabular-nums text-muted-foreground backdrop-blur">{year}</h4>
            <ol>
              {items.map((event, index) => {
                const { icon: Icon } = TYPES[event.type];
                const open = openId === event.id;
                return (
                  <li key={event.id} className="relative">
                    {index < items.length - 1 ? <span className="absolute bottom-0 left-[2.15rem] top-10 w-px bg-border" aria-hidden /> : null}
                    <button
                      type="button"
                      onClick={() => {
                        setOpenId(open ? null : event.id);
                        onSelect?.(event);
                      }}
                      aria-expanded={event.detail ? open : undefined}
                      className={cn('flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50', open && 'bg-muted/60')}
                    >
                      <span
                        className={cn('z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ring-2 ring-card', event.type === 'incident' ? 'text-white' : 'bg-foreground text-background')}
                        style={event.type === 'incident' ? { background: accentColor } : undefined}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate text-sm font-bold">{event.title}</span>
                          {event.cost !== undefined ? <span className="shrink-0 font-mono text-xs tabular-nums">{formatMoney(event.cost, currency)}</span> : null}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {formatDate(event.date)}
                          {event.odometerKm !== undefined ? ` · ${formatKm(event.odometerKm)}` : ''}
                        </span>
                        {open && event.detail ? <span className="mt-2 block text-sm text-muted-foreground">{event.detail}</span> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
        {!years.length ? <p className="px-4 py-10 text-center text-sm text-muted-foreground">No events of this type.</p> : null}
      </div>
    </Card>
  );
}
