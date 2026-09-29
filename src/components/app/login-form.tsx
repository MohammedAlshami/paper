'use client';

import * as React from 'react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface AuthProvider {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * LoginForm — email and password, with show/hide, remember me and optional social buttons. Validation is client-side
 * and shows on blur and on submit; signing in is yours: return from `onSubmit`, and pass `error` if it fails.
 */
export function LoginForm({
  defaultValues,
  providers = [],
  onSubmit,
  onProvider,
  onForgotPassword,
  forgotPasswordHref,
  onSwitchToRegister,
  registerHref,
  loading = false,
  error,
  submitLabel = 'Sign in',
  className,
}: {
  defaultValues?: Partial<LoginValues>;
  providers?: AuthProvider[];
  onSubmit?: (values: LoginValues) => void;
  onProvider?: (provider: AuthProvider) => void;
  onForgotPassword?: () => void;
  forgotPasswordHref?: string;
  onSwitchToRegister?: () => void;
  registerHref?: string;
  /** Disables the form and shows a spinner on the submit button. */
  loading?: boolean;
  /** A failure from your API, e.g. "Wrong email or password". */
  error?: string;
  submitLabel?: string;
  className?: string;
}) {
  const [values, setValues] = React.useState<LoginValues>({ email: '', password: '', remember: false, ...defaultValues });
  const [touched, setTouched] = React.useState<{ email?: boolean; password?: boolean }>({});
  const [show, setShow] = React.useState(false);

  const errors = {
    email: !values.email ? 'Enter your email' : !EMAIL.test(values.email) ? 'That does not look like an email address' : undefined,
    password: !values.password ? 'Enter your password' : undefined,
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) return;
    onSubmit?.(values);
  };

  return (
    <form onSubmit={submit} noValidate className={cn('flex flex-col gap-5', className)}>
      {providers.length ? (
        <>
          <div className={cn('grid gap-2', providers.length > 1 && 'sm:grid-cols-2')}>
            {providers.map((provider) => (
              <Button key={provider.id} type="button" variant="outline" disabled={loading} onClick={() => onProvider?.(provider)}>
                {provider.icon}
                {provider.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or with email
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={values.email}
          disabled={loading}
          aria-invalid={touched.email && !!errors.email}
          onChange={(event) => setValues({ ...values, email: event.target.value })}
          onBlur={() => setTouched({ ...touched, email: true })}
        />
        {touched.email && errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          {forgotPasswordHref || onForgotPassword ? (
            <a
              href={forgotPasswordHref ?? '#'}
              onClick={(event) => {
                if (onForgotPassword) {
                  event.preventDefault();
                  onForgotPassword();
                }
              }}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </a>
          ) : null}
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            value={values.password}
            disabled={loading}
            aria-invalid={touched.password && !!errors.password}
            className="pr-10"
            onChange={(event) => setValues({ ...values, password: event.target.value })}
            onBlur={() => setTouched({ ...touched, password: true })}
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {touched.password && errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="login-remember" checked={values.remember} onCheckedChange={(checked) => setValues({ ...values, remember: checked === true })} />
        <Label htmlFor="login-remember" className="font-normal text-muted-foreground">
          Keep me signed in
        </Label>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <LoaderCircle className="animate-spin" /> : null}
        {submitLabel}
      </Button>

      {onSwitchToRegister || registerHref ? (
        <p className="text-center text-sm text-muted-foreground">
          No account yet?{' '}
          <a
            href={registerHref ?? '#'}
            onClick={(event) => {
              if (onSwitchToRegister) {
                event.preventDefault();
                onSwitchToRegister();
              }
            }}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </a>
        </p>
      ) : null}
    </form>
  );
}
