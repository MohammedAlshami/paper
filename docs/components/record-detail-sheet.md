# RecordDetailSheet

One record slides in from the side, so the list keeps its place.

A title, a status badge, labelled fields, optional extra tabs and pinned action buttons. RecordDetail is the body, for use inline in a page or a split view; RecordDetailSheet puts the same body in a side sheet that closes on Escape or a click outside.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge sheet tabs
```

Copy the file below into `src/components/app/record-detail-sheet.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/record-detail-sheet.tsx`

## Usage

```tsx
const [open, setOpen] = React.useState(false);

<RecordDetailSheet
  open={open}
  onOpenChange={setOpen}
  title="Amara Okonkwo"
  subtitle="amara@northwind.example"
  status={{ label: 'Active' }}
  fields={[
    { label: 'Customer id', value: 'cus_8Hq2mVx41', mono: true },
    { label: 'Plan', value: 'Business, billed yearly' },
  ]}
  tabs={[{ id: 'activity', label: 'Activity', content: <ActivityList /> }]}
  actions={<Button size="sm">Message</Button>}
/>
```

## Anatomy

```tsx
import { RecordDetail, RecordDetailSheet } from '@/components/app/record-detail-sheet';

// Both take the same props. The sheet adds open, onOpenChange and side.
// The Details tab is always first and holds the fields; tabs adds more after it.
<RecordDetail title={title} fields={fields} tabs={tabs} actions={actions} />
```

## Examples



## API reference

#### RecordDetail and RecordDetailSheet

The body, and the body inside a sheet.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | The record name. |
| `subtitle` | `string` | — | A line under the name. |
| `status` | `{ label: string; tone?: "default" \| "accent" \| "muted" }` | — | A badge at the top right. |
| `fields` | `RecordField[]` | — | label, value (any node), and mono for ids and numbers. |
| `tabs` | `RecordTab[]` | — | id, label and content. Shown after the Details tab. |
| `actions` | `ReactNode` | — | Buttons pinned to the bottom. |
| `padClose` | `boolean` | `false` | RecordDetail only. Leaves room top right for a close button. The sheet sets it. |
| `open` | `boolean` | — | Sheet only. Whether it is showing. |
| `onOpenChange` | `(open: boolean) => void` | — | Sheet only. Called when it should open or close. |
| `side` | `'right' \| 'left'` | `'right'` | Sheet only. Which edge it slides from. |
| `accentColor` | `string` | `'#ec4899'` | Colour of an accent status badge. Inline styles and charts cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the body, or the sheet. |

## Source

`src/components/app/record-detail-sheet.tsx`

```tsx
'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface RecordField {
  label: string;
  value: React.ReactNode;
  /** Set the value in mono, for ids and numbers. */
  mono?: boolean;
}

export interface RecordTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface RecordDetailProps {
  title: string;
  subtitle?: string;
  status?: { label: string; tone?: 'default' | 'accent' | 'muted' };
  /** The facts about the record, as label and value pairs. */
  fields: RecordField[];
  /** Extra tabs after Details, e.g. Activity or Invoices. */
  tabs?: RecordTab[];
  /** Buttons pinned to the bottom. */
  actions?: React.ReactNode;
  accentColor?: string;
  /** Leave room at the top right for a close button. */
  padClose?: boolean;
  className?: string;
}

/** RecordDetail — the body of a record's detail view: title, status, fields, tabs, and pinned actions. Use it inline or inside the sheet. */
export function RecordDetail({ title, subtitle, status, fields, tabs = [], actions, accentColor = '#ec4899', padClose = false, className }: RecordDetailProps) {
  const details = (
    <dl className="divide-y">
      {fields.map((field) => (
        <div key={field.label} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
          <dt className="shrink-0 text-muted-foreground">{field.label}</dt>
          <dd className={cn('min-w-0 text-right', field.mono && 'font-mono text-xs tabular-nums')}>{field.value}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex items-start justify-between gap-3 border-b px-4 py-4">
        <div className="min-w-0">
          <p className="truncate text-base font-bold">{title}</p>
          {subtitle ? <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {status ? (
          <Badge variant={status.tone === 'muted' ? 'secondary' : status.tone === 'accent' ? 'default' : 'outline'} className={cn('shrink-0', padClose && 'mr-6')} style={status.tone === 'accent' ? { background: accentColor, color: '#fff' } : undefined}>
            {status.label}
          </Badge>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {tabs.length ? (
          <Tabs defaultValue="details">
            <TabsList variant="line" className="-ml-1">
              <TabsTrigger value="details">Details</TabsTrigger>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="details">{details}</TabsContent>
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="pt-2">
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          details
        )}
      </div>
      {actions ? <div className="flex flex-wrap items-center justify-end gap-2 border-t p-4">{actions}</div> : null}
    </div>
  );
}

/** RecordDetailSheet — a record slides in from the side, so the list behind it keeps its place. */
export function RecordDetailSheet({
  open,
  onOpenChange,
  side = 'right',
  className,
  ...record
}: RecordDetailProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'right' | 'left';
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn('w-full gap-0 sm:max-w-md', className)}>
        <SheetHeader className="sr-only">
          <SheetTitle>{record.title}</SheetTitle>
          <SheetDescription>{record.subtitle ?? 'Record details'}</SheetDescription>
        </SheetHeader>
        <RecordDetail {...record} padClose />
      </SheetContent>
    </Sheet>
  );
}
```
