'use client';

import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { initials } from './app-kit';

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company?: string;
}

/** TestimonialGrid — customer quotes in a responsive grid: one column on a phone, two, then three. */
export function TestimonialGrid({
  testimonials,
  title,
  description,
  className,
}: {
  testimonials: Testimonial[];
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col gap-8', className)}>
      {title || description ? (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center">
          {title ? <h2 className="text-3xl font-medium tracking-tight text-balance">{title}</h2> : null}
          {description ? <p className="text-base text-muted-foreground text-pretty">{description}</p> : null}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item) => (
          <figure key={item.id} className="flex flex-col justify-between gap-6 rounded-xl border bg-card p-5">
            <blockquote className="text-sm leading-relaxed text-pretty">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback>{initials(item.name)}</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{item.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {item.role}
                  {item.company ? `, ${item.company}` : ''}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
