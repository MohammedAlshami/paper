# PricingTable

Plans side by side, with a monthly and yearly toggle.

A row of plan cards under a billing toggle. The price follows the toggle, the featured plan is outlined in the accent colour with a badge, and a plan with no price shows a custom label such as "Let's talk".

**Category:** Billing and teams · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge button
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/pricing-table.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<PricingTable
  plans={[
    { id: 'free', name: 'Starter', monthly: 0, features: ['1 workspace', '3 team members'], cta: 'Start free' },
    { id: 'pro', name: 'Growth', monthly: 32, yearly: 26, featured: true, features: ['Unlimited workspaces', '25 team members'], cta: 'Start trial' },
    { id: 'ent', name: 'Scale', monthly: null, customLabel: "Let's talk", features: ['Single sign-on'], cta: 'Contact sales' },
  ]}
  onSelect={(plan, billing) => startCheckout(plan.id, billing)}
/>
```

## Anatomy

```tsx
import { PricingTable, type PricingPlan } from '@/components/app/pricing-table';

// monthly is the price per month when billed monthly. yearly is the per-month price when billed yearly.
// Set monthly to null for a plan with no public price and give it a customLabel.
<PricingTable plans={plans} onSelect={(plan, billing) => go(plan, billing)} />
```

## Examples

### Monthly by default

```tsx
<PricingTable plans={plans} defaultBilling="monthly" />
```

## API reference

#### PricingTable

Plans and a billing toggle.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `plans` | `PricingPlan[]` | — | id, name, description, monthly, yearly, customLabel, features, cta and featured. |
| `currency` | `string` | `'USD'` | An ISO currency code, used to format money. |
| `defaultBilling` | `'monthly' \| 'yearly'` | `'yearly'` | Which billing period starts selected. |
| `onSelect` | `(plan, billing) => void` | — | Called when a plan button is pressed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the featured plan outline, badge and ticks. Inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the root element. |

## Source

`src/components/app/pricing-table.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatMoney } from './app-kit';

export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  /** Price per month when billed monthly. `null` shows `customLabel` instead of a number. */
  monthly: number | null;
  /** Price per month when billed yearly. Defaults to `monthly`. */
  yearly?: number | null;
  /** Shown instead of a price when `monthly` is null, e.g. "Let's talk". */
  customLabel?: string;
  features: string[];
  cta?: string;
  /** Draws the plan in the accent colour with a badge. */
  featured?: boolean;
}

/** PricingTable — plans side by side, a monthly/yearly toggle, one featured plan, and a call to action on each. */
export function PricingTable({
  plans,
  currency = 'USD',
  defaultBilling = 'yearly',
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  plans: PricingPlan[];
  currency?: string;
  defaultBilling?: 'monthly' | 'yearly';
  onSelect?: (plan: PricingPlan, billing: 'monthly' | 'yearly') => void;
  accentColor?: string;
  className?: string;
}) {
  const [billing, setBilling] = React.useState<'monthly' | 'yearly'>(defaultBilling);

  return (
    <div className={cn('flex flex-col items-center gap-8', className)}>
      <div role="group" aria-label="Billing period" className="inline-flex rounded-full border p-0.5 text-sm">
        {(['monthly', 'yearly'] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={billing === option}
            onClick={() => setBilling(option)}
            className={cn('rounded-full px-4 py-1.5 transition-colors', billing === option ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
          >
            <span className="capitalize">{option}</span>
            {option === 'yearly' ? <span className="ml-1.5 text-xs opacity-70">2 months free</span> : null}
          </button>
        ))}
      </div>

      <div className="grid w-full gap-4 md:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
        {plans.map((plan) => {
          const price = billing === 'yearly' ? (plan.yearly ?? plan.monthly) : plan.monthly;
          return (
            <div
              key={plan.id}
              className={cn('flex flex-col gap-6 rounded-xl border bg-card p-6 text-card-foreground', plan.featured && 'border-transparent')}
              style={plan.featured ? { boxShadow: `0 0 0 1.5px ${accentColor}` } : undefined}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold">{plan.name}</h3>
                  {plan.featured ? (
                    <Badge className="border-transparent text-white" style={{ background: accentColor }}>
                      Most popular
                    </Badge>
                  ) : null}
                </div>
                {plan.description ? <p className="text-sm text-muted-foreground">{plan.description}</p> : null}
              </div>

              <p className="flex h-12 items-baseline gap-1">
                {price === null ? (
                  <span className="text-3xl font-semibold tracking-tight">{plan.customLabel ?? 'Custom'}</span>
                ) : (
                  <>
                    <span className="font-mono text-4xl font-semibold tracking-tight tabular-nums">{formatMoney(price, currency)}</span>
                    <span className="text-sm text-muted-foreground">{price === 0 ? 'forever' : '/ month'}</span>
                  </>
                )}
              </p>

              <Button variant={plan.featured ? 'default' : 'outline'} className="w-full" onClick={() => onSelect?.(plan, billing)} style={plan.featured ? { background: accentColor } : undefined}>
                {plan.cta ?? 'Choose plan'}
              </Button>

              <ul className="space-y-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" style={plan.featured ? { color: accentColor } : undefined} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```
