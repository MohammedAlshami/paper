'use client';

import * as React from 'react';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
  /** Milliseconds before it goes away. 0 keeps it until dismissed. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastApi {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = React.createContext<ToastApi | null>(null);

/** Raise a toast from anywhere under a ToastProvider: `const { toast } = useToast(); toast({ title: 'Saved' })`. */
export function useToast(): ToastApi {
  const api = React.useContext(ToastContext);
  if (!api) throw new Error('useToast needs a <ToastProvider> above it.');
  return api;
}

/**
 * ToastProvider — wraps the app and draws the toasts in a corner. Small, calm, and out of the way: one line and an
 * optional action, gone after a few seconds. Errors stay a little longer and use the accent colour.
 */
export function ToastProvider({ children, accentColor = '#ec4899' }: { children: React.ReactNode; accentColor?: string }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const next = React.useRef(1);

  const dismiss = React.useCallback((id: number) => setToasts((current) => current.filter((item) => item.id !== id)), []);
  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = next.current++;
      setToasts((current) => [...current.slice(-3), { ...options, id }]);
      const duration = options.duration ?? (options.variant === 'error' ? 6000 : 3800);
      if (duration > 0) window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );
  const api = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ol className="pointer-events-none fixed inset-x-3 bottom-3 z-[80] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:bottom-14 sm:items-end" aria-live="polite">
        {toasts.map((item) => {
          const Icon = item.variant === 'success' ? CircleCheck : item.variant === 'error' ? CircleAlert : Info;
          return (
            <li key={item.id} role="status" className={cn('pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-background p-3 pr-2 text-sm shadow-md')}>
              <Icon className="mt-0.5 size-4 shrink-0" style={{ color: item.variant === 'default' ? undefined : accentColor }} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.title}</p>
                {item.description ? <p className="mt-0.5 text-muted-foreground">{item.description}</p> : null}
                {item.action ? (
                  <button
                    type="button"
                    className="mt-1.5 text-xs font-medium underline underline-offset-2"
                    onClick={() => {
                      item.action?.onClick();
                      dismiss(item.id);
                    }}
                  >
                    {item.action.label}
                  </button>
                ) : null}
              </div>
              <button type="button" aria-label="Dismiss" onClick={() => dismiss(item.id)} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-3.5" />
              </button>
            </li>
          );
        })}
      </ol>
    </ToastContext.Provider>
  );
}
