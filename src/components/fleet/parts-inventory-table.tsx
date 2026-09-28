'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatMoney, formatNumber } from './fleet-kit';

export interface Part {
  sku: string;
  name: string;
  category: string;
  /** Shelf or bin location, e.g. "A-04-2". */
  bin: string;
  onHand: number;
  /** Reorder when stock falls to this. */
  min: number;
  unitCost: number;
  supplier?: string;
}

type SortKey = 'name' | 'onHand' | 'unitCost' | 'value';

/** PartsInventoryTable — every part in stock: search, filter by category, sort any column, low stock flagged. */
export function PartsInventoryTable({
  parts,
  currency = 'USD',
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  parts: Part[];
  currency?: string;
  onSelect?: (part: Part) => void;
  accentColor?: string;
  className?: string;
}) {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('all');
  const [lowOnly, setLowOnly] = React.useState(false);
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' });

  const categories = React.useMemo(() => Array.from(new Set(parts.map((part) => part.category))).sort(), [parts]);
  const rows = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    const value = (part: Part) => ({ name: part.name, onHand: part.onHand, unitCost: part.unitCost, value: part.onHand * part.unitCost })[sort.key];
    return parts
      .filter((part) => category === 'all' || part.category === category)
      .filter((part) => !lowOnly || part.onHand <= part.min)
      .filter((part) => !needle || `${part.sku} ${part.name} ${part.bin}`.toLowerCase().includes(needle))
      .sort((a, b) => {
        const [x, y] = [value(a), value(b)];
        const result = typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number);
        return sort.dir === 'asc' ? result : -result;
      });
  }, [parts, query, category, lowOnly, sort]);

  const lowCount = parts.filter((part) => part.onHand <= part.min).length;
  const stockValue = rows.reduce((sum, part) => sum + part.onHand * part.unitCost, 0);

  const header = (key: SortKey, label: string, align: 'left' | 'right' = 'left') => {
    const active = sort.key === key;
    const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
    return (
      <TableHead className={align === 'right' ? 'text-right' : undefined} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button type="button" onClick={() => setSort((current) => ({ key, dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc' }))} className={cn('inline-flex items-center gap-1 font-medium', align === 'right' && 'flex-row-reverse')}>
          {label} <Icon className={cn('size-3', !active && 'text-muted-foreground/60')} />
        </button>
      </TableHead>
    );
  };

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="space-y-3 border-b p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by SKU, name or bin" aria-label="Search parts" className="pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', ...categories].map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item}>
              <Badge variant={category === item ? 'default' : 'outline'} className="capitalize">
                {item}
              </Badge>
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={lowOnly} onChange={(event) => setLowOnly(event.target.checked)} className="size-3.5" style={{ accentColor }} />
            Low stock only ({lowCount})
          </label>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {header('name', 'Part')}
            <TableHead className="hidden sm:table-cell">Bin</TableHead>
            {header('onHand', 'On hand', 'right')}
            {header('unitCost', 'Unit cost', 'right')}
            <TableHead className="hidden text-right md:table-cell">
              <button type="button" onClick={() => setSort((current) => ({ key: 'value', dir: current.key === 'value' && current.dir === 'asc' ? 'desc' : 'asc' }))} className="inline-flex items-center gap-1 font-medium">
                Value
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((part) => {
            const low = part.onHand <= part.min;
            return (
              <TableRow key={part.sku} onClick={() => onSelect?.(part)} className="cursor-pointer">
                <TableCell className="whitespace-normal">
                  <span className="block text-sm font-bold">{part.name}</span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    {part.sku} · <span className="sm:hidden">{part.bin}</span>
                    <span className="hidden sm:inline">{part.category}</span>
                  </span>
                </TableCell>
                <TableCell className="hidden font-mono text-xs sm:table-cell">{part.bin}</TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-sm font-semibold tabular-nums" style={low ? { color: accentColor } : undefined}>
                    {formatNumber(part.onHand)}
                  </span>
                  {low ? <span className="block text-[11px] text-muted-foreground">min {part.min}</span> : null}
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">{formatMoney(part.unitCost, currency, 2)}</TableCell>
                <TableCell className="hidden text-right font-mono text-sm tabular-nums md:table-cell">{formatMoney(part.onHand * part.unitCost, currency)}</TableCell>
              </TableRow>
            );
          })}
          {!rows.length ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                No parts match.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <p className="flex justify-between border-t px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">
        <span>{rows.length} parts</span>
        <span>{formatMoney(stockValue, currency)} in stock</span>
      </p>
    </Card>
  );
}
