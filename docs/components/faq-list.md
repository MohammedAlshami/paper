# FaqList

Questions that open to their answers.

A bordered list of questions built on the collapsible primitive. Opening one closes the others unless multiple is set; the plus turns to a cross. Answers can be any node, so links work.

**Category:** Marketing pages · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add collapsible
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/faq-list.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<FaqList
  defaultOpenId="q1"
  items={[
    { id: 'q1', question: 'Can I change plans later?', answer: 'Yes. Upgrades apply straight away.' },
    { id: 'q2', question: 'Do you offer refunds?', answer: 'Within 30 days, no questions asked.' },
  ]}
/>
```

## Anatomy

```tsx
import { FaqList, type FaqItem } from '@/components/app/faq-list';

// answer is a ReactNode: a string, or markup with links.
<FaqList items={items} multiple />
```

## Examples

### Several open at once

```tsx
<FaqList items={items} multiple defaultOpenId="q2" />
```

## API reference

#### FaqList

A list of collapsible questions.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `FaqItem[]` | — | id, question and answer. |
| `defaultOpenId` | `string` | — | Which item starts open. |
| `multiple` | `boolean` | `false` | Let several stay open. |
| `className` | `string` | — | Merged onto the root element. |

## Source

`src/components/app/faq-list.tsx`

```tsx
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
```
