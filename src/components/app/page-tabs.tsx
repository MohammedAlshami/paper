'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageTab {
  id: string;
  label: string;
  count?: number;
  /** When set the tab is a link, so it can be opened in a new tab and works with any router. */
  href?: string;
}

/**
 * PageTabs — the strip of tabs under a page header that switches between views of the same record or list:
 * Overview, History, Documents. Tabs can carry a count, and can be links, so they map onto routes.
 */
export function PageTabs({
  tabs,
  activeId,
  onChange,
  accentColor = '#ec4899',
  className,
}: {
  tabs: PageTab[];
  activeId: string;
  onChange?: (tab: PageTab) => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <nav aria-label="Page sections" className={cn('-mb-px flex gap-1 overflow-x-auto border-b', className)}>
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        const cls = cn('relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60', active ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground');
        const inner = (
          <>
            {tab.label}
            {tab.count !== undefined ? <span className="rounded-full bg-muted px-1.5 font-mono text-[11px] tabular-nums text-muted-foreground">{tab.count}</span> : null}
            <span className={cn('absolute inset-x-2 -bottom-px h-0.5 rounded-full', active ? 'opacity-100' : 'opacity-0')} style={{ background: accentColor }} aria-hidden />
          </>
        );
        return tab.href ? (
          <a
            key={tab.id}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cls}
            onClick={(event) => {
              if (onChange && event.button === 0 && !event.metaKey && !event.ctrlKey) {
                event.preventDefault();
                onChange(tab);
              }
            }}
          >
            {inner}
          </a>
        ) : (
          <button key={tab.id} type="button" aria-current={active ? 'page' : undefined} className={cls} onClick={() => onChange?.(tab)}>
            {inner}
          </button>
        );
      })}
    </nav>
  );
}
