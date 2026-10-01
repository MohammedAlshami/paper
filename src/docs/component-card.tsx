'use client';

import * as React from 'react';
import { getComponent } from './registry';

/**
 * ComponentCard — just the screenshot until you hover: then the scrim, the name and the
 * tagline fade in, and the shot zooms a touch underneath them.
 */
export function ComponentCard({ id }: { id: string }) {
  const entry = getComponent(id);
  if (!entry) return null;
  return (
    <a
      href={`/components/${entry.id}`}
      className="group relative block overflow-hidden rounded-xl border border-border no-underline"
    >
      <img
        src={`/screenshots/${entry.id}.png`}
        alt={`${entry.name} preview`}
        loading="lazy"
        className="aspect-[4/3] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <span className="absolute inset-x-0 bottom-0 flex translate-y-3 flex-col gap-1 p-5 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 sm:p-6">
        <span className="text-base font-semibold tracking-tight text-white sm:text-lg">{entry.name}</span>
        <span className="text-sm leading-relaxed text-white/75 sm:text-base">{entry.tagline}</span>
      </span>
    </a>
  );
}
