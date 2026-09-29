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
