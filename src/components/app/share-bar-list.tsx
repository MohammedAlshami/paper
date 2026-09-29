'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatMoney } from './app-kit';

export interface ShareItem {
  id: string;
  label: string;
  value: number;
  /** A line under the label, e.g. "1,240 orders". */
  detail?: string;
}

/**
 * ShareBarList — how a whole splits into parts: each part as a bar, its value and its share of the total. The biggest
 * parts use the accent colour. Good for revenue by store, orders by channel, spend by category.
 */
export function ShareBarList({
  items,
  title = 'Share',
  description,
  formatValue = (value) => formatMoney(value),
  highlight = 1,
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  items: ShareItem[];
  title?: string;
  description?: string;
  /** How a value is written. */
  formatValue?: (value: number) => string;
  /** How many of the biggest parts are drawn in the accent colour. */
  highlight?: number;
  onSelect?: (item: ShareItem) => void;
  accentColor?: string;
  className?: string;
}) {
  const sorted = React.useMemo(() => [...items].sort((a, b) => b.value - a.value), [items]);
  const total = sorted.reduce((sum, item) => sum + item.value, 0) || 1;
  const max = sorted[0]?.value || 1;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-baseline justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-bold">{title}</p>
          {description ? <p className="truncate text-xs text-muted-foreground">{description}</p> : null}
        </div>
        <p className="shrink-0 font-mono text-sm font-semibold tabular-nums">{formatValue(total)}</p>
      </div>
      <ol className="divide-y">
        {sorted.map((item, index) => {
          const share = (item.value / total) * 100;
          const top = index < highlight;
          return (
            <li key={item.id}>
              <button type="button" onClick={() => onSelect?.(item)} className={cn('block w-full px-4 py-3 text-left', onSelect && 'transition-colors hover:bg-muted/50')}>
                <span className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{item.label}</span>
                    {item.detail ? <span className="block truncate text-xs text-muted-foreground">{item.detail}</span> : null}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-sm font-semibold tabular-nums" style={top ? { color: accentColor } : undefined}>
                      {formatValue(item.value)}
                    </span>
                    <span className="block font-mono text-xs tabular-nums text-muted-foreground">{share.toFixed(1)}%</span>
                  </span>
                </span>
                <span className="mt-2 block h-1.5 rounded-full bg-muted" role="img" aria-label={`${item.label} ${share.toFixed(0)} percent`}>
                  <span className="block h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, background: top ? accentColor : '#2e2e2e' }} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
