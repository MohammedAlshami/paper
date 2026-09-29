'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** HeroSection — the first screen of a marketing page: an eyebrow, a headline, two actions, a visual, and an optional logo strip. */
export function HeroSection({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  media,
  logos,
  logosLabel = 'Trusted by teams at',
  align = 'center',
  accentColor = '#ec4899',
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  primaryAction?: { label: string; onClick?: () => void; href?: string };
  secondaryAction?: { label: string; onClick?: () => void; href?: string };
  /** Anything: a screenshot, a live component, an illustration. Drawn in a bordered frame below the copy. */
  media?: React.ReactNode;
  /** Company names shown as a quiet strip. */
  logos?: string[];
  logosLabel?: string;
  align?: 'center' | 'left';
  accentColor?: string;
  className?: string;
}) {
  const centered = align === 'center';
  const action = (item: NonNullable<typeof primaryAction>, variant: 'default' | 'outline') => (
    <Button size="lg" variant={variant} onClick={item.onClick} asChild={Boolean(item.href)}>
      {item.href ? <a href={item.href}>{item.label}</a> : item.label}
    </Button>
  );

  return (
    <section className={cn('flex flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16', className)}>
      <div className={cn('flex max-w-2xl flex-col gap-5', centered ? 'mx-auto items-center text-center' : 'items-start')}>
        {eyebrow ? (
          <span className="flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full" style={{ background: accentColor }} aria-hidden />
            {eyebrow}
          </span>
        ) : null}
        <h1 className="text-4xl font-medium tracking-tight text-balance sm:text-5xl">{title}</h1>
        {description ? <p className="max-w-xl text-base text-muted-foreground text-pretty sm:text-lg">{description}</p> : null}
        {primaryAction || secondaryAction ? (
          <div className={cn('flex flex-wrap gap-3', centered && 'justify-center')}>
            {primaryAction ? action(primaryAction, 'default') : null}
            {secondaryAction ? action(secondaryAction, 'outline') : null}
          </div>
        ) : null}
      </div>

      {media ? <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl border bg-muted p-3 sm:p-4">{media}</div> : null}

      {logos?.length ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs text-muted-foreground">{logosLabel}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {logos.map((logo) => (
              <li key={logo} className="text-base font-bold tracking-tight text-muted-foreground/70">
                {logo}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
