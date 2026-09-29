# SiteFooter

The bottom of a marketing page.

The brand and a line about it, columns of links, and the small print. The columns sit beside the brand on wide screens and stack under it on a phone.

**Category:** Marketing pages · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add 
```

Copy the file below into `src/components/app/site-footer.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/site-footer.tsx`

## Usage

```tsx
<SiteFooter
  brand="Ledger"
  tagline="Calm money software for small teams."
  columns={[
    { title: 'Product', links: [{ label: 'Features', href: '/features' }, { label: 'Pricing', href: '/pricing' }] },
    { title: 'Legal', links: [{ label: 'Privacy', href: '/privacy' }] },
  ]}
  legal="© 2026 Ledger, Inc. All rights reserved."
/>
```

## Anatomy

```tsx
import { SiteFooter, type FooterColumn } from '@/components/app/site-footer';

<SiteFooter brand="Ledger" columns={columns} legal="© 2026 Ledger, Inc." onNavigate={(href) => navigate(href)} />
```

## Examples

### Two columns, no tagline

```tsx
<SiteFooter brand="Ledger" columns={columns.slice(0, 2)} />
```

## API reference

#### SiteFooter

A footer.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `brand` | `string` | — | The name beside the accent dot. |
| `tagline` | `string` | — | A line under the brand. |
| `columns` | `FooterColumn[]` | — | title and links (label, href). |
| `legal` | `string` | — | The small print row. |
| `onNavigate` | `(href) => void` | — | Handle navigation yourself. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the brand dot. Inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the footer. |

## Source

`src/components/app/site-footer.tsx`

```tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

/** SiteFooter — the bottom of a marketing page: brand and a line about it, columns of links, and the legal row. */
export function SiteFooter({
  brand,
  tagline,
  columns,
  legal,
  onNavigate,
  accentColor = '#ec4899',
  className,
}: {
  brand: string;
  tagline?: string;
  columns: FooterColumn[];
  /** The small print, e.g. "© 2026 Ledger, Inc." */
  legal?: string;
  onNavigate?: (href: string) => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <footer className={cn('border-t bg-background px-4 py-12 sm:px-6', className)}>
      <div className="flex flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-xs space-y-3">
          <p className="flex items-center gap-2 text-base font-bold tracking-tight">
            <span className="size-2.5 rounded-full" style={{ background: accentColor }} aria-hidden />
            {brand}
          </p>
          {tagline ? <p className="text-sm text-muted-foreground">{tagline}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-16">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="space-y-3">
              <p className="text-sm font-bold">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      onClick={(event) => {
                        if (!onNavigate) return;
                        event.preventDefault();
                        onNavigate(link.href);
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      {legal ? <p className="mt-10 border-t pt-6 text-xs text-muted-foreground">{legal}</p> : null}
    </footer>
  );
}
```
