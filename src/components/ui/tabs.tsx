'use client';

import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { cn } from '@/lib/utils';

/** Underlined tabs with a sliding hairline indicator, built on Base UI. */
export function Tabs({ className, ...props }: React.ComponentProps<typeof BaseTabs.Root>) {
  return <BaseTabs.Root className={cn('w-full', className)} {...props} />;
}

export function TabsList({ className, ...props }: React.ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn('relative z-[1] flex gap-6 border-b border-dashed border-line', className)}
      {...props}
    />
  );
}

export function TabsTab({ className, ...props }: React.ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        'shrink-0 bg-transparent pb-3 text-sm font-medium tracking-tight text-ink-faint',
        'transition-colors hover:text-ink-muted data-active:text-ink',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
        className,
      )}
      {...props}
    />
  );
}

export function TabsIndicator({ className, ...props }: React.ComponentProps<typeof BaseTabs.Indicator>) {
  return (
    <BaseTabs.Indicator
      className={cn(
        'absolute -bottom-px left-0 h-px w-(--active-tab-width) translate-x-(--active-tab-left) bg-ink',
        'transition-[translate,width] duration-200 ease-out',
        className,
      )}
      {...props}
    />
  );
}

export function TabsPanel({ className, ...props }: React.ComponentProps<typeof BaseTabs.Panel>) {
  return <BaseTabs.Panel className={cn('pt-6', className)} {...props} />;
}
