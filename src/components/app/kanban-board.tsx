'use client';

import * as React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface KanbanColumn {
  id: string;
  title: string;
  /** A small note under the title, e.g. "Waiting for a picker". */
  hint?: string;
}

/**
 * KanbanBoard — columns of cards you can drag from one column to the next. On a phone (no drag) every card has a
 * Move menu instead. It is generic: you say how to find an item's id and column and how to draw a card, and it
 * calls onMove; keeping the items is up to you.
 */
export function KanbanBoard<T>({
  columns,
  items,
  getId,
  getColumn,
  renderCard,
  onMove,
  onCardClick,
  emptyText = 'Nothing here',
  columnWidth = 'w-72',
  accentColor = '#ec4899',
  className,
}: {
  columns: KanbanColumn[];
  items: T[];
  getId: (item: T) => string;
  getColumn: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onMove?: (item: T, toColumnId: string) => void;
  onCardClick?: (item: T) => void;
  emptyText?: string;
  /** A Tailwind width class for each column. */
  columnWidth?: string;
  accentColor?: string;
  className?: string;
}) {
  const [dragging, setDragging] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<string | null>(null);

  const drop = (columnId: string) => {
    const item = items.find((candidate) => getId(candidate) === dragging);
    setDragging(null);
    setOver(null);
    if (item && getColumn(item) !== columnId) onMove?.(item, columnId);
  };

  return (
    <div className={cn('relative flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2', className)}>
      {columns.map((column) => {
        const cards = items.filter((item) => getColumn(item) === column.id);
        const isOver = over === column.id && dragging;
        return (
          <section
            key={column.id}
            aria-label={column.title}
            onDragOver={(event) => {
              if (!dragging) return;
              event.preventDefault();
              setOver(column.id);
            }}
            onDragLeave={() => setOver((current) => (current === column.id ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              drop(column.id);
            }}
            className={cn('flex shrink-0 snap-start flex-col rounded-lg border bg-muted/40 transition-colors', columnWidth, isOver && 'bg-muted')}
            style={isOver ? { borderColor: accentColor } : undefined}
          >
            <header className="flex items-baseline justify-between gap-2 px-3 py-2.5">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold">{column.title}</h3>
                {column.hint ? <p className="truncate text-xs text-muted-foreground">{column.hint}</p> : null}
              </div>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{cards.length}</span>
            </header>
            <ul className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
              {cards.map((item) => {
                const id = getId(item);
                return (
                  <li key={id} className="group/card relative">
                    <div
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', id);
                        setDragging(id);
                      }}
                      onDragEnd={() => {
                        setDragging(null);
                        setOver(null);
                      }}
                      onClick={() => onCardClick?.(item)}
                      className={cn('rounded-md border bg-card p-3 transition-opacity', onCardClick ? 'cursor-pointer' : 'cursor-grab', dragging === id && 'opacity-40')}
                    >
                      {renderCard(item)}
                    </div>
                    {onMove ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label="Move to another column"
                            onClick={(event) => event.stopPropagation()}
                            className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-md border bg-background text-muted-foreground opacity-0 transition-opacity outline-none group-hover/card:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/60 [@media(pointer:coarse)]:opacity-100"
                          >
                            <ArrowRightLeft className="size-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Move to</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {columns
                            .filter((target) => target.id !== column.id)
                            .map((target) => (
                              <DropdownMenuItem key={target.id} onSelect={() => onMove(item, target.id)}>
                                {target.title}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </li>
                );
              })}
              {cards.length === 0 ? <li className="flex flex-1 items-center justify-center rounded-md border border-dashed py-6 text-xs text-muted-foreground">{emptyText}</li> : null}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
