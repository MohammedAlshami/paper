'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Inbox, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface DataColumn<T> {
  id: string;
  header: string;
  /** What the cell shows. */
  cell: (row: T) => React.ReactNode;
  /** Give a column a sort value to make its header sortable. */
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right';
  /** Hide the column below this breakpoint. */
  hideBelow?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface DataTableFilter<T> {
  label: string;
  options: { value: string; label: string }[];
  /** Whether a row belongs to the chosen option. */
  match: (row: T, value: string) => boolean;
}

const HIDE = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' } as const;

/** DataTable — a list you can search, filter, sort, select from and page through. Generic over your row type. */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  searchText,
  searchPlaceholder = 'Search',
  filter,
  defaultSort,
  pageSize: initialPageSize = 8,
  pageSizes = [5, 8, 20],
  selectable = false,
  onSelectionChange,
  bulkActions,
  toolbar,
  onRowClick,
  loading = false,
  emptyTitle = 'Nothing here',
  emptyDescription = 'No rows match the search or filter.',
  accentColor = '#ec4899',
  className,
}: {
  rows: T[];
  columns: DataColumn<T>[];
  getRowId: (row: T) => string;
  /** Enables the search box. Return the text a row can be found by. */
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  filter?: DataTableFilter<T>;
  defaultSort?: { id: string; dir: 'asc' | 'desc' };
  pageSize?: number;
  pageSizes?: number[];
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  /** Shown in place of the toolbar while rows are selected. */
  bulkActions?: (selected: T[], clear: () => void) => React.ReactNode;
  /** Extra controls on the right of the toolbar, such as an Add button. */
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  accentColor?: string;
  className?: string;
}) {
  const [query, setQuery] = React.useState('');
  const [chosen, setChosen] = React.useState('all');
  const [sort, setSort] = React.useState(defaultSort ?? null);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [page, setPage] = React.useState(0);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const visible = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    let result = rows.filter((row) => !needle || !searchText || searchText(row).toLowerCase().includes(needle));
    if (filter && chosen !== 'all') result = result.filter((row) => filter.match(row, chosen));
    const column = columns.find((item) => item.id === sort?.id);
    if (sort && column?.sortValue) {
      const value = column.sortValue;
      result = [...result].sort((a, b) => {
        const [x, y] = [value(a), value(b)];
        const order = typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number);
        return sort.dir === 'asc' ? order : -order;
      });
    }
    return result;
  }, [rows, query, chosen, sort, columns, filter, searchText]);

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const pageRows = visible.slice(current * pageSize, current * pageSize + pageSize);
  const selected = rows.filter((row) => selectedIds.has(getRowId(row)));
  const allOnPage = pageRows.length > 0 && pageRows.every((row) => selectedIds.has(getRowId(row)));
  const someOnPage = pageRows.some((row) => selectedIds.has(getRowId(row)));

  const commit = (next: Set<string>) => {
    setSelectedIds(next);
    onSelectionChange?.(rows.filter((row) => next.has(getRowId(row))));
  };
  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    commit(next);
  };
  const togglePage = () => {
    const next = new Set(selectedIds);
    pageRows.forEach((row) => (allOnPage ? next.delete(getRowId(row)) : next.add(getRowId(row))));
    commit(next);
  };
  const reset = () => setPage(0);
  const colSpan = columns.length + (selectable ? 1 : 0);
  const first = visible.length ? current * pageSize + 1 : 0;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      {selectable && selected.length && bulkActions ? (
        <div className="flex min-h-[3.25rem] flex-wrap items-center gap-2 border-b bg-muted/50 px-3 py-2">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <div className="ml-2 flex flex-wrap items-center gap-1.5">{bulkActions(selected, () => commit(new Set()))}</div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => commit(new Set())}>
            <X /> Clear
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          {searchText ? (
            <div className="relative min-w-40 flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  reset();
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="pl-9"
              />
            </div>
          ) : null}
          {filter ? (
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={filter.label}>
              {[{ value: 'all', label: 'All' }, ...filter.options].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={chosen === option.value}
                  onClick={() => {
                    setChosen(option.value);
                    reset();
                  }}
                >
                  <Badge variant={chosen === option.value ? 'default' : 'outline'}>{option.label}</Badge>
                </button>
              ))}
            </div>
          ) : null}
          {toolbar ? <div className="ml-auto flex items-center gap-2">{toolbar}</div> : null}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {selectable ? (
              <TableHead className="w-10 pr-0">
                <Checkbox checked={allOnPage ? true : someOnPage ? 'indeterminate' : false} onCheckedChange={togglePage} aria-label="Select this page" style={{ accentColor }} />
              </TableHead>
            ) : null}
            {columns.map((column) => {
              const active = sort?.id === column.id;
              const Icon = !active ? ArrowUpDown : sort?.dir === 'asc' ? ArrowUp : ArrowDown;
              return (
                <TableHead
                  key={column.id}
                  className={cn(column.align === 'right' && 'text-right', column.hideBelow && HIDE[column.hideBelow])}
                  aria-sort={active ? (sort?.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      onClick={() => setSort((now) => ({ id: column.id, dir: now?.id === column.id && now.dir === 'asc' ? 'desc' : 'asc' }))}
                      className={cn('inline-flex items-center gap-1 font-medium', column.align === 'right' && 'flex-row-reverse')}
                    >
                      {column.header} <Icon className={cn('size-3', !active && 'text-muted-foreground/60')} />
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: Math.min(pageSize, 5) }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell colSpan={colSpan}>
                    <div className="h-5 animate-pulse rounded bg-muted" style={{ width: `${60 + ((index * 17) % 35)}%` }} />
                  </TableCell>
                </TableRow>
              ))
            : pageRows.map((row) => {
                const id = getRowId(row);
                const isSelected = selectedIds.has(id);
                return (
                  <TableRow key={id} data-state={isSelected ? 'selected' : undefined} onClick={onRowClick ? () => onRowClick(row) : undefined} className={cn(onRowClick && 'cursor-pointer')}>
                    {selectable ? (
                      <TableCell className="w-10 pr-0" onClick={(event) => event.stopPropagation()}>
                        <Checkbox checked={isSelected} onCheckedChange={() => toggle(id)} aria-label="Select row" style={{ accentColor }} />
                      </TableCell>
                    ) : null}
                    {columns.map((column) => (
                      <TableCell key={column.id} className={cn(column.align === 'right' && 'text-right', column.hideBelow && HIDE[column.hideBelow], column.className)}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          {!loading && !pageRows.length ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={colSpan} className="py-12 text-center">
                <Inbox className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-2 text-sm font-bold">{emptyTitle}</p>
                <p className="text-xs text-muted-foreground">{emptyDescription}</p>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2.5 text-xs text-muted-foreground">
        <span className="font-mono tabular-nums">
          {first}–{Math.min(visible.length, current * pageSize + pageSize)} of {visible.length}
        </span>
        <div className="flex items-center gap-3">
          <label className="hidden items-center gap-2 sm:flex">
            Rows
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                reset();
              }}
            >
              <SelectTrigger size="sm" className="w-16" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" onClick={() => setPage(current - 1)} disabled={current === 0} aria-label="Previous page">
              <ChevronLeft />
            </Button>
            <span className="min-w-14 text-center font-mono tabular-nums">
              {current + 1} / {pageCount}
            </span>
            <Button variant="outline" size="icon-sm" onClick={() => setPage(current + 1)} disabled={current >= pageCount - 1} aria-label="Next page">
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
