'use client';

import * as React from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * InlineEdit — a value that turns into a field when you click it. Enter or the tick saves, Escape or the cross
 * cancels. Works for text, numbers and a fixed list of choices, and can refuse a value with `validate`.
 */
export function InlineEdit({
  value,
  onSave,
  type = 'text',
  options,
  format,
  validate,
  placeholder = 'Empty',
  disabled = false,
  className,
}: {
  value: string | number;
  onSave: (value: string | number) => void;
  type?: 'text' | 'number' | 'select';
  /** The choices, when type is "select". */
  options?: { value: string; label: string }[];
  /** How to show the value when not editing, e.g. (n) => `$${n}`. */
  format?: (value: string | number) => React.ReactNode;
  /** Return a message to refuse the value. */
  validate?: (value: string | number) => string | undefined;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(String(value));
  const [error, setError] = React.useState<string>();

  const begin = () => {
    if (disabled) return;
    setDraft(String(value));
    setError(undefined);
    setEditing(true);
  };
  const commit = (raw = draft) => {
    const next: string | number = type === 'number' ? Number(raw) : raw;
    if (type === 'number' && (raw.trim() === '' || Number.isNaN(next))) return setError('Enter a number');
    const problem = validate?.(next);
    if (problem) return setError(problem);
    setEditing(false);
    if (next !== value) onSave(next);
  };

  if (!editing) {
    const shown = type === 'select' ? options?.find((option) => option.value === String(value))?.label ?? String(value) : format ? format(value) : String(value);
    return (
      <button
        type="button"
        onClick={begin}
        disabled={disabled}
        className={cn('group/edit inline-flex max-w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60', !disabled && 'hover:bg-muted', className)}
      >
        <span className={cn('truncate', String(value) === '' && 'text-muted-foreground')}>{String(value) === '' ? placeholder : shown}</span>
        {disabled ? null : <Pencil className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100 [@media(pointer:coarse)]:opacity-100" />}
      </button>
    );
  }

  return (
    <span className={cn('inline-flex flex-col gap-1', className)}>
      <span className="inline-flex items-center gap-1">
        {type === 'select' ? (
          <Select value={draft} onValueChange={(next) => commit(next)} defaultOpen>
            <SelectTrigger size="sm" aria-label="Choose a value">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            autoFocus
            type={type === 'number' ? 'number' : 'text'}
            value={draft}
            aria-invalid={error ? true : undefined}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(undefined);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit();
              if (event.key === 'Escape') setEditing(false);
            }}
            className="h-8 w-40"
          />
        )}
        {type === 'select' ? null : (
          <Button size="icon-sm" variant="ghost" onClick={() => commit()} aria-label="Save">
            <Check />
          </Button>
        )}
        <Button size="icon-sm" variant="ghost" onClick={() => setEditing(false)} aria-label="Cancel">
          <X />
        </Button>
      </span>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </span>
  );
}
