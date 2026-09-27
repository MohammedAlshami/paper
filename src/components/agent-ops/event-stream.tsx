'use client';

import * as React from 'react';
import { ArrowDownToLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/internal/card';
import type { RunEvent } from './types';

const levels: RunEvent['level'][] = ['info', 'warn', 'error'];

const glyph: Record<RunEvent['level'], string> = { info: '·', warn: '!', error: '✕' };

/** EventStream — the run's live log. The honest record of what happened. */
export function EventStream({ events, className }: { events: RunEvent[]; className?: string }) {
  const [active, setActive] = React.useState<RunEvent['level'][]>(levels);
  const [follow, setFollow] = React.useState(true);
  const scroller = React.useRef<HTMLDivElement>(null);

  const shown = events.filter((event) => active.includes(event.level));

  React.useEffect(() => {
    if (follow && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [follow, events.length]);

  const toggle = (level: RunEvent['level']) =>
    setActive((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]));

  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <h4 className="text-sm font-medium text-foreground">Events</h4>
        <div className="flex items-center gap-1">
          {levels.map((level) => {
            const on = active.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => toggle(level)}
                aria-pressed={on}
                className={cn(
                  'rounded-paper px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors',
                  on ? 'bg-primary text-primary-foreground' : 'text-faint hover:bg-muted hover:text-foreground',
                )}
              >
                {glyph[level]} {level}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setFollow((v) => !v)}
            aria-pressed={follow}
            className={cn(
              'ml-1 inline-flex items-center gap-1 rounded-paper px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors',
              follow ? 'text-foreground' : 'text-faint hover:text-foreground',
            )}
          >
            <ArrowDownToLine className="size-3" /> follow
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="max-h-72 overflow-y-auto border-t border-border bg-card font-mono text-[11.5px] leading-relaxed"
      >
        {shown.map((event) => (
          <div key={event.id} className="flex gap-3 border-b border-border/60 px-4 py-1.5 last:border-b-0">
            <span className="tabular shrink-0 text-faint">{event.ts}</span>
            <span className={cn('shrink-0 w-3 text-center', event.level === 'info' ? 'text-faint' : 'text-foreground')}>
              {glyph[event.level]}
            </span>
            <span className="shrink-0 text-faint">{event.type}</span>
            <span className={cn('min-w-0 flex-1 truncate', event.level === 'info' ? 'text-muted-foreground' : 'text-foreground')}>
              {event.message}
            </span>
            {event.stepId ? <span className="shrink-0 text-faint">{event.stepId}</span> : null}
          </div>
        ))}
        {!shown.length ? <p className="px-4 py-6 text-faint">No events at these levels.</p> : null}
      </div>
    </Card>
  );
}
