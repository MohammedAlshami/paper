# ForgotPasswordForm

Ask for an email, then say the link is on its way.

One field, then a confirmation that does not reveal whether the address has an account. It swaps to the confirmation when onSubmit resolves; if it throws, the message is shown and the form stays.

**Category:** Authentication and account · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button input label
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/forgot-password-form.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<ForgotPasswordForm
  onSubmit={async (email) => {
    await api.sendResetLink(email);
  }}
  backHref="/login"
/>
```

## Anatomy

```tsx
import { ForgotPasswordForm } from '@/components/app/forgot-password-form';

// onSubmit may be async. Resolve to show "check your inbox"; throw an Error to show its message.
// The confirmation has a "Send it again" button that calls onSubmit again.
<ForgotPasswordForm onSubmit={sendLink} onBack={() => navigate('/login')} />
```

## Examples

### Already sent

```tsx
<ForgotPasswordForm defaultEmail="priya@northwind.example" defaultSent backHref="/login" />
```

## API reference

#### ForgotPasswordForm

Request a reset link.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultEmail` | `string` | `''` | Starting email. |
| `defaultSent` | `boolean` | `false` | Start on the confirmation. |
| `onSubmit` | `(email: string) => void \| Promise<void>` | — | Sends the link. Throw to show an error. |
| `onBack` | `() => void` | — | Handles "Back to sign in". |
| `backHref` | `string` | — | Shows "Back to sign in" as a link. |
| `className` | `string` | — | Merged onto the form. |

## Source

`src/components/app/forgot-password-form.tsx`

```tsx
'use client';

import * as React from 'react';
import { ArrowLeft, LoaderCircle, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ForgotPasswordForm — ask for an email, then confirm that a link was sent. It swaps to the confirmation once
 * `onSubmit` resolves; if it throws, the message is shown and the form stays.
 */
export function ForgotPasswordForm({
  defaultEmail = '',
  defaultSent = false,
  onSubmit,
  onBack,
  backHref,
  className,
}: {
  defaultEmail?: string;
  /** Start on the confirmation, for a page that has just sent the email. */
  defaultSent?: boolean;
  /** Send the reset link. May be async. */
  onSubmit?: (email: string) => void | Promise<void>;
  onBack?: () => void;
  backHref?: string;
  className?: string;
}) {
  const [email, setEmail] = React.useState(defaultEmail);
  const [sent, setSent] = React.useState(defaultSent);
  const [loading, setLoading] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [failure, setFailure] = React.useState<string>();

  const invalid = !email ? 'Enter your email' : !EMAIL.test(email) ? 'That does not look like an email address' : undefined;

  const send = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setTouched(true);
    if (invalid) return;
    setLoading(true);
    setFailure(undefined);
    try {
      await onSubmit?.(email);
      setSent(true);
    } catch (thrown) {
      setFailure(thrown instanceof Error ? thrown.message : 'Could not send the email. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const back = (
    <a
      href={backHref ?? '#'}
      onClick={(event) => {
        if (onBack) {
          event.preventDefault();
          onBack();
        }
      }}
      className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" /> Back to sign in
    </a>
  );

  if (sent) {
    return (
      <div className={cn('flex flex-col gap-5 text-center', className)}>
        <span className="mx-auto flex size-10 items-center justify-center rounded-full border bg-muted">
          <MailCheck className="size-5" />
        </span>
        <p className="text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{email || 'that address'}</span> has an account, a reset link is on its way. It works for one hour.
        </p>
        <Button type="button" variant="outline" disabled={loading} onClick={() => void send()}>
          {loading ? <LoaderCircle className="animate-spin" /> : null}
          Send it again
        </Button>
        {onBack || backHref ? back : null}
      </div>
    );
  }

  return (
    <form onSubmit={send} noValidate className={cn('flex flex-col gap-5', className)}>
      {failure ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {failure}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="forgot-email">Email</Label>
        <Input id="forgot-email" type="email" autoComplete="email" placeholder="you@company.com" value={email} disabled={loading} aria-invalid={touched && !!invalid} onChange={(event) => setEmail(event.target.value)} onBlur={() => setTouched(true)} />
        {touched && invalid ? <p className="text-xs text-destructive">{invalid}</p> : null}
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <LoaderCircle className="animate-spin" /> : null}
        Send reset link
      </Button>
      {onBack || backHref ? back : null}
    </form>
  );
}
```
