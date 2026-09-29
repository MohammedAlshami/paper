# NotificationPreferences

What to be told about, and where.

Rows grouped by topic, with one switch per channel. The value is a flat record keyed itemId.channelId. On a phone the channel names move into each row so the columns still read.

**Category:** Authentication and account · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card switch
```

Copy the file below into `src/components/app/notification-preferences.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<NotificationPreferences
  channels={[{ id: 'email', label: 'Email' }, { id: 'push', label: 'Push' }]}
  groups={[{ id: 'work', title: 'Work', items: [{ id: 'assigned', label: 'A work order is assigned to me' }] }]}
  defaultValue={{ 'assigned.email': true }}
  onChange={(value) => api.savePreferences(value)}
/>
```

## Anatomy

```tsx
import { NotificationPreferences, preferenceKey } from '@/components/app/notification-preferences';

// value['assigned.email'] === true. preferenceKey('assigned', 'email') builds the key.
// onChange fires after every toggle with the whole record, so it suits an autosave.
<NotificationPreferences groups={groups} channels={channels} onChange={save} />
```

## Examples

### One channel

```tsx
<NotificationPreferences channels={[{ id: 'email', label: 'Email' }]} groups={groups} />
```

## API reference

#### NotificationPreferences

A matrix of switches.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `groups` | `NotificationGroup[]` | — | id, title and items (id, label, description) for each topic. |
| `channels` | `NotificationChannel[]` | — | id and label for each column. |
| `defaultValue` | `Record<string, boolean>` | `{}` | Which switches start on. |
| `onChange` | `(value: Record<string, boolean>) => void` | — | Called after every toggle. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/notification-preferences.tsx`

```tsx
'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface NotificationChannel {
  id: string;
  label: string;
}

export interface NotificationItem {
  id: string;
  label: string;
  description?: string;
}

export interface NotificationGroup {
  id: string;
  title: string;
  items: NotificationItem[];
}

/** The key of one switch in the value: `${item id}.${channel id}`. */
export const preferenceKey = (itemId: string, channelId: string) => `${itemId}.${channelId}`;

/**
 * NotificationPreferences — what to be told about, and where. Each row has one switch per channel; the value is a flat
 * record keyed `itemId.channelId`. On a phone the channel names move into the rows so the columns still read.
 */
export function NotificationPreferences({
  groups,
  channels,
  defaultValue = {},
  onChange,
  className,
}: {
  groups: NotificationGroup[];
  channels: NotificationChannel[];
  defaultValue?: Record<string, boolean>;
  /** Fires after every toggle with the whole record. */
  onChange?: (value: Record<string, boolean>) => void;
  className?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const columns = { '--cols': `minmax(0,1fr) repeat(${channels.length}, minmax(0,3.5rem))` } as React.CSSProperties;

  const toggle = (key: string, checked: boolean) => {
    const next = { ...value, [key]: checked };
    setValue(next);
    onChange?.(next);
  };

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="hidden items-center gap-3 border-b px-4 py-2.5 text-xs text-muted-foreground sm:grid sm:px-6 sm:[grid-template-columns:var(--cols)]" style={columns}>
        <span />
        {channels.map((channel) => (
          <span key={channel.id} className="text-center">
            {channel.label}
          </span>
        ))}
      </div>

      {groups.map((group) => (
        <section key={group.id} className="border-b last:border-b-0">
          <h3 className="bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground sm:px-6">{group.title}</h3>
          <ul className="divide-y">
            {group.items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:grid sm:gap-3 sm:px-6 sm:[grid-template-columns:var(--cols)]" style={columns}>
                <div className="min-w-0 basis-full sm:basis-auto">
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.description ? <p className="text-xs text-muted-foreground">{item.description}</p> : null}
                </div>
                {channels.map((channel) => {
                  const key = preferenceKey(item.id, channel.id);
                  return (
                    <label key={channel.id} className="flex items-center justify-between gap-2 sm:justify-center">
                      <span className="text-xs text-muted-foreground sm:sr-only">{channel.label}</span>
                      <Switch checked={!!value[key]} onCheckedChange={(checked) => toggle(key, checked)} aria-label={`${item.label} by ${channel.label}`} />
                    </label>
                  );
                })}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Card>
  );
}
```
