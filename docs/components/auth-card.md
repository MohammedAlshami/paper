# AuthCard

The frame every sign-in page shares.

A title, a description, your form and some small print, as one centred card or as a split page with a brand panel beside it. The panel hides on a phone, so the form is always first.

**Category:** Authentication and account · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

Copy the file below into `src/components/app/auth-card.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/auth-card.tsx`

## Usage

```tsx
<AuthCard
  variant="split"
  brand={<Logo />}
  title="Welcome back"
  description="Sign in to see your fleet."
  footer="By continuing you agree to the terms."
  aside={<blockquote>“Maintenance used to live in a spreadsheet.”</blockquote>}
>
  <LoginForm onSubmit={signIn} />
</AuthCard>
```

## Anatomy

```tsx
import { AuthCard } from '@/components/app/auth-card';

// variant="card": one centred card, max 24rem wide.
// variant="split": the form on the left, `aside` on the right from the md breakpoint up.
// children is the form. Put your logo in `brand`, legal text in `footer`.
<AuthCard title={...} description={...} brand={...} footer={...} aside={...}>
  {form}
</AuthCard>
```

## Examples

### A centred card

```tsx
<AuthCard title="Reset your password" description="We will email you a link.">
  <ForgotPasswordForm onSubmit={sendLink} />
</AuthCard>
```

## API reference

#### AuthCard

A card for one sign-in step.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'card' \| 'split'` | `'card'` | A single card, or a form beside a brand panel. |
| `brand` | `ReactNode` | — | Logo or name above the title. |
| `title` | `ReactNode` | — | The page heading. |
| `description` | `ReactNode` | — | One line under the heading. |
| `children` | `ReactNode` | — | The form. |
| `footer` | `ReactNode` | — | Small print under the form. |
| `aside` | `ReactNode` | — | Content of the brand panel. Only the split variant shows it, and only from md up. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the panel wash. Inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/auth-card.tsx`

```tsx
'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * AuthCard — the frame every sign-in page shares. `card` is a single centred card; `split` puts the form beside a
 * brand panel (`aside`), which is hidden on small screens so the form always comes first on a phone.
 */
export function AuthCard({
  variant = 'card',
  brand,
  title,
  description,
  children,
  footer,
  aside,
  accentColor = '#ec4899',
  className,
}: {
  variant?: 'card' | 'split';
  /** Logo or name, shown above the title. */
  brand?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The form. */
  children: React.ReactNode;
  /** Small print under the form: terms, a support link. */
  footer?: React.ReactNode;
  /** Right-hand panel of the `split` variant. Falls back to a plain accent wash. */
  aside?: React.ReactNode;
  accentColor?: string;
  className?: string;
}) {
  const body = (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        {brand ? <div className="mb-2 flex items-center gap-2 text-sm font-bold">{brand}</div> : null}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
      {footer ? <div className="text-xs text-muted-foreground">{footer}</div> : null}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className={cn('mx-auto w-full max-w-sm gap-0 p-6 sm:p-8', className)}>{body}</Card>
    );
  }

  return (
    <Card className={cn('mx-auto grid w-full max-w-4xl gap-0 overflow-hidden py-0 md:grid-cols-2', className)}>
      <div className="flex items-center p-6 sm:p-10">{body}</div>
      <div
        className="relative hidden flex-col justify-end border-l bg-muted p-10 md:flex"
        style={{ backgroundImage: `radial-gradient(120% 80% at 100% 0%, ${accentColor}22, transparent 60%)` }}
      >
        {aside}
      </div>
    </Card>
  );
}
```
