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
