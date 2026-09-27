import * as React from 'react';
import { cn } from '@/lib/utils';
import { Illustration, type IllustrationName } from './illustration';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  illustration?: IllustrationName;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  compact?: boolean;
}

/** Illustrated empty state — the thing most libraries ship as a grey box, if at all. */
export function EmptyState({
  className,
  illustration = 'thinking',
  title,
  description,
  actions,
  compact = false,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-paper-lg border border-dashed border-line bg-raised/50 text-center',
        compact ? 'gap-3 px-6 py-10' : 'gap-4 px-6 py-16',
        className,
      )}
      {...props}
    >
      <Illustration name={illustration} className={compact ? 'h-20 w-20' : 'h-32 w-32'} />
      <h3
        className={cn(
          'font-display font-bold tracking-tight text-ink',
          compact ? 'text-base' : 'text-xl',
        )}
      >
        {title}
      </h3>
      {description ? (
        <p className="max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>
      ) : null}
      {actions ? <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{actions}</div> : null}
    </div>
  );
}
