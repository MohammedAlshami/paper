'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatNumber } from './fleet-kit';

export interface Tire {
  /** Where it sits: 1 is the front axle. */
  axle: number;
  side: 'left' | 'right';
  /** Free text label, e.g. "FL", or "RL outer". */
  position: string;
  treadMm: number;
  pressureKpa: number;
  targetKpa: number;
  ageMonths: number;
  /** Odometer reading a rotation is due at, if any. */
  rotateAtKm?: number;
}

type Health = 'ok' | 'watch' | 'replace';

function health(tire: Tire, minTreadMm: number): Health {
  if (tire.treadMm <= minTreadMm + 0.5) return 'replace';
  if (tire.treadMm <= minTreadMm + 2 || Math.abs(tire.pressureKpa - tire.targetKpa) / tire.targetKpa > 0.1) return 'watch';
  return 'ok';
}

/** TireStatusGrid — every tyre where it sits on the vehicle, with tread, pressure and age, and which need attention. */
export function TireStatusGrid({
  vehicle,
  odometerKm,
  tires,
  minTreadMm = 1.6,
  newTreadMm = 8,
  accentColor = '#ec4899',
  className,
}: {
  vehicle: string;
  odometerKm: number;
  tires: Tire[];
  /** Legal minimum tread depth. Tyres at or near it are marked "replace". */
  minTreadMm?: number;
  /** Depth of a new tyre, for the tread bar. */
  newTreadMm?: number;
  accentColor?: string;
  className?: string;
}) {
  const [selected, setSelected] = React.useState<Tire | null>(null);
  const axles = Array.from(new Set(tires.map((tire) => tire.axle))).sort((a, b) => a - b);
  const flagged = tires.filter((tire) => health(tire, minTreadMm) !== 'ok').length;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-baseline justify-between gap-3 border-b px-4 py-3">
        <p className="text-sm font-bold">{vehicle}</p>
        <p className="text-xs text-muted-foreground">{flagged ? `${flagged} ${flagged === 1 ? 'tyre needs' : 'tyres need'} attention` : 'All tyres fine'}</p>
      </div>

      <div className="space-y-3 p-4">
        {axles.map((axle) => (
          <div key={axle} className="grid grid-cols-[1fr_1.25rem_1fr] items-stretch gap-2">
            {(['left', 'right'] as const).flatMap((side, index) => {
              const cell = tires.find((tire) => tire.axle === axle && tire.side === side);
              const node = cell ? (
                <button
                  key={`${axle}-${side}`}
                  type="button"
                  onClick={() => setSelected(selected === cell ? null : cell)}
                  aria-pressed={selected === cell}
                  className={cn('rounded-lg border p-2.5 text-left transition-colors hover:bg-muted/60', selected === cell && 'bg-muted')}
                  style={selected === cell ? { boxShadow: `inset 0 0 0 1.5px ${accentColor}` } : undefined}
                >
                  <TireCell tire={cell} status={health(cell, minTreadMm)} newTreadMm={newTreadMm} accentColor={accentColor} />
                </button>
              ) : (
                <span key={`${axle}-${side}`} />
              );
              return index === 0 ? [node, <span key={`${axle}-axle`} className="self-center border-t-2 border-dashed border-foreground/25" aria-hidden />] : [node];
            })}
          </div>
        ))}
      </div>

      {selected ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t bg-muted/40 px-4 py-3 text-sm sm:grid-cols-4">
          {[
            { label: 'Position', value: selected.position },
            { label: 'Tread', value: `${selected.treadMm.toFixed(1)} mm` },
            { label: 'Pressure', value: `${selected.pressureKpa} / ${selected.targetKpa} kPa` },
            { label: 'Age', value: `${Math.floor(selected.ageMonths / 12)}y ${selected.ageMonths % 12}m` },
            ...(selected.rotateAtKm !== undefined ? [{ label: selected.rotateAtKm <= odometerKm ? 'Rotation overdue since' : 'Rotate at', value: formatNumber(selected.rotateAtKm) + ' km' }] : []),
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-[11px] text-muted-foreground">{item.label}</dt>
              <dd className="font-mono tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">Tap a tyre for its detail.</p>
      )}
    </Card>
  );
}

function TireCell({ tire, status, newTreadMm, accentColor }: { tire: Tire; status: Health; newTreadMm: number; accentColor: string }) {
  const pressureLow = tire.pressureKpa < tire.targetKpa * 0.9;
  return (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold">{tire.position}</span>
        <span className="text-[11px]" style={status === 'replace' ? { color: accentColor, fontWeight: 600 } : undefined}>
          {status === 'replace' ? 'Replace' : status === 'watch' ? 'Watch' : 'OK'}
        </span>
      </span>
      <span className="mt-2 block font-mono text-lg font-semibold tabular-nums leading-none">
        {tire.treadMm.toFixed(1)}
        <span className="ml-0.5 text-xs font-normal text-muted-foreground">mm</span>
      </span>
      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted">
        <span className="block h-full rounded-full" style={{ width: `${Math.min(100, (tire.treadMm / newTreadMm) * 100)}%`, background: status === 'ok' ? '#2e2e2e' : accentColor }} />
      </span>
      <span className="mt-1.5 block font-mono text-[11px] tabular-nums text-muted-foreground" style={pressureLow ? { color: accentColor } : undefined}>
        {tire.pressureKpa} kPa{pressureLow ? ' · low' : ''}
      </span>
    </>
  );
}
