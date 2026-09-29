'use client';

import * as React from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * VerifyCodeForm — a one-time code in separate boxes. Typing advances, backspace steps back, arrow keys move, and a
 * pasted code fills every box. `onComplete` fires as soon as the last digit lands; checking it is yours.
 */
export function VerifyCodeForm({
  length = 6,
  onComplete,
  onResend,
  resendSeconds = 30,
  destination,
  loading = false,
  error,
  accentColor = '#ec4899',
  className,
}: {
  length?: number;
  onComplete?: (code: string) => void;
  onResend?: () => void;
  /** Seconds before "Resend" unlocks. 0 unlocks it straight away. */
  resendSeconds?: number;
  /** Where the code went, e.g. "ada@company.com". */
  destination?: string;
  loading?: boolean;
  /** A failure from your API, e.g. "That code is not right". Boxes turn to the accent colour. */
  error?: string;
  accentColor?: string;
  className?: string;
}) {
  const [digits, setDigits] = React.useState<string[]>(() => Array.from({ length }, () => ''));
  const [left, setLeft] = React.useState(resendSeconds);
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (left <= 0) return;
    const timer = window.setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left]);

  const commit = (next: string[]) => {
    setDigits(next);
    if (next.every(Boolean)) onComplete?.(next.join(''));
  };

  const put = (index: number, raw: string) => {
    const chars = raw.replace(/\D/g, '').split('');
    if (!chars.length) return;
    const next = [...digits];
    chars.slice(0, length - index).forEach((char, offset) => {
      next[index + offset] = char;
    });
    commit(next);
    refs.current[Math.min(index + chars.length, length - 1)]?.focus();
  };

  const onKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) next[index] = '';
      else if (index > 0) {
        next[index - 1] = '';
        refs.current[index - 1]?.focus();
      }
      setDigits(next);
    } else if (event.key === 'ArrowLeft') refs.current[index - 1]?.focus();
    else if (event.key === 'ArrowRight') refs.current[index + 1]?.focus();
  };

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {destination ? (
        <p className="text-sm text-muted-foreground">
          We sent a {length}-digit code to <span className="font-medium text-foreground">{destination}</span>.
        </p>
      ) : null}

      <div className="flex justify-between gap-2" role="group" aria-label="One-time code">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            value={digit}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={!!error}
            disabled={loading}
            maxLength={length}
            onChange={(event) => put(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
            onPaste={(event) => {
              event.preventDefault();
              put(0, event.clipboardData.getData('text'));
            }}
            className="h-12 w-full min-w-0 rounded-md border border-input bg-transparent text-center font-mono text-lg font-semibold shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
            style={error ? { borderColor: accentColor, color: accentColor } : undefined}
          />
        ))}
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium" style={{ color: accentColor }}>
          {error}
        </p>
      ) : null}

      <Button type="button" disabled={loading || digits.some((digit) => !digit)} onClick={() => onComplete?.(digits.join(''))} className="w-full">
        {loading ? <LoaderCircle className="animate-spin" /> : null}
        Verify
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Did not get it?{' '}
        <button
          type="button"
          disabled={left > 0}
          onClick={() => {
            setLeft(resendSeconds);
            setDigits(Array.from({ length }, () => ''));
            refs.current[0]?.focus();
            onResend?.();
          }}
          className="font-medium text-foreground underline-offset-4 hover:underline disabled:pointer-events-none disabled:font-normal disabled:text-muted-foreground disabled:no-underline"
        >
          {left > 0 ? `Resend in ${left}s` : 'Resend code'}
        </button>
      </p>
    </div>
  );
}
