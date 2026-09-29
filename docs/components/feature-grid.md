# FeatureGrid

Small tiles that say what the product does.

A centred heading and a responsive grid of bordered tiles, each with an icon, a title and one sentence. Two, three or four columns on wide screens; one or two on a phone.

**Category:** Marketing pages · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add 
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/feature-grid.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<FeatureGrid
  title="Everything the finance team asks for"
  description="And a few things they did not know they could ask for."
  features={[
    { id: 'f1', title: 'Live dashboards', description: 'Every number updates as it changes.', icon: <BarChart3 /> },
    { id: 'f2', title: 'Roles and access', description: 'Decide who sees what.', icon: <Lock /> },
  ]}
/>
```

## Anatomy

```tsx
import { FeatureGrid, type Feature } from '@/components/app/feature-grid';

// icon is a lucide element. It is coloured with accentColor.
<FeatureGrid features={features} columns={3} />
```

## Examples

### Four across

```tsx
<FeatureGrid columns={4} features={features} />
```

## API reference

#### FeatureGrid

A grid of feature tiles.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `features` | `Feature[]` | — | id, title, description and an optional icon element. |
| `title` | `string` | — | Heading above the grid. |
| `description` | `string` | — | A sentence under the heading. |
| `columns` | `2 \| 3 \| 4` | `3` | Columns on large screens. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the icons. Inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the section. |

## Source

`src/components/app/feature-grid.tsx`

```tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Feature {
  id: string;
  title: string;
  description: string;
  /** A lucide icon element, e.g. `<Map />`. */
  icon?: React.ReactNode;
}

/** FeatureGrid — a heading and a grid of small tiles, each with an icon, a title and one sentence. */
export function FeatureGrid({
  title,
  description,
  features,
  columns = 3,
  accentColor = '#ec4899',
  className,
}: {
  title?: string;
  description?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  accentColor?: string;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16', className)}>
      {title || description ? (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          {title ? <h2 className="text-3xl font-medium tracking-tight text-balance">{title}</h2> : null}
          {description ? <p className="text-base text-muted-foreground text-pretty">{description}</p> : null}
        </div>
      ) : null}
      <ul className={cn('grid gap-4 sm:grid-cols-2', columns === 3 && 'lg:grid-cols-3', columns === 4 && 'lg:grid-cols-4')}>
        {features.map((feature) => (
          <li key={feature.id} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
            {feature.icon ? (
              <span className="flex size-9 items-center justify-center rounded-lg border [&_svg]:size-4.5" style={{ color: accentColor }}>
                {feature.icon}
              </span>
            ) : null}
            <h3 className="text-base font-bold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```
