'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

/** SiteFooter — the bottom of a marketing page: brand and a line about it, columns of links, and the legal row. */
export function SiteFooter({
  brand,
  tagline,
  columns,
  legal,
  onNavigate,
  accentColor = '#ec4899',
  className,
}: {
  brand: string;
  tagline?: string;
  columns: FooterColumn[];
  /** The small print, e.g. "© 2026 Ledger, Inc." */
  legal?: string;
  onNavigate?: (href: string) => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <footer className={cn('border-t bg-background px-4 py-12 sm:px-6', className)}>
      <div className="flex flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-xs space-y-3">
          <p className="flex items-center gap-2 text-base font-bold tracking-tight">
            <span className="size-2.5 rounded-full" style={{ background: accentColor }} aria-hidden />
            {brand}
          </p>
          {tagline ? <p className="text-sm text-muted-foreground">{tagline}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-16">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="space-y-3">
              <p className="text-sm font-bold">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      onClick={(event) => {
                        if (!onNavigate) return;
                        event.preventDefault();
                        onNavigate(link.href);
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      {legal ? <p className="mt-10 border-t pt-6 text-xs text-muted-foreground">{legal}</p> : null}
    </footer>
  );
}
