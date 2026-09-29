# PageTabs

The tab strip under a page header: one record, several views.

Underlined tabs with optional counts that switch between views of the same page, such as Overview, History and Documents. Tabs can be links, so each view can be its own route and open in a new tab.

**Category:** Layout and navigation · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add 
```

Copy the file below into `src/components/app/page-tabs.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/page-tabs.tsx`

## Usage

```tsx
<PageTabs
  activeId="history"
  tabs={[
    { id: 'overview', label: 'Overview', href: '/vehicles/v21' },
    { id: 'history', label: 'History', count: 14, href: '/vehicles/v21/history' },
    { id: 'documents', label: 'Documents', count: 3, href: '/vehicles/v21/documents' },
  ]}
  onChange={(tab) => navigate(tab.href!)}
/>
```

## Anatomy

```tsx
import { PageTabs, type PageTab } from '@/components/app/page-tabs';

// With href a tab is a link; onChange is called on a plain click so your router can take over.
<PageTabs tabs={tabs} activeId={id} onChange={go} />
```

## Examples

### Buttons, not links

```tsx
<PageTabs tabs={[{ id: 'a', label: 'All' }, { id: 'b', label: 'Late', count: 4 }]} activeId={tab} onChange={(t) => setTab(t.id)} />
```

## API reference

#### PageTabs

Scrolls sideways on a narrow screen.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tabs` | `PageTab[]` | — | id, label, count? and href? for each tab. |
| `activeId` | `string` | — | The id of the current tab. |
| `onChange` | `(tab: PageTab) => void` | — | Called on a click; for links, a plain click only (modified clicks open a new tab). |
| `accentColor` | `string` | `'#ec4899'` | Colour of the active underline. |
| `className` | `string` | — | Merged onto the root element. |

## Source

`src/components/app/page-tabs.tsx`

```tsx
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
```
