'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export interface FaqItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

/** FaqList — questions that open to their answers. One open at a time by default; the plus turns to a cross. */
export function FaqList({
  items,
  defaultOpenId,
  multiple = false,
  className,
}: {
  items: FaqItem[];
  defaultOpenId?: string;
  /** Let several stay open at once. */
  multiple?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState<string[]>(defaultOpenId ? [defaultOpenId] : []);
  const toggle = (id: string, next: boolean) =>
    setOpen((current) => (next ? (multiple ? [...current, id] : [id]) : current.filter((item) => item !== id)));

  return (
    <div className={cn('divide-y rounded-xl border bg-card', className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <Collapsible key={item.id} open={isOpen} onOpenChange={(next) => toggle(item.id, next)}>
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium">
              {item.question}
              <Plus className={cn('size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-45')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-5 pb-4 text-sm text-muted-foreground">{item.answer}</CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
