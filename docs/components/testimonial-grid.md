# TestimonialGrid

Customer quotes in a calm grid.

A heading over a grid of quote cards, each with the person, their role and company. One column on a phone, two on a tablet, three on a desktop.

**Category:** Marketing pages · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add avatar
```

Copy the file below into `src/components/app/testimonial-grid.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/testimonial-grid.tsx`, `src/components/app/app-kit.ts`

## Usage

```tsx
<TestimonialGrid
  title="Teams that stopped dreading month end"
  testimonials={[
    { id: 't1', quote: 'We cut our close from six days to two.', name: 'Ines Duarte', role: 'Controller', company: 'Northwind' },
    { id: 't2', quote: 'The first finance tool my team opens on purpose.', name: 'Tom Adeyemi', role: 'COO', company: 'Acme' },
  ]}
/>
```

## Anatomy

```tsx
import { TestimonialGrid, type Testimonial } from '@/components/app/testimonial-grid';

<TestimonialGrid testimonials={testimonials} />
```

## Examples

### Without a heading

```tsx
<TestimonialGrid testimonials={testimonials} />
```

## API reference

#### TestimonialGrid

A grid of customer quotes.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `testimonials` | `Testimonial[]` | — | id, quote, name, role and company. |
| `title` | `string` | — | A heading above the grid. |
| `description` | `string` | — | A line under the heading. |
| `className` | `string` | — | Merged onto the section. |

## Source

`src/components/app/testimonial-grid.tsx`

```tsx
'use client';

import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { initials } from './app-kit';

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company?: string;
}

/** TestimonialGrid — customer quotes in a responsive grid: one column on a phone, two, then three. */
export function TestimonialGrid({
  testimonials,
  title,
  description,
  className,
}: {
  testimonials: Testimonial[];
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col gap-8', className)}>
      {title || description ? (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center">
          {title ? <h2 className="text-3xl font-medium tracking-tight text-balance">{title}</h2> : null}
          {description ? <p className="text-base text-muted-foreground text-pretty">{description}</p> : null}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item) => (
          <figure key={item.id} className="flex flex-col justify-between gap-6 rounded-xl border bg-card p-5">
            <blockquote className="text-sm leading-relaxed text-pretty">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback>{initials(item.name)}</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{item.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {item.role}
                  {item.company ? `, ${item.company}` : ''}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
```
