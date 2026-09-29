'use client';

import * as React from 'react';
import { CornerDownLeft, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Command {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Extra words that should match, e.g. "billing" for "Invoices". */
  keywords?: string[];
  /** A keyboard hint shown on the right, e.g. "G D". */
  shortcut?: string;
}

export interface CommandGroup {
  heading: string;
  commands: Command[];
}

/**
 * CommandPalette — Cmd-K. A search box over grouped commands with arrow-key selection. Use it as a dialog (open,
 * onOpenChange; the shortcut toggles it) or set `inline` to draw the panel in place, for a page or a docs example.
 */
export function CommandPalette({
  groups,
  onSelect,
  open,
  onOpenChange,
  inline = false,
  hotkey = true,
  placeholder = 'Type a command or search',
  accentColor = '#ec4899',
  className,
}: {
  groups: CommandGroup[];
  onSelect?: (command: Command) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  inline?: boolean;
  /** Toggle on Cmd-K or Ctrl-K. */
  hotkey?: boolean;
  placeholder?: string;
  accentColor?: string;
  className?: string;
}) {
  React.useEffect(() => {
    if (!hotkey || inline || !onOpenChange) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkey, inline, onOpenChange, open]);

  const panel = (
    <Panel groups={groups} placeholder={placeholder} accentColor={accentColor} onSelect={(command) => { onSelect?.(command); onOpenChange?.(false); }} />
  );

  if (inline) return <Card className={cn('gap-0 overflow-hidden py-0', className)}>{panel}</Card>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('gap-0 overflow-hidden p-0 sm:max-w-xl [&>button]:hidden', className)}>
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">Search for a command and press enter to run it.</DialogDescription>
        {panel}
      </DialogContent>
    </Dialog>
  );
}

function Panel({ groups, placeholder, accentColor, onSelect }: { groups: CommandGroup[]; placeholder: string; accentColor: string; onSelect: (command: Command) => void }) {
  const [query, setQuery] = React.useState('');
  const [index, setIndex] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  const visible = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return groups
      .map((group) => ({ ...group, commands: group.commands.filter((command) => !needle || [command.label, ...(command.keywords ?? [])].some((text) => text.toLowerCase().includes(needle))) }))
      .filter((group) => group.commands.length);
  }, [groups, query]);
  const flat = visible.flatMap((group) => group.commands);

  React.useEffect(() => setIndex(0), [query]);
  React.useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!flat.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIndex((current) => (current + 1) % flat.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIndex((current) => (current - 1 + flat.length) % flat.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      onSelect(flat[index]);
    }
  };

  return (
    <div onKeyDown={onKeyDown}>
      <div className="flex items-center gap-2 border-b px-4">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label="Search commands"
          role="combobox"
          aria-expanded
          aria-controls="command-list"
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-muted-foreground sm:block">esc</kbd>
      </div>
      <div ref={listRef} id="command-list" role="listbox" className="max-h-80 overflow-y-auto p-2">
        {flat.length === 0 ? <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nothing matches “{query}”.</p> : null}
        {visible.map((group) => (
          <div key={group.heading} className="pb-1">
            <p className="px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{group.heading}</p>
            {group.commands.map((command) => {
              const position = flat.indexOf(command);
              const active = position === index;
              return (
                <button
                  key={command.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  data-active={active}
                  onMouseMove={() => setIndex(position)}
                  onClick={() => onSelect(command)}
                  className={cn('relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors', active ? 'bg-muted' : '')}
                >
                  <span className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full" style={{ background: accentColor, opacity: active ? 1 : 0 }} aria-hidden />
                  {command.icon ? <command.icon className="size-4 shrink-0 text-muted-foreground" /> : null}
                  <span className="min-w-0 flex-1 truncate">{command.label}</span>
                  {command.shortcut ? <span className="font-mono text-xs text-muted-foreground">{command.shortcut}</span> : null}
                  {active && !command.shortcut ? <CornerDownLeft className="size-3.5 text-muted-foreground" /> : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
