# PageHeader

The top of a page: crumbs, title, status, actions.

Breadcrumbs above a title that has room for a status badge, a line of description, and a row of action buttons that drops under the title on a phone.

**Category:** Layout and navigation · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add 
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/page-header.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<PageHeader
  breadcrumbs={[{ label: 'Fleet', href: '/fleet' }, { label: 'Vehicles', href: '/vehicles' }, { label: 'Van 21' }]}
  onCrumb={(crumb) => navigate(crumb.href!)}
  title="Van 21"
  badge={<Badge variant="outline">In the shop</Badge>}
  description="2019 Mercedes Sprinter 2500 · 231,880 km."
  actions={<Button size="sm">Schedule service</Button>}
/>
```

## Anatomy

```tsx
import { PageHeader } from '@/components/app/page-header';

// The last crumb is the current page and is never a link.
<PageHeader title={title} breadcrumbs={crumbs} actions={buttons} />
```

## Examples

### Title only

```tsx
<PageHeader title="Settings" />
```

## API reference

#### PageHeader

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | The page title. |
| `description` | `ReactNode` | — | A line under the title. |
| `breadcrumbs` | `Crumb[]` | — | { label, href? } for each step; the last is the current page. |
| `onCrumb` | `(crumb: Crumb) => void` | — | Called when a crumb link is clicked, so your router can take over. |
| `badge` | `ReactNode` | — | Beside the title, usually a status Badge. |
| `actions` | `ReactNode` | — | Buttons on the right. |
| `className` | `string` | — | Merged onto the root element. |

## Source

`src/components/app/page-header.tsx`

```tsx
'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

/** PageHeader — the top of a page inside the app: breadcrumbs, a title with room for a status badge, a line of description, and actions. */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  onCrumb,
  badge,
  actions,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  breadcrumbs?: Crumb[];
  /** Called when a crumb with an href is clicked, so your router can take over. */
  onCrumb?: (crumb: Crumb) => void;
  /** Shown beside the title, e.g. a status Badge. */
  badge?: React.ReactNode;
  /** Buttons on the right; they wrap under the title on a phone. */
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0 space-y-1.5">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              {breadcrumbs.map((crumb, index) => {
                const last = index === breadcrumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                    {crumb.href && !last ? (
                      <a href={crumb.href} className="transition-colors hover:text-foreground" onClick={(event) => { if (onCrumb && event.button === 0 && !event.metaKey && !event.ctrlKey) { event.preventDefault(); onCrumb(crumb); } }}>
                        {crumb.label}
                      </a>
                    ) : (
                      <span className={last ? 'text-foreground' : undefined} aria-current={last ? 'page' : undefined}>{crumb.label}</span>
                    )}
                    {last ? null : <ChevronRight className="size-3" aria-hidden />}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          {badge}
        </div>
        {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
```
