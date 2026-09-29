# ActivityFeed

Who did what, newest first, grouped by day.

A list of events, each with an avatar, a sentence with the subject in bold, an optional quoted line, and the time. Events are grouped under Today, Yesterday and dates, and a Show more button reveals older ones.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add avatar button card
```

Copy the file below into `src/components/app/activity-feed.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/activity-feed.tsx`, `src/components/app/app-kit.ts`

## Usage

```tsx
<ActivityFeed
  items={[
    { id: 'a1', actor: { name: 'Amara Okonkwo' }, action: 'upgraded', subject: 'Northwind to Business', at: '2026-09-29T09:42:00Z' },
    { id: 'a2', actor: { name: 'Hannah Weiss' }, action: 'commented on', subject: 'Invoice INV-2094', detail: 'Sending a new card today.', at: '2026-09-28T17:30:00Z' },
  ]}
  today="2026-09-29"
  pageSize={6}
/>
```

## Anatomy

```tsx
import { ActivityFeed, type ActivityItem } from '@/components/app/activity-feed';

// The sentence reads: <actor> <action> <subject>. Only the actor and subject are bold.
// Times are ISO strings; the day headings and the hh:mm are worked out from them (UTC).
<ActivityFeed items={items} today={new Date().toISOString()} />
```

## Examples

### Short list

```tsx
<ActivityFeed items={items.slice(0, 3)} title="Recent" />
```

## API reference

#### ActivityFeed

A card of events.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `ActivityItem[]` | — | id, actor { name, avatarUrl? }, action, subject, detail?, at (ISO). |
| `today` | `string` | `now` | ISO date treated as today, for the headings. |
| `title` | `string` | `'Activity'` | Card heading. |
| `pageSize` | `number` | `6` | How many show before Show more, and how many each press adds. |
| `onItemClick` | `(item: ActivityItem) => void` | — | Makes each event a button. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/activity-feed.tsx`

```tsx
'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { initials } from './app-kit';

export interface ActivityItem {
  id: string;
  actor: { name: string; avatarUrl?: string };
  /** The verb phrase, e.g. "commented on". */
  action: string;
  /** What it was done to. Shown in bold. */
  subject: string;
  /** An optional quote or line under the sentence. */
  detail?: string;
  /** ISO timestamp. */
  at: string;
}

const dayKey = (iso: string) => iso.slice(0, 10);

function dayLabel(key: string, today: string) {
  const diff = Math.round((Date.parse(today.slice(0, 10)) - Date.parse(key)) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return new Date(key).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
}

/** ActivityFeed — who did what, newest first, grouped by day, with a show more button. */
export function ActivityFeed({
  items,
  today = new Date().toISOString(),
  title = 'Activity',
  pageSize = 6,
  onItemClick,
  className,
}: {
  items: ActivityItem[];
  /** ISO date treated as today, for the "Today" and "Yesterday" headings. */
  today?: string;
  title?: string;
  /** How many items show before "Show more". */
  pageSize?: number;
  onItemClick?: (item: ActivityItem) => void;
  className?: string;
}) {
  const [shown, setShown] = React.useState(pageSize);
  const sorted = React.useMemo(() => [...items].sort((a, b) => b.at.localeCompare(a.at)), [items]);
  const groups = React.useMemo(() => {
    const out: { key: string; items: ActivityItem[] }[] = [];
    sorted.slice(0, shown).forEach((item) => {
      const key = dayKey(item.at);
      const last = out[out.length - 1];
      if (last?.key === key) last.items.push(item);
      else out.push({ key, items: [item] });
    });
    return out;
  }, [sorted, shown]);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-baseline justify-between gap-3 border-b px-4 py-3">
        <p className="text-sm font-bold">{title}</p>
        <p className="font-mono text-xs text-muted-foreground">{items.length} events</p>
      </div>
      <div className="divide-y">
        {groups.map((group) => (
          <section key={group.key}>
            <h3 className="bg-muted/40 px-4 py-1.5 text-xs font-medium text-muted-foreground">{dayLabel(group.key, today)}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => onItemClick?.(item)} className={cn('flex w-full items-start gap-3 px-4 py-3 text-left', onItemClick && 'transition-colors hover:bg-muted/50')}>
                    <Avatar className="size-8">
                      {item.actor.avatarUrl ? <AvatarImage src={item.actor.avatarUrl} alt="" /> : null}
                      <AvatarFallback>{initials(item.actor.name)}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm">
                        <span className="font-bold">{item.actor.name}</span> <span className="text-muted-foreground">{item.action}</span> <span className="font-bold">{item.subject}</span>
                      </span>
                      {item.detail ? <span className="mt-1 block border-l-2 pl-2.5 text-sm text-muted-foreground">{item.detail}</span> : null}
                    </span>
                    <time dateTime={item.at} className="shrink-0 pt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
                      {item.at.slice(11, 16)}
                    </time>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {shown < sorted.length ? (
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setShown((count) => count + pageSize)}>
            Show more ({sorted.length - shown})
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
```
