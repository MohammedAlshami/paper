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
