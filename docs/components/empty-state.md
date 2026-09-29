# EmptyState

Nothing here yet: say so, and offer the next step.

An icon, a title, a line of explanation and up to two actions, in a dashed panel. For a first-run list or a search with no results.

**Category:** Layout and navigation · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/empty-state.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<EmptyState
  icon={Truck}
  title="No vehicles yet"
  description="Add your first vehicle to start tracking its health, services and costs."
  action={{ label: 'Add a vehicle', onClick: openForm }}
  secondaryAction={{ label: 'Import a CSV' }}
/>
```

## Anatomy

```tsx
import { EmptyState } from '@/components/app/empty-state';

<EmptyState icon={Inbox} title="Inbox zero" description="Nothing needs you right now." bordered={false} />
```

## Examples

### No search results

```tsx
<EmptyState icon={Search} title="No results" description="Try a shorter word." action={{ label: 'Clear filters' }} />
```

## API reference

#### EmptyState

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | What is missing. |
| `description` | `ReactNode` | — | Why, or what to do. |
| `icon` | `LucideIcon` | — | Drawn in a circle in the accent colour. |
| `action` | `{ label; onClick? }` | — | The primary button. |
| `secondaryAction` | `{ label; onClick? }` | — | An outline button beside it. |
| `bordered` | `boolean` | `true` | A dashed border around it. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the icon. |
| `className` | `string` | — | Merged onto the root element. |

## Source

`src/components/app/empty-state.tsx`

```tsx
'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyAction {
  label: string;
  onClick?: () => void;
}

/** EmptyState — for a list with nothing in it yet, or a search with no results: say what is missing and offer the next step. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  bordered = true,
  accentColor = '#ec4899',
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: EmptyAction;
  secondaryAction?: EmptyAction;
  /** Draw a dashed border, for when it fills a panel on its own. */
  bordered?: boolean;
  accentColor?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-4 rounded-xl px-6 py-12 text-center', bordered && 'border border-dashed', className)}>
      {Icon ? (
        <span className="flex size-11 items-center justify-center rounded-full border bg-muted/50">
          <Icon className="size-5" style={{ color: accentColor }} />
        </span>
      ) : null}
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-bold">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action || secondaryAction ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {action ? <Button size="sm" onClick={action.onClick}>{action.label}</Button> : null}
          {secondaryAction ? <Button size="sm" variant="outline" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button> : null}
        </div>
      ) : null}
    </div>
  );
}
```
