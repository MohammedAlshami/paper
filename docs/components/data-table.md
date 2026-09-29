# DataTable

A list you can search, filter, sort, select from and page through.

Generic over your row type. Describe the columns once and get a search box, filter chips, sortable headers, page-size and paging, optional row selection with a bulk-action bar, a loading skeleton and an empty state. Columns can hide below a breakpoint, and the table scrolls sideways when it must.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge button card checkbox input select table
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/data-table.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/data-table.tsx`

## Usage

```tsx
<DataTable
  rows={customers}
  columns={columns}
  getRowId={(row) => row.id}
  searchText={(row) => `${row.name} ${row.email}`}
  searchPlaceholder="Search customers"
  filter={{ label: 'Status', options: statuses, match: (row, value) => row.status === value }}
  defaultSort={{ id: 'mrr', dir: 'desc' }}
  selectable
  bulkActions={(selected, clear) => <Button onClick={() => exportRows(selected)}>Export {selected.length}</Button>}
  onRowClick={(row) => openCustomer(row.id)}
/>
```

## Anatomy

```tsx
import { DataTable, type DataColumn } from '@/components/app/data-table';

// One column: what to show, and (optionally) what to sort by.
const columns: DataColumn<Customer>[] = [
  { id: 'name', header: 'Customer', sortValue: (row) => row.name, cell: (row) => <b>{row.name}</b> },
  { id: 'mrr', header: 'MRR', align: 'right', sortValue: (row) => row.mrr, cell: (row) => `$${row.mrr}` },
  { id: 'joined', header: 'Joined', hideBelow: 'md', cell: (row) => row.joined },
];

// Sorting, searching, filtering and paging all happen in the browser. For server-side data, pass the
// current page as rows and set pageSize to its length.
<DataTable rows={rows} columns={columns} getRowId={(row) => row.id} />
```

## Examples

### Loading

```tsx
<DataTable rows={[]} columns={columns} getRowId={(row) => row.id} loading />
```

### Nothing to show

```tsx
<DataTable rows={[]} columns={columns} getRowId={(row) => row.id} emptyTitle="No customers yet" emptyDescription="Invite the first one to get started." />
```

## API reference

#### DataTable

A card with a toolbar, the table and a pager.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rows` | `T[]` | — | Every row. Filtering, sorting and paging are applied to this. |
| `columns` | `DataColumn<T>[]` | — | What to draw. See the column shape below. |
| `getRowId` | `(row: T) => string` | — | A stable id per row. Used for keys and selection. |
| `searchText` | `(row: T) => string` | — | Turns on the search box. Return the text a row can be found by. |
| `searchPlaceholder` | `string` | `'Search'` | Placeholder and label for the search box. |
| `filter` | `DataTableFilter<T>` | — | Filter chips: a label, the options, and match(row, value). |
| `defaultSort` | `{ id: string; dir: "asc" \| "desc" }` | — | The column the table starts sorted by. |
| `pageSize` | `number` | `8` | Rows per page to start with. |
| `pageSizes` | `number[]` | `[5, 8, 20]` | The choices in the Rows menu. |
| `selectable` | `boolean` | `false` | Adds a checkbox column and a select-all for the page. |
| `onSelectionChange` | `(selected: T[]) => void` | — | Fires whenever the selection changes. |
| `bulkActions` | `(selected: T[], clear: () => void) => ReactNode` | — | Replaces the toolbar while rows are selected. |
| `toolbar` | `ReactNode` | — | Extra controls on the right of the toolbar, such as an Add button. |
| `onRowClick` | `(row: T) => void` | — | Makes rows clickable. |
| `loading` | `boolean` | `false` | Draws skeleton rows instead of data. |
| `emptyTitle` | `string` | `'Nothing here'` | Heading when no rows match. |
| `emptyDescription` | `string` | — | Line under the heading. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the checkboxes. Inline styles and charts cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

#### DataColumn

One column of the table.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Unique within the table. Also what defaultSort refers to. |
| `header` | `string` | — | Header text. |
| `cell` | `(row: T) => ReactNode` | — | What the cell shows. |
| `sortValue` | `(row: T) => string \| number` | — | Gives the column a sortable header. |
| `align` | `'left' \| 'right'` | `'left'` | Right-align numbers. |
| `hideBelow` | `'sm' \| 'md' \| 'lg'` | — | Hide the column below this breakpoint. |
| `className` | `string` | — | Merged onto each cell. |

## Source

`src/components/app/data-table.tsx`

```tsx
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
```
