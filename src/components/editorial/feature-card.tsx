import * as React from 'react';
import { cn } from '@/lib/utils';
import { Illustration, type IllustrationName } from './illustration';

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  illustration?: IllustrationName;
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}

/** Capability card: an illustration (or icon), a title and a short body. */
export function FeatureCard({ className, illustration, icon, title, children, ...props }: FeatureCardProps) {
  return (
    <div
      className={cn(
        'rounded-paper-lg border border-dashed border-line bg-raised/70 p-6',
        'transition-colors hover:border-line-strong',
        className,
      )}
      {...props}
    >
      {illustration ? (
        <Illustration name={illustration} className="mb-5 h-16 w-16" />
      ) : icon ? (
        <div className="mb-5 text-ink-muted [&_svg]:size-6">{icon}</div>
      ) : null}
      <h3 className="font-display text-lg font-bold tracking-tight text-ink">{title}</h3>
      {children ? <p className="mt-2 text-sm leading-relaxed text-ink-muted">{children}</p> : null}
    </div>
  );
}
