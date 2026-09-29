'use client';

import * as React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  /** Already formatted, e.g. "5 min ago". */
  time: string;
  read?: boolean;
  icon?: LucideIcon;
}

/**
 * NotificationsPopover — a bell with an unread count that opens a short list. Read state is kept here, seeded from
 * `notifications`; you hear about every change so you can save it.
 */
export function NotificationsPopover({
  notifications,
  onRead,
  onMarkAllRead,
  onOpenItem,
  defaultOpen = false,
  accentColor = '#ec4899',
  className,
}: {
  notifications: AppNotification[];
  onRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onOpenItem?: (notification: AppNotification) => void;
  defaultOpen?: boolean;
  accentColor?: string;
  className?: string;
}) {
  const [readIds, setReadIds] = React.useState(() => new Set(notifications.filter((item) => item.read).map((item) => item.id)));
  const unread = notifications.filter((item) => !readIds.has(item.id)).length;

  const read = (id: string) => {
    setReadIds((current) => new Set(current).add(id));
    onRead?.(id);
  };

  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('relative', className)} aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}>
          <Bell />
          {unread ? (
            <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] leading-4 text-white tabular-nums" style={{ background: accentColor }}>
              {unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] gap-0 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-bold">Notifications</p>
          <Button variant="ghost" size="xs" disabled={!unread} onClick={() => { setReadIds(new Set(notifications.map((item) => item.id))); onMarkAllRead?.(); }}>
            <CheckCheck /> Mark all read
          </Button>
        </div>
        {notifications.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">You are all caught up.</p>
        ) : (
          <ul className="max-h-80 divide-y overflow-y-auto">
            {notifications.map((item) => {
              const isRead = readIds.has(item.id);
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button type="button" className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60" onClick={() => { read(item.id); onOpenItem?.(item); }}>
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted/50">{Icon ? <Icon className="size-3.5 text-muted-foreground" /> : <Bell className="size-3.5 text-muted-foreground" />}</span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-sm', isRead ? 'text-muted-foreground' : 'font-medium')}>{item.title}</span>
                      {item.body ? <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{item.body}</span> : null}
                      <span className="mt-1 block font-mono text-[11px] text-muted-foreground">{item.time}</span>
                    </span>
                    {isRead ? null : <span className="mt-2 size-2 shrink-0 rounded-full" style={{ background: accentColor }} aria-label="Unread" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
