import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Join class names, resolving Tailwind conflicts. The one helper every component uses. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
