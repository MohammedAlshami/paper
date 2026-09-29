# Timeline

What happened, what is happening, what is still to come.

A vertical list of events joined by a line. Done events are solid, the current one uses the accent colour, and upcoming ones are outlined with a dashed line. Each can carry an icon, a detail line and a time.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add 
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/timeline.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/timeline.tsx`

## Usage

```tsx
<Timeline
  events={[
    { id: 'placed', title: 'Order placed', time: '09:12' },
    { id: 'packed', title: 'Packed at Mission', detail: 'By Sam O.', time: '10:40' },
    { id: 'out', title: 'Out for delivery', state: 'current', icon: Truck, time: '11:05' },
    { id: 'delivered', title: 'Delivered', state: 'upcoming', detail: 'Estimated 12:30' },
  ]}
/>
```

## Anatomy

```tsx
import { Timeline, type TimelineEvent } from '@/components/app/timeline';

// state: 'done' (default) | 'current' | 'upcoming'. time is free text.
<Timeline events={events} />
```

## Examples

### All done

```tsx
<Timeline events={[{ id: 'a', title: 'Placed', time: 'Mon' }, { id: 'b', title: 'Delivered', time: 'Tue' }]} />
```

## API reference

#### Timeline

A list; each event is one step.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `events` | `TimelineEvent[]` | — | id, title, detail?, time?, icon? and state? for each step. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the current step. |
| `className` | `string` | — | Merged onto the root element. |

## Source

`src/components/app/timeline.tsx`

```tsx
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
```
