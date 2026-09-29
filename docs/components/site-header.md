# SiteHeader

The top bar of a marketing page, with a menu on phones.

The brand, a row of links, and up to two actions. Below the md breakpoint the links and actions move into a sheet opened by a menu button. Pass onNavigate to route the links yourself.

**Category:** Marketing pages · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button sheet
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/site-header.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/site-header.tsx`

## Usage

```tsx
<SiteHeader
  brand="Ledger"
  links={[{ label: 'Product', href: '/product' }, { label: 'Pricing', href: '/pricing' }]}
  primaryAction={{ label: 'Start free', href: '/register' }}
  secondaryAction={{ label: 'Sign in', href: '/login' }}
  onNavigate={(href) => navigate(href)}
/>
```

## Anatomy

```tsx
import { SiteHeader } from '@/components/app/site-header';

// Links are real anchors. onNavigate, when given, cancels the default and calls you instead.
<SiteHeader brand="Ledger" links={links} primaryAction={cta} />
```

## Examples

### One action

```tsx
<SiteHeader brand="Ledger" links={links} primaryAction={{ label: 'Get started', href: '/register' }} />
```

## API reference

#### SiteHeader

A header bar.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `brand` | `string` | — | The name beside the accent dot. |
| `links` | `SiteNavLink[]` | — | label and href. |
| `primaryAction` | `{ label; href }` | — | A filled button. |
| `secondaryAction` | `{ label; href }` | — | A ghost button. |
| `onNavigate` | `(href) => void` | — | Handle navigation yourself, for a client-side router. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the brand dot. Inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the header. |

## Source

`src/components/app/site-header.tsx`

```tsx
'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface SiteNavLink {
  label: string;
  href: string;
}

/** SiteHeader — the top bar of a marketing page: brand, links, two actions, and a sheet menu on a phone. */
export function SiteHeader({
  brand,
  links,
  primaryAction,
  secondaryAction,
  onNavigate,
  accentColor = '#ec4899',
  className,
}: {
  brand: string;
  links: SiteNavLink[];
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  /** Called with the href when a link is followed. Without it links are plain anchors. */
  onNavigate?: (href: string) => void;
  accentColor?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const anchor = (href: string, children: React.ReactNode, extra?: string) => (
    <a
      href={href}
      className={extra}
      onClick={(event) => {
        if (!onNavigate) return;
        event.preventDefault();
        setOpen(false);
        onNavigate(href);
      }}
    >
      {children}
    </a>
  );

  return (
    <header className={cn('flex h-14 w-full items-center justify-between gap-4 border-b bg-background px-4 sm:px-6', className)}>
      <div className="flex items-center gap-8">
        {anchor(
          '/',
          <>
            <span className="size-2.5 rounded-full" style={{ background: accentColor }} aria-hidden />
            {brand}
          </>,
          'flex items-center gap-2 text-base font-bold tracking-tight',
        )}
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <React.Fragment key={link.href}>{anchor(link.href, link.label, 'text-sm text-muted-foreground transition-colors hover:text-foreground')}</React.Fragment>
          ))}
        </nav>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        {secondaryAction ? (
          <Button variant="ghost" size="sm" asChild>
            {anchor(secondaryAction.href, secondaryAction.label)}
          </Button>
        ) : null}
        {primaryAction ? (
          <Button size="sm" asChild>
            {anchor(primaryAction.href, primaryAction.label)}
          </Button>
        ) : null}
      </div>

      <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
        <Menu />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{brand}</SheetTitle>
          </SheetHeader>
          <nav aria-label="Mobile" className="flex flex-col px-2">
            {links.map((link) => (
              <React.Fragment key={link.href}>{anchor(link.href, link.label, 'rounded-md px-3 py-2.5 text-sm hover:bg-accent')}</React.Fragment>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2 p-4">
            {secondaryAction ? (
              <Button variant="outline" asChild>
                {anchor(secondaryAction.href, secondaryAction.label)}
              </Button>
            ) : null}
            {primaryAction ? <Button asChild>{anchor(primaryAction.href, primaryAction.label)}</Button> : null}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
```
