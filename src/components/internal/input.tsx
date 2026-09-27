import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/** Text input with a dashed hairline that firms up on focus. */
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-paper border border-dashed border-line bg-raised/60 px-3.5 text-sm text-ink',
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
