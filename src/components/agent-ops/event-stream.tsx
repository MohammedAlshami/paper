'use client';

import * as React from 'react';
import { ArrowDownToLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RunEvent } from './types';

const LEVELS: RunEvent['level'][] = ['info', 'warn', 'error'];

const GLYPH: Record<RunEvent['level'], string> = { info: '·', warn: '!', error: '✕' };

const VARIANT: Record<RunEvent['level'], 'secondary' | 'outline' | 'destructive'> = {
  info: 'secondary',
  warn: 'outline',
  error: 'destructive',
};

/** EventStream — the run's live log, the honest record of what happened. */
export function EventStream({ events, className }: { events: RunEvent[]; className?: string }) {
  const [active, setActive] = React.useState<RunEvent['level'][]>(LEVELS);
  const [follow, setFollow] = React.useState(true);
  const scroller = React.useRef<HTMLDivElement>(null);

  const shown = events.filter((event) => active.includes(event.level));

  React.useEffect(() => {
    if (follow && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [follow, events.length]);

  const toggle = (level: RunEvent['level']) =>
    setActive((prev) => (prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level]));

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">Events</CardTitle>
        <div className="flex flex-wrap items-center gap-1.5">
          {LEVELS.map((level) => {
            const on = active.includes(level);
            return (
              <button key={level} type="button" onClick={() => toggle(level)} aria-pressed={on}>
                <Badge variant={on ? VARIANT[level] : 'outline'} className={cn('font-mono', !on && 'opacity-50')}>
                  {GLYPH[level]} {level}
                </Badge>
              </button>
            );
          })}
          <button type="button" onClick={() => setFollow((value) => !value)} aria-pressed={follow}>
            <Badge variant={follow ? 'default' : 'outline'} className="font-mono">
              <ArrowDownToLine /> follow
            </Badge>
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div ref={scroller} className="max-h-72 overflow-y-auto border-t font-mono text-xs leading-relaxed">
          {shown.map((event) => (
            <div key={event.id} className="flex gap-3 border-b px-6 py-1.5 last:border-b-0">
              <span className="shrink-0 text-muted-foreground tabular-nums">{event.ts}</span>
              <span className={cn('w-3 shrink-0 text-center', event.level === 'info' && 'text-muted-foreground')}>
                {GLYPH[event.level]}
              </span>
              <span className="shrink-0 text-muted-foreground">{event.type}</span>
              <span className={cn('min-w-0 flex-1 truncate', event.level === 'error' && 'text-destructive')}>
                {event.message}
              </span>
              {event.stepId ? <span className="shrink-0 text-muted-foreground">{event.stepId}</span> : null}
            </div>
          ))}
          {!shown.length ? <p className="px-6 py-6 text-muted-foreground">No events at these levels.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
