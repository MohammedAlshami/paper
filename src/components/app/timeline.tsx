'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineEvent {
  id: string;
  title: string;
  detail?: React.ReactNode;
  /** Any text: "09:12", "Yesterday", "Due Fri". */
  time?: string;
  icon?: LucideIcon;
  /** done is drawn solid, current in the accent colour, upcoming as an outline. Defaults to done. */
  state?: 'done' | 'current' | 'upcoming';
}

/** Timeline — a vertical list of events joined by a line: what happened, what is happening, what is still to come. */
export function Timeline({
  events,
  accentColor = '#ec4899',
  className,
}: {
  events: TimelineEvent[];
  accentColor?: string;
  className?: string;
}) {
  return (
    <ol className={cn('relative', className)}>
      {events.map((event, index) => {
        const state = event.state ?? 'done';
        const last = index === events.length - 1;
        const Icon = event.icon ?? (state === 'done' ? Check : null);
        return (
          <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0" aria-current={state === 'current' ? 'step' : undefined}>
            {last ? null : (
              <span className={cn('absolute top-7 bottom-0 left-[13px] w-px', state === 'done' ? 'bg-foreground/30' : 'border-l border-dashed border-border')} aria-hidden />
            )}
            <span
              className={cn('relative z-10 mt-0.5 flex size-[27px] shrink-0 items-center justify-center rounded-full border bg-background', state === 'done' && 'border-foreground bg-foreground text-background', state === 'upcoming' && 'text-muted-foreground')}
              style={state === 'current' ? { borderColor: accentColor, color: accentColor } : undefined}
            >
              {Icon ? <Icon className="size-3.5" /> : <span className="size-1.5 rounded-full" style={{ background: state === 'current' ? accentColor : undefined }} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className={cn('text-sm', state === 'upcoming' ? 'text-muted-foreground' : 'font-medium')}>{event.title}</p>
                {event.time ? <p className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{event.time}</p> : null}
              </div>
              {event.detail ? <div className="mt-0.5 text-sm text-muted-foreground">{event.detail}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
