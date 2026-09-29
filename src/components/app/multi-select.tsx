'use client';

import * as React from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

/** MultiSelect — pick several options from a searchable list. The choices show as removable chips in the trigger. */
export function MultiSelect({
  options,
  value,
  defaultValue = [],
  onChange,
  placeholder = 'Select',
  searchPlaceholder = 'Search',
  maxChips = 3,
  defaultOpen = false,
  className,
}: {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  /** More than this many choices collapse into "+N". */
  maxChips?: number;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [inner, setInner] = React.useState(defaultValue);
  const selected = value ?? inner;
  const [query, setQuery] = React.useState('');

  const set = (next: string[]) => {
    setInner(next);
    onChange?.(next);
  };
  const toggle = (option: string) => set(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  const shown = options.filter((option) => `${option.label} ${option.description ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  const chips = selected.slice(0, maxChips).map((id) => options.find((option) => option.value === id)).filter(Boolean) as MultiSelectOption[];

  return (
    <Popover defaultOpen={defaultOpen} onOpenChange={(open) => !open && setQuery('')}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn('flex min-h-9 w-full min-w-0 items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1 text-left text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50', className)}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {selected.length === 0 ? <span className="text-muted-foreground">{placeholder}</span> : null}
            {chips.map((option) => (
              <Badge key={option.value} variant="secondary" className="gap-1 pr-1">
                {option.label}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${option.label}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(option.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      toggle(option.value);
                    }
                  }}
                  className="rounded-sm p-0.5 hover:bg-foreground/10"
                >
                  <X className="size-3" />
                </span>
              </Badge>
            ))}
            {selected.length > maxChips ? <span className="font-mono text-xs text-muted-foreground">+{selected.length - maxChips}</span> : null}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-64 p-0">
        <div className="relative border-b p-2">
          <Search className="pointer-events-none absolute top-1/2 left-4.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="h-8 pl-8" />
        </div>
        <ul className="max-h-60 overflow-y-auto p-1">
          {shown.map((option) => (
            <li key={option.value}>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-sm px-2 py-1.5 text-sm hover:bg-muted">
                <Checkbox checked={selected.includes(option.value)} onCheckedChange={() => toggle(option.value)} className="mt-0.5" />
                <span className="min-w-0">
                  <span className="block truncate">{option.label}</span>
                  {option.description ? <span className="block truncate text-xs text-muted-foreground">{option.description}</span> : null}
                </span>
              </label>
            </li>
          ))}
          {shown.length === 0 ? <li className="px-2 py-4 text-center text-sm text-muted-foreground">Nothing matches.</li> : null}
        </ul>
        {selected.length ? (
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <span>{selected.length} selected</span>
            <button type="button" className="underline underline-offset-2 hover:text-foreground" onClick={() => set([])}>
              Clear
            </button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
