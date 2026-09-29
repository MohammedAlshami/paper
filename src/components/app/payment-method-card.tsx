'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'other';

/** A small drawn brand mark, so no images are needed. */
function BrandMark({ brand }: { brand: CardBrand }) {
  return (
    <span aria-hidden className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md border bg-background">
      {brand === 'mastercard' ? (
        <svg viewBox="0 0 32 20" className="h-5 w-8">
          <circle cx="12" cy="10" r="7" fill="#2e2e2e" />
          <circle cx="20" cy="10" r="7" fill="#a3a3a3" fillOpacity="0.85" />
        </svg>
      ) : (
        <span className="font-mono text-[10px] font-bold tracking-wider uppercase">{brand === 'other' ? 'Card' : brand === 'amex' ? 'Amex' : 'Visa'}</span>
      )}
    </span>
  );
}

/** PaymentMethodCard — a saved card: brand, last four digits, expiry, and what you can do with it. */
export function PaymentMethodCard({
  brand,
  last4,
  expMonth,
  expYear,
  holder,
  isDefault,
  onUpdate,
  onRemove,
  onMakeDefault,
  accentColor = '#ec4899',
  className,
}: {
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  holder?: string;
  isDefault?: boolean;
  onUpdate?: () => void;
  onRemove?: () => void;
  onMakeDefault?: () => void;
  accentColor?: string;
  className?: string;
}) {
  const now = new Date();
  const expired = expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1);
  return (
    <Card className={cn('gap-0 py-0', className)}>
      <div className="flex items-center gap-3 p-4">
        <BrandMark brand={brand} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-medium">
            <span className="capitalize">{brand === 'other' ? 'Card' : brand}</span>
            <span className="font-mono tabular-nums">•••• {last4}</span>
          </p>
          <p className="truncate text-xs text-muted-foreground" style={expired ? { color: accentColor, fontWeight: 600 } : undefined}>
            {expired ? 'Expired' : 'Expires'} {String(expMonth).padStart(2, '0')}/{String(expYear).slice(-2)}
            {holder ? ` · ${holder}` : ''}
          </p>
        </div>
        {isDefault ? <Badge variant="outline">Default</Badge> : null}
      </div>
      <div className="flex flex-wrap justify-end gap-1 border-t p-2">
        {!isDefault ? (
          <Button variant="ghost" size="sm" onClick={onMakeDefault}>
            Make default
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onClick={onUpdate}>
          Update
        </Button>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </Card>
  );
}
