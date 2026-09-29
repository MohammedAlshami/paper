# FilterBar

The strip above a list: views, search and filters in one place.

Saved views as tabs with counts, a search box, one select per filter, and a Clear button that appears when anything is set. It is fully controlled and never filters anything itself; it only reports what the person asked for.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button input select
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/filter-bar.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/filter-bar.tsx`

## Usage

```tsx
const [view, setView] = useState('all');
const [search, setSearch] = useState('');
const [filters, setFilters] = useState<Record<string, string | undefined>>({});

<FilterBar
  views={[{ id: 'all', label: 'All', count: 62 }, { id: 'late', label: 'Late', count: 4 }]}
  activeView={view}
  onViewChange={setView}
  search={search}
  onSearchChange={setSearch}
  searchPlaceholder="Search orders"
  filters={[{ id: 'store', label: 'Store', options: [{ value: 'mission', label: 'Mission' }, { value: 'sunset', label: 'Sunset' }] }]}
  values={filters}
  onFilterChange={(id, value) => setFilters((current) => ({ ...current, [id]: value }))}
  onClear={() => { setSearch(''); setFilters({}); }}
  trailing={<DateRangePicker onChange={setRange} />}
/>
```

## Anatomy

```tsx
import { FilterBar, type FilterDefinition, type SavedView } from '@/components/app/filter-bar';

// Filter the rows yourself from view, search and the values; the bar only holds the controls.
<FilterBar views={views} activeView={view} search={search} filters={defs} values={values} />
```

## Examples

### Filters only

```tsx
<FilterBar filters={defs} values={values} onFilterChange={setFilter} onClear={clear} />
```

## API reference

#### FilterBar

Controlled. A missing or empty filter value means "all".

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `views` | `SavedView[]` | — | Tabs along the top: id, label and an optional count. |
| `activeView` | `string` | — | The id of the selected view. |
| `onViewChange` | `(id: string) => void` | — | Called when a view tab is chosen. |
| `search` | `string` | — | The search text. |
| `onSearchChange` | `(value: string) => void` | — | Shows the search box when given. |
| `searchPlaceholder` | `string` | `'Search'` | Placeholder and accessible label of the search box. |
| `filters` | `FilterDefinition[]` | — | One select each: id, label and options. |
| `values` | `Record<string, string \| undefined>` | — | The chosen value per filter id. |
| `onFilterChange` | `(id, value) => void` | — | Value is undefined for "All". |
| `onClear` | `() => void` | — | Called by the Clear button, which shows once a filter or the search is set. |
| `trailing` | `ReactNode` | — | Extra controls on the right, such as a date range. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the active view marker. |
| `className` | `string` | — | Merged onto the root element. |

## Source

`src/components/app/filter-bar.tsx`

```tsx
'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDefinition {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface SavedView {
  id: string;
  label: string;
  count?: number;
}

const ALL = '__all__';

/**
 * FilterBar — the strip above a list: saved views as tabs, a search box, one select per filter, and a Clear button
 * that appears when anything is set. Fully controlled; it never filters anything itself, it only tells you what
 * the person asked for.
 */
export function FilterBar({
  views,
  activeView,
  onViewChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Search',
  filters = [],
  values = {},
  onFilterChange,
  onClear,
  trailing,
  accentColor = '#ec4899',
  className,
}: {
  views?: SavedView[];
  activeView?: string;
  onViewChange?: (id: string) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDefinition[];
  /** Selected value per filter id. Missing or empty means "all". */
  values?: Record<string, string | undefined>;
  onFilterChange?: (id: string, value: string | undefined) => void;
  /** Called by the Clear button; also clear your search there. */
  onClear?: () => void;
  /** Extra controls on the right, e.g. a DateRangePicker or an export button. */
  trailing?: React.ReactNode;
  accentColor?: string;
  className?: string;
}) {
  const active = filters.filter((filter) => values[filter.id]).length + (search ? 1 : 0);
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {views?.length ? (
        <div role="tablist" aria-label="Saved views" className="-mb-px flex gap-1 overflow-x-auto border-b">
          {views.map((view) => {
            const selected = view.id === activeView;
            return (
              <button
                key={view.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onViewChange?.(view.id)}
                className={cn('relative flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm transition-colors', selected ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground')}
              >
                {view.label}
                {view.count !== undefined ? <span className="font-mono text-xs tabular-nums text-muted-foreground">{view.count}</span> : null}
                <span className={cn('absolute inset-x-2 -bottom-px h-0.5 rounded-full', selected ? 'opacity-100' : 'opacity-0')} style={{ background: accentColor }} aria-hidden />
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {onSearchChange ? (
          <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search ?? ''} onChange={(event) => onSearchChange(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="pl-8" />
          </div>
        ) : null}
        {filters.map((filter) => (
          <Select key={filter.id} value={values[filter.id] ?? ALL} onValueChange={(next) => onFilterChange?.(filter.id, next === ALL ? undefined : next)}>
            <SelectTrigger aria-label={filter.label} className={cn('min-w-[8rem]', values[filter.id] && 'border-foreground/40')}>
              <span className="text-muted-foreground">{filter.label}:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {active ? (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
            <X /> Clear {active > 1 ? `${active} filters` : 'filter'}
          </Button>
        ) : null}
        {trailing ? <div className="ml-auto flex items-center gap-2">{trailing}</div> : null}
      </div>
    </div>
  );
}
```
