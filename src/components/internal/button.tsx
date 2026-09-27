import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'outline' | 'ghost' | 'link';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  outline: 'border border-border-strong bg-card text-foreground hover:bg-muted',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  link: 'text-foreground underline underline-offset-4 hover:opacity-70',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-10 px-5 text-sm',
  icon: 'size-9',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/** Solid black by default; hairline outline for secondary actions. */
export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
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
