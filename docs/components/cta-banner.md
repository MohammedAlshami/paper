# CtaBanner

The closing ask of a marketing page.

A centred panel with a headline, a sentence and one or two buttons, washed with a soft accent glow from the top. Put it right above the footer.

**Category:** Marketing pages · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button
```

Copy the file below into `src/components/app/cta-banner.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/cta-banner.tsx`

## Usage

```tsx
<CtaBanner
  title="Close the month in an afternoon."
  description="Start free. No card, no call, and your data is yours to export."
  primaryAction={{ label: 'Start free', href: '/register' }}
  secondaryAction={{ label: 'Talk to sales', href: '/contact' }}
/>
```

## Anatomy

```tsx
import { CtaBanner } from '@/components/app/cta-banner';

// Each action is { label, href } for a link or { label, onClick } for a button.
<CtaBanner title="…" primaryAction={{ label: 'Start free', onClick: signUp }} />
```

## Examples

### One action

```tsx
<CtaBanner title="Ready when you are." primaryAction={{ label: 'Get started', href: '/register' }} />
```

## API reference

#### CtaBanner

A closing call to action.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | The headline. |
| `description` | `string` | — | One supporting sentence. |
| `primaryAction` | `{ label; href?; onClick? }` | — | The filled button. |
| `secondaryAction` | `{ label; href?; onClick? }` | — | The outline button. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the glow. Inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the section. |

## Source

`src/components/app/cta-banner.tsx`

```tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** CtaBanner — the closing ask of a marketing page: one line, one sentence, one or two buttons. */
export function CtaBanner({
  title,
  description,
  primaryAction,
  secondaryAction,
  accentColor = '#ec4899',
  className,
}: {
  title: string;
  description?: string;
  primaryAction?: { label: string; onClick?: () => void; href?: string };
  secondaryAction?: { label: string; onClick?: () => void; href?: string };
  accentColor?: string;
  className?: string;
}) {
  const action = (item: NonNullable<typeof primaryAction>, variant: 'default' | 'outline') => (
    <Button size="lg" variant={variant} onClick={item.onClick} asChild={Boolean(item.href)}>
      {item.href ? <a href={item.href}>{item.label}</a> : item.label}
    </Button>
  );

  return (
    <section
      className={cn('flex flex-col items-center gap-5 rounded-2xl border bg-card px-6 py-12 text-center sm:py-16', className)}
      style={{ backgroundImage: `radial-gradient(90% 120% at 50% 0%, ${accentColor}1f, transparent 65%)` }}
    >
      <h2 className="max-w-xl text-3xl font-medium tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description ? <p className="max-w-lg text-base text-muted-foreground text-pretty">{description}</p> : null}
      {primaryAction || secondaryAction ? (
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          {primaryAction ? action(primaryAction, 'default') : null}
          {secondaryAction ? action(secondaryAction, 'outline') : null}
        </div>
      ) : null}
    </section>
  );
}
```
