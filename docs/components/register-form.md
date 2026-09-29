# RegisterForm

A sign-up form that tells you how strong the password is.

Name, work email and a password with a four-step strength meter, plus a terms box. extraFields adds your own inputs, such as a company name. Creating the account is yours.

**Category:** Authentication and account · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button checkbox input label
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/register-form.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<RegisterForm
  extraFields={[{ id: 'company', label: 'Company', placeholder: 'Northwind Logistics', required: true }]}
  termsLabel={<>I agree to the <a href="/terms">terms</a></>}
  onSubmit={({ name, email, password, extra }) => createAccount(name, email, password, extra.company)}
  loginHref="/login"
/>
```

## Anatomy

```tsx
import { RegisterForm, passwordStrength, type RegisterValues } from '@/components/app/register-form';

// Strength is 0 to 4. Under 8 characters is 0 and blocks submit; the other points are mixed case, a digit,
// a symbol and 12+ characters. passwordStrength(password) is exported if you want the number.
<RegisterForm onSubmit={(values: RegisterValues) => {}} />
```

## Examples

### With a company field

```tsx
<RegisterForm extraFields={[{ id: 'company', label: 'Company', required: true }]} />
```

## API reference

#### RegisterForm

A sign-up form. Pure UI: no network.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultValues` | `Partial<RegisterValues>` | — | Starting values. |
| `extraFields` | `ExtraField[]` | `[]` | id, label, placeholder, type and required for each added input. Answers come back in values.extra. |
| `termsLabel` | `ReactNode` | — | Text beside the terms checkbox. |
| `onSubmit` | `(values: RegisterValues) => void` | — | Called with valid values. |
| `onSwitchToLogin` | `() => void` | — | Handles the "Sign in" link. |
| `loginHref` | `string` | — | Shows the "Sign in" link. |
| `loading` | `boolean` | `false` | Disables the form. |
| `error` | `string` | — | A failure message shown above the fields. |
| `submitLabel` | `string` | `'Create account'` | Button text. |
| `accentColor` | `string` | `'#ec4899'` | Colour of a weak password in the meter. Inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the form. |

## Source

`src/components/app/register-form.tsx`

```tsx
'use client';

import * as React from 'react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
  terms: boolean;
  /** Answers to `extraFields`, keyed by the field id. */
  extra: Record<string, string>;
}

export interface ExtraField {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRENGTH = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

/** 0 to 4: one point each for length, mixed case, a digit, and a symbol. Under 8 characters is always 0. */
export function passwordStrength(password: string) {
  if (password.length < 8) return 0;
  return [/[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password), password.length >= 12].filter(Boolean).length;
}

/**
 * RegisterForm — name, email, a password with a strength meter, and a terms box. `extraFields` adds your own inputs
 * (a company, a phone number). Creating the account is yours: handle `onSubmit`, and pass `error` if it fails.
 */
export function RegisterForm({
  defaultValues,
  extraFields = [],
  termsLabel = 'I agree to the terms and the privacy policy',
  onSubmit,
  onSwitchToLogin,
  loginHref,
  loading = false,
  error,
  submitLabel = 'Create account',
  accentColor = '#ec4899',
  className,
}: {
  defaultValues?: Partial<Omit<RegisterValues, 'extra'>> & { extra?: Record<string, string> };
  extraFields?: ExtraField[];
  termsLabel?: React.ReactNode;
  onSubmit?: (values: RegisterValues) => void;
  onSwitchToLogin?: () => void;
  loginHref?: string;
  loading?: boolean;
  error?: string;
  submitLabel?: string;
  accentColor?: string;
  className?: string;
}) {
  const [values, setValues] = React.useState<RegisterValues>({ name: '', email: '', password: '', terms: false, ...defaultValues, extra: defaultValues?.extra ?? {} });
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [show, setShow] = React.useState(false);

  const score = passwordStrength(values.password);
  const errors: Record<string, string | undefined> = {
    name: values.name.trim() ? undefined : 'Enter your name',
    email: !values.email ? 'Enter your email' : !EMAIL.test(values.email) ? 'That does not look like an email address' : undefined,
    password: values.password.length < 8 ? 'Use at least 8 characters' : undefined,
    terms: values.terms ? undefined : 'You need to accept to continue',
  };
  for (const field of extraFields) if (field.required && !values.extra[field.id]?.trim()) errors[`extra.${field.id}`] = `Enter ${field.label.toLowerCase()}`;

  const touch = (key: string) => setTouched((current) => ({ ...current, [key]: true }));
  const show_ = (key: string) => (touched[key] ? errors[key] : undefined);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(Object.fromEntries(Object.keys(errors).map((key) => [key, true])));
    if (Object.values(errors).some(Boolean)) return;
    onSubmit?.(values);
  };

  return (
    <form onSubmit={submit} noValidate className={cn('flex flex-col gap-5', className)}>
      {error ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-name">Full name</Label>
        <Input id="register-name" autoComplete="name" placeholder="Ada Lovelace" value={values.name} disabled={loading} aria-invalid={!!show_('name')} onChange={(event) => setValues({ ...values, name: event.target.value })} onBlur={() => touch('name')} />
        {show_('name') ? <p className="text-xs text-destructive">{show_('name')}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-email">Work email</Label>
        <Input id="register-email" type="email" autoComplete="email" placeholder="you@company.com" value={values.email} disabled={loading} aria-invalid={!!show_('email')} onChange={(event) => setValues({ ...values, email: event.target.value })} onBlur={() => touch('email')} />
        {show_('email') ? <p className="text-xs text-destructive">{show_('email')}</p> : null}
      </div>

      {extraFields.map((field) => (
        <div key={field.id} className="flex flex-col gap-2">
          <Label htmlFor={`register-${field.id}`}>{field.label}</Label>
          <Input
            id={`register-${field.id}`}
            type={field.type ?? 'text'}
            placeholder={field.placeholder}
            value={values.extra[field.id] ?? ''}
            disabled={loading}
            aria-invalid={!!show_(`extra.${field.id}`)}
            onChange={(event) => setValues({ ...values, extra: { ...values.extra, [field.id]: event.target.value } })}
            onBlur={() => touch(`extra.${field.id}`)}
          />
          {show_(`extra.${field.id}`) ? <p className="text-xs text-destructive">{show_(`extra.${field.id}`)}</p> : null}
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative">
          <Input
            id="register-password"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            value={values.password}
            disabled={loading}
            aria-invalid={!!show_('password')}
            className="pr-10"
            onChange={(event) => setValues({ ...values, password: event.target.value })}
            onBlur={() => touch('password')}
          />
          <button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <div className="flex items-center gap-2" aria-live="polite">
          <div className="flex flex-1 gap-1" role="img" aria-label={`Password strength: ${STRENGTH[score]}`}>
            {[1, 2, 3, 4].map((step) => (
              <span key={step} className="h-1 flex-1 rounded-full bg-muted" style={values.password && step <= score ? { background: score <= 1 ? accentColor : '#2e2e2e' } : undefined} />
            ))}
          </div>
          <span className="w-14 text-right text-xs text-muted-foreground">{values.password ? STRENGTH[score] : ''}</span>
        </div>
        {show_('password') ? <p className="text-xs text-destructive">{show_('password')}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Checkbox id="register-terms" className="mt-0.5" checked={values.terms} aria-invalid={!!show_('terms')} onCheckedChange={(checked) => { setValues({ ...values, terms: checked === true }); touch('terms'); }} />
          <Label htmlFor="register-terms" className="text-sm leading-snug font-normal text-muted-foreground">
            {termsLabel}
          </Label>
        </div>
        {show_('terms') ? <p className="text-xs text-destructive">{show_('terms')}</p> : null}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <LoaderCircle className="animate-spin" /> : null}
        {submitLabel}
      </Button>

      {onSwitchToLogin || loginHref ? (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a
            href={loginHref ?? '#'}
            onClick={(event) => {
              if (onSwitchToLogin) {
                event.preventDefault();
                onSwitchToLogin();
              }
            }}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </a>
        </p>
      ) : null}
    </form>
  );
}
```
