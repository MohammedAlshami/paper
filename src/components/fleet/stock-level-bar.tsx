'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatNumber } from './fleet-kit';

export interface StockLevel {
  id: string;
  name: string;
  onHand: number;
  min: number;
  max: number;
  /** Already ordered and on its way. */
  onOrder?: number;
}

/** StockLevelBar — stock against its limits: what is on the shelf, the reorder line, the ceiling, and what is on its way. */
export function StockLevelBar({
  items,
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  items: StockLevel[];
  onSelect?: (item: StockLevel) => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <ul className="divide-y">
        {items.map((item) => {
          const scale = Math.max(item.max, item.onHand + (item.onOrder ?? 0)) * 1.05;
          const pct = (value: number) => `${(value / scale) * 100}%`;
          const low = item.onHand <= item.min;
          const covered = low && item.onHand + (item.onOrder ?? 0) > item.min;
          return (
            <li key={item.id}>
              <button type="button" onClick={() => onSelect?.(item)} className="block w-full px-4 py-3 text-left transition-colors hover:bg-muted/50">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-bold">{item.name}</span>
                  <span className="shrink-0 text-xs" style={low && !covered ? { color: accentColor, fontWeight: 600 } : undefined}>
                    {low ? (covered ? 'Low, order arriving' : 'Reorder now') : 'In stock'}
                  </span>
                </span>
                <span className="relative mt-2.5 block h-3 rounded-full bg-muted" role="img" aria-label={`${item.onHand} on hand, reorder at ${item.min}, up to ${item.max}${item.onOrder ? `, ${item.onOrder} on order` : ''}`}>
                  <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: pct(item.onHand), background: low ? accentColor : '#2e2e2e' }} />
                  {item.onOrder ? (
                    <span
                      className="absolute inset-y-0 rounded-r-full border border-dashed border-foreground/50"
                      style={{ left: pct(item.onHand), width: pct(item.onOrder), background: 'repeating-linear-gradient(135deg, transparent 0 3px, rgba(0,0,0,0.12) 3px 5px)' }}
                    />
                  ) : null}
                  <span className="absolute -inset-y-1 w-px bg-foreground/70" style={{ left: pct(item.min) }} title={`Reorder at ${item.min}`} />
                  <span className="absolute -inset-y-1 w-px bg-foreground/30" style={{ left: pct(item.max) }} title={`Max ${item.max}`} />
                </span>
                <span className="mt-2 flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
                  <span>
                    {formatNumber(item.onHand)} on hand{item.onOrder ? ` + ${formatNumber(item.onOrder)} on order` : ''}
                  </span>
                  <span>
                    min {item.min} · max {item.max}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
