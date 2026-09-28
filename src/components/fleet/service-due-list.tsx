'use client';

import * as React from 'react';
import { CalendarPlus, Gauge } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { daysBetween, formatDate, formatNumber } from './fleet-kit';

export interface DueService {
  id: string;
  vehicle: string;
  service: string;
  /** Odometer reading the service is due at. */
  dueKm?: number;
  /** The vehicle's odometer now, so the distance left can be worked out. */
  currentKm?: number;
  /** ISO date the service is due by. */
  dueDate?: string;
}

type Urgency = 'overdue' | 'soon' | 'upcoming';

/** ServiceDueList — what is due or overdue across the fleet, by distance or date, most urgent first. */
export function ServiceDueList({
  items,
  today = new Date().toISOString().slice(0, 10),
  soonKm = 1500,
  soonDays = 14,
  onSchedule,
  accentColor = '#ec4899',
  className,
}: {
  items: DueService[];
  /** ISO date treated as today. */
  today?: string;
  /** Within this many kilometres of the due reading counts as "due soon". */
  soonKm?: number;
  /** Within this many days of the due date counts as "due soon". */
  soonDays?: number;
  onSchedule?: (item: DueService) => void;
  accentColor?: string;
  className?: string;
}) {
  const [filter, setFilter] = React.useState<'all' | Urgency>('all');

  const rows = React.useMemo(
    () =>
      items
        .map((item) => {
          const kmLeft = item.dueKm !== undefined && item.currentKm !== undefined ? item.dueKm - item.currentKm : undefined;
          const daysLeft = item.dueDate ? daysBetween(today, item.dueDate) : undefined;
          const overdue = (kmLeft !== undefined && kmLeft < 0) || (daysLeft !== undefined && daysLeft < 0);
          const soon = (kmLeft !== undefined && kmLeft <= soonKm) || (daysLeft !== undefined && daysLeft <= soonDays);
          const urgency: Urgency = overdue ? 'overdue' : soon ? 'soon' : 'upcoming';
          // One sortable number: how far past due, in "percent of the soon window".
          const score = Math.min(kmLeft !== undefined ? kmLeft / soonKm : Infinity, daysLeft !== undefined ? daysLeft / soonDays : Infinity);
          return { item, kmLeft, daysLeft, urgency, score };
        })
        .sort((a, b) => a.score - b.score),
    [items, today, soonKm, soonDays],
  );
  const counts = { overdue: rows.filter((row) => row.urgency === 'overdue').length, soon: rows.filter((row) => row.urgency === 'soon').length, upcoming: rows.filter((row) => row.urgency === 'upcoming').length };
  const visible = rows.filter((row) => filter === 'all' || row.urgency === filter);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-center gap-1.5 border-b p-3">
        {(
          [
            { id: 'all', label: `All ${rows.length}` },
            { id: 'overdue', label: `Overdue ${counts.overdue}` },
            { id: 'soon', label: `Due soon ${counts.soon}` },
            { id: 'upcoming', label: `Upcoming ${counts.upcoming}` },
          ] as const
        ).map((chip) => (
          <button key={chip.id} type="button" onClick={() => setFilter(chip.id)} aria-pressed={filter === chip.id}>
            <Badge variant={filter === chip.id ? 'default' : 'outline'}>{chip.label}</Badge>
          </button>
        ))}
      </div>

      <ul className="divide-y">
        {visible.map(({ item, kmLeft, daysLeft, urgency }) => (
          <li key={item.id} className="flex items-center gap-3 px-4 py-3">
            <span className="w-1 self-stretch rounded-full" style={{ background: urgency === 'overdue' ? accentColor : urgency === 'soon' ? '#2e2e2e' : 'var(--border)' }} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                <span className="font-bold">{item.service}</span> <span className="text-muted-foreground">· {item.vehicle}</span>
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                {kmLeft !== undefined ? (
                  <span className="flex items-center gap-1 font-mono tabular-nums" style={kmLeft < 0 ? { color: accentColor } : undefined}>
                    <Gauge className="size-3" />
                    {kmLeft < 0 ? `${formatNumber(-kmLeft)} km over` : `${formatNumber(kmLeft)} km left`}
                  </span>
                ) : null}
                {daysLeft !== undefined && item.dueDate ? (
                  <span style={daysLeft < 0 ? { color: accentColor } : undefined}>
                    {daysLeft < 0 ? `${-daysLeft} days over` : `${daysLeft} days left`} · {formatDate(item.dueDate, { day: 'numeric', month: 'short' })}
                  </span>
                ) : null}
              </p>
            </div>
            <Button size="sm" variant={urgency === 'overdue' ? 'default' : 'outline'} onClick={() => onSchedule?.(item)}>
              <CalendarPlus /> <span className="hidden sm:inline">Schedule</span>
            </Button>
          </li>
        ))}
        {!visible.length ? <li className="px-4 py-10 text-center text-sm text-muted-foreground">Nothing due.</li> : null}
      </ul>
    </Card>
  );
}
