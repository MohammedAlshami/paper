'use client';

import * as React from 'react';
import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Dashed-rule accordion with a rotating plus, built on Base UI. */
export function Accordion({ className, ...props }: React.ComponentProps<typeof BaseAccordion.Root>) {
  return <BaseAccordion.Root className={cn('w-full', className)} {...props} />;
}

export function AccordionItem({ className, ...props }: React.ComponentProps<typeof BaseAccordion.Item>) {
  return (
    <BaseAccordion.Item
      className={cn('border-b border-dashed border-line last:border-b-0', className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseAccordion.Trigger>) {
  return (
    <BaseAccordion.Header className="m-0">
      <BaseAccordion.Trigger
        className={cn(
          'group flex w-full items-center justify-between gap-4 py-4 text-left',
          'text-base font-medium tracking-tight text-ink transition-opacity hover:opacity-70',
          className,
        )}
        {...props}
      >
        {children}
        <Plus
          aria-hidden
          className="size-4 shrink-0 text-ink-muted transition-transform duration-200 group-data-panel-open:rotate-45"
        />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

export function AccordionPanel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseAccordion.Panel>) {
  return (
    <BaseAccordion.Panel
      className={cn(
        'h-(--accordion-panel-height) overflow-hidden transition-[height] duration-200 ease-out',
        'data-starting-style:h-0 data-ending-style:h-0',
        className,
      )}
      {...props}
    >
      <div className="pb-5 text-sm leading-relaxed text-ink-muted">{children}</div>
    </BaseAccordion.Panel>
  );
}
