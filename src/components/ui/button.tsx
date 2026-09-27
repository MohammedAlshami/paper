import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'solid' | 'outline' | 'ghost' | 'accent' | 'link';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  solid: 'bg-ink text-paper hover:opacity-90',
  outline: 'border border-dashed border-line-strong text-ink hover:bg-ink/[0.04]',
  ghost: 'text-ink-muted hover:bg-ink/[0.05] hover:text-ink',
  accent: 'bg-accent text-white hover:opacity-90',
  link: 'text-ink underline decoration-dashed underline-offset-4 hover:decoration-solid',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'size-10',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/** Paper button — solid ink by default, dashed outline for secondary actions. */
export function Button({ className, variant = 'solid', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-paper font-medium tracking-tight',
        'transition-[opacity,background-color,color,border-color] disabled:pointer-events-none disabled:opacity-45',
        '[&_svg]:size-4 [&_svg]:shrink-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
