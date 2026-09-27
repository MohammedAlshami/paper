import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/** Multi-line input, matching the Input surface. */
export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full resize-y rounded-paper border border-dashed border-line bg-raised/60 px-3.5 py-3 text-sm leading-relaxed text-ink',
        'placeholder:text-ink-faint',
        'transition-colors hover:border-line-strong',
        'focus:border-solid focus:border-ink focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
