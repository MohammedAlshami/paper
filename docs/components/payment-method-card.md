# PaymentMethodCard

A saved card, without the digits you should not show.

A drawn brand mark, the last four digits, the expiry and the holder, with a Default badge and actions to update, remove or make it the default. An expired card shows its expiry in the accent colour.

**Category:** Billing and teams · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge button card
```

Copy the file below into `src/components/app/payment-method-card.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/payment-method-card.tsx`

## Usage

```tsx
<PaymentMethodCard
  brand="visa"
  last4="4242"
  expMonth={11}
  expYear={2028}
  holder="Nadia Rahman"
  isDefault
  onUpdate={() => editCard(card.id)}
  onRemove={() => removeCard(card.id)}
/>
```

## Anatomy

```tsx
import { PaymentMethodCard } from '@/components/app/payment-method-card';

// Never pass a full card number. Your payment provider gives you brand, last4 and the expiry.
<PaymentMethodCard brand={card.brand} last4={card.last4} expMonth={card.expMonth} expYear={card.expYear} />
```

## Examples

### An expired card

```tsx
<PaymentMethodCard brand="mastercard" last4="0087" expMonth={3} expYear={2025} />
```

## API reference

#### PaymentMethodCard

A card for one saved payment method.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `brand` | `'visa' \| 'mastercard' \| 'amex' \| 'other'` | — | Decides the mark. |
| `last4` | `string` | — | The last four digits. |
| `expMonth` | `number` | — | 1 to 12. |
| `expYear` | `number` | — | Four digits. |
| `holder` | `string` | — | Shown after the expiry. |
| `isDefault` | `boolean` | — | Shows the Default badge and hides Make default. |
| `onUpdate` | `() => void` | — | Called by Update. |
| `onRemove` | `() => void` | — | Called by Remove. |
| `onMakeDefault` | `() => void` | — | Called by Make default. |
| `accentColor` | `string` | `'#ec4899'` | Colour of an expired expiry. Inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/payment-method-card.tsx`

```tsx
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
```
