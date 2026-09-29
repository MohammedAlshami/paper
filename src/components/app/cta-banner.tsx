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
