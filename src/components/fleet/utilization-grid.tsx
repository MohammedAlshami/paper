'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate } from './fleet-kit';

export type DayState = 'used' | 'idle' | 'shop' | 'off';

export interface UtilizationRow {
  vehicle: string;
  /** One state per day, oldest first. All rows must be the same length. */
  days: DayState[];
}

const STATES: { id: DayState; label: string }[] = [
  { id: 'used', label: 'In use' },
  { id: 'idle', label: 'Idle' },
  { id: 'shop', label: 'In the shop' },
  { id: 'off', label: 'Off duty' },
];

/** UtilizationGrid — vehicles down the side, days across the top: which were working, which sat idle, which were in the workshop. */
export function UtilizationGrid({
  rows,
  /** ISO date of the last column. */
  endDate,
  accentColor = '#ec4899',
  className,
}: {
  rows: UtilizationRow[];
  endDate: string;
  accentColor?: string;
  className?: string;
}) {
  const [hover, setHover] = React.useState<{ vehicle: string; index: number } | null>(null);
  const length = rows[0]?.days.length ?? 0;
  const dateAt = (index: number) => {
    const date = new Date(`${endDate}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - (length - 1 - index));
    return date.toISOString().slice(0, 10);
  };
  const tone: Record<DayState, React.CSSProperties> = {
    used: { background: '#2e2e2e' },
    idle: { background: '#d4d4d4' },
    shop: { background: accentColor },
    off: { background: 'transparent', boxShadow: 'inset 0 0 0 1px var(--border)' },
  };

  const totals = STATES.map((state) => ({ ...state, count: rows.reduce((sum, row) => sum + row.days.filter((day) => day === state.id).length, 0) }));
  const workable = rows.reduce((sum, row) => sum + row.days.filter((day) => day !== 'off').length, 0);
  const usedPct = Math.round((totals[0].count / Math.max(1, workable)) * 100);
  const hovered = hover ? rows.find((row) => row.vehicle === hover.vehicle)?.days[hover.index] : undefined;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-sm font-bold">Last {length} days</p>
          <p className="font-mono text-xs tabular-nums text-muted-foreground">{usedPct}% of available days in use</p>
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-1" aria-label="Legend">
          {STATES.map((state) => (
            <li key={state.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-3 rounded-sm" style={tone[state.id]} /> {state.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1 px-4 py-2 text-left">
          <thead className="sr-only">
            <tr>
              <th>Vehicle</th>
              <th>Days</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const used = row.days.filter((day) => day === 'used').length;
              const avail = row.days.filter((day) => day !== 'off').length;
              return (
                <tr key={row.vehicle}>
                  <th scope="row" className="sticky left-0 z-10 w-24 whitespace-nowrap bg-card py-0.5 pl-4 pr-3 text-sm font-medium">
                    {row.vehicle}
                  </th>
                  <td className="py-0.5">
                    <div className="flex gap-[3px]">
                      {row.days.map((day, index) => (
                        <span
                          key={index}
                          role="img"
                          aria-label={`${row.vehicle}, ${formatDate(dateAt(index), { day: 'numeric', month: 'short' })}: ${STATES.find((state) => state.id === day)?.label}`}
                          onMouseEnter={() => setHover({ vehicle: row.vehicle, index })}
                          onMouseLeave={() => setHover(null)}
                          className="h-6 min-w-2.5 flex-1 rounded-[3px]"
                          style={{ ...tone[day], opacity: hover && hover.vehicle === row.vehicle && hover.index !== index ? 0.55 : 1 }}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="w-14 py-0.5 pl-3 pr-4 text-right font-mono text-xs tabular-nums text-muted-foreground">{Math.round((used / Math.max(1, avail)) * 100)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="min-h-9 border-t px-4 py-2.5 text-xs text-muted-foreground">
        {hover && hovered ? (
          <>
            <span className="font-bold text-foreground">{hover.vehicle}</span> · {formatDate(dateAt(hover.index), { weekday: 'short', day: 'numeric', month: 'short' })} · {STATES.find((state) => state.id === hovered)?.label}
          </>
        ) : (
          'Hover a day for the detail.'
        )}
      </p>
    </Card>
  );
}
