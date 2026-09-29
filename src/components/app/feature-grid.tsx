'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Feature {
  id: string;
  title: string;
  description: string;
  /** A lucide icon element, e.g. `<Map />`. */
  icon?: React.ReactNode;
}

/** FeatureGrid — a heading and a grid of small tiles, each with an icon, a title and one sentence. */
export function FeatureGrid({
  title,
  description,
  features,
  columns = 3,
  accentColor = '#ec4899',
  className,
}: {
  title?: string;
  description?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  accentColor?: string;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16', className)}>
      {title || description ? (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          {title ? <h2 className="text-3xl font-medium tracking-tight text-balance">{title}</h2> : null}
          {description ? <p className="text-base text-muted-foreground text-pretty">{description}</p> : null}
        </div>
      ) : null}
      <ul className={cn('grid gap-4 sm:grid-cols-2', columns === 3 && 'lg:grid-cols-3', columns === 4 && 'lg:grid-cols-4')}>
        {features.map((feature) => (
          <li key={feature.id} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
            {feature.icon ? (
              <span className="flex size-9 items-center justify-center rounded-lg border [&_svg]:size-4.5" style={{ color: accentColor }}>
                {feature.icon}
              </span>
            ) : null}
            <h3 className="text-base font-bold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
