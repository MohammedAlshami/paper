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
