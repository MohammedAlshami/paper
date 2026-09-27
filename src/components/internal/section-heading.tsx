import * as React from 'react';
import { cn } from '@/lib/utils';
import { Eyebrow } from './eyebrow';

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  size?: 'lg' | 'md';
}

/** Editorial section header: eyebrow, oversized display title, optional standfirst. */
export function SectionHeading({
  className,
  eyebrow,
  title,
  description,
  size = 'lg',
  ...props
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-3xl', className)} {...props}>
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <h2
        className={cn(
          'font-display font-extrabold leading-[0.95] tracking-tight text-ink',
          size === 'lg' ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-3xl sm:text-4xl',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">{description}</p>
      ) : null}
    </div>
  );
}
