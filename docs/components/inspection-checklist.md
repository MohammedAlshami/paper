# InspectionChecklist

A pre-trip walk-around: pass, fail or not applicable.

Sections of items, each answered pass, fail or N/A. A fail asks what is wrong. A failed critical item shows a "do not drive" warning and marks the vehicle out of service on submit. Submit stays off until every item is answered.

**Category:** Work orders and repairs · **Family:** fleet · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button card textarea
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/inspection-checklist.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/fleet/inspection-checklist.tsx`

## Usage

```tsx
<InspectionChecklist
  vehicle="Van 12 · 8KTR204"
  sections={[
    { title: 'Outside', items: [{ id: 'lights', label: 'Headlights and indicators work' }] },
    { title: 'In the cab', items: [{ id: 'brakes', label: 'Brakes feel firm', critical: true }] },
  ]}
  onSubmit={(results, outOfService) => api.submitInspection(results, outOfService)}
/>
```

## Anatomy

```tsx
import { InspectionChecklist, type ChecklistSection } from '@/components/fleet/inspection-checklist';

// results: { itemId, result: 'pass' | 'fail' | 'na', note? }[]
// defaultResults resumes a saved draft. The second argument to onSubmit is true when a critical item failed.
<InspectionChecklist vehicle={vehicle} sections={sections} onSubmit={submit} />
```

## Examples

### A critical item fails

```tsx
<InspectionChecklist vehicle="Van 12" sections={sections} defaultResults={{ ...answers, brakes: 'fail' }} defaultNotes={{ brakes: 'Pedal goes to the floor' }} />
```

## API reference

#### InspectionChecklist

A form of pass, fail and N/A answers.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | `'Pre-trip inspection'` | Heading. |
| `vehicle` | `string` | — | The vehicle being inspected. |
| `sections` | `ChecklistSection[]` | — | title and items (id, label, critical?). |
| `defaultResults` | `Record<string, ItemResult>` | `{}` | Answers to start with, by item id. |
| `defaultNotes` | `Record<string, string>` | `{}` | Notes to start with, by item id. |
| `onSubmit` | `(results: InspectionResult[], outOfService: boolean) => void` | — | Called when the inspection is submitted. |
| `accentColor` | `string` | `'#ec4899'` | Colour of failures and the progress bar. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/inspection-checklist.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check, Minus, TriangleAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface ChecklistItem {
  id: string;
  label: string;
  /** A failed critical item takes the vehicle out of service. */
  critical?: boolean;
}

export interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

export type ItemResult = 'pass' | 'fail' | 'na';

export interface InspectionResult {
  itemId: string;
  result: ItemResult;
  note?: string;
}

const OPTIONS: { id: ItemResult; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'pass', label: 'Pass', icon: Check },
  { id: 'fail', label: 'Fail', icon: X },
  { id: 'na', label: 'N/A', icon: Minus },
];

/** InspectionChecklist — a pre-trip walk-around: pass, fail or not applicable for each item, with a note when something fails. */
export function InspectionChecklist({
  title = 'Pre-trip inspection',
  vehicle,
  sections,
  defaultResults = {},
  defaultNotes = {},
  onSubmit,
  accentColor = '#ec4899',
  className,
}: {
  title?: string;
  vehicle: string;
  sections: ChecklistSection[];
  /** Answers to start with, by item id. Use it to resume a saved draft. */
  defaultResults?: Record<string, ItemResult>;
  defaultNotes?: Record<string, string>;
  onSubmit?: (results: InspectionResult[], outOfService: boolean) => void;
  accentColor?: string;
  className?: string;
}) {
  const [results, setResults] = React.useState<Record<string, ItemResult>>(defaultResults);
  const [notes, setNotes] = React.useState<Record<string, string>>(defaultNotes);
  const [submitted, setSubmitted] = React.useState(false);

  const items = sections.flatMap((section) => section.items);
  const answered = items.filter((item) => results[item.id]).length;
  const failed = items.filter((item) => results[item.id] === 'fail');
  const criticalFail = failed.some((item) => item.critical);
  const complete = answered === items.length;

  const set = (id: string, result: ItemResult) => {
    setSubmitted(false);
    setResults((current) => ({ ...current, [id]: result }));
  };

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="border-b px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-bold">{title}</h3>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {answered}/{items.length}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{vehicle}</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${(answered / items.length) * 100}%`, background: failed.length ? accentColor : '#2e2e2e' }} />
        </div>
      </div>

      {sections.map((section) => (
        <section key={section.title}>
          <h4 className="border-b bg-muted/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{section.title}</h4>
          <ul className="divide-y">
            {section.items.map((item) => {
              const value = results[item.id];
              return (
                <li key={item.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <span className="min-w-0 flex-1 text-sm">
                      {item.label}
                      {item.critical ? <span className="ml-1.5 text-[11px] text-muted-foreground">critical</span> : null}
                    </span>
                    <div className="flex shrink-0 gap-1" role="radiogroup" aria-label={item.label}>
                      {OPTIONS.map((option) => {
                        const on = value === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => set(item.id, option.id)}
                            className={cn('flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors', on ? 'border-transparent text-white' : 'hover:bg-muted')}
                            style={on ? { background: option.id === 'fail' ? accentColor : option.id === 'pass' ? '#2e2e2e' : '#a3a3a3' } : undefined}
                          >
                            <option.icon className="size-3.5" /> {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {value === 'fail' ? (
                    <Textarea
                      value={notes[item.id] ?? ''}
                      onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                      placeholder="What is wrong?"
                      aria-label={`Note for ${item.label}`}
                      className="mt-2 min-h-16 text-sm"
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className="space-y-3 border-t p-4">
        {criticalFail ? (
          <p className="flex items-start gap-2 rounded-md border p-3 text-sm" style={{ borderColor: accentColor }}>
            <TriangleAlert className="mt-0.5 size-4 shrink-0" style={{ color: accentColor }} />
            <span>
              <span className="font-bold">Do not drive.</span> A critical item failed, so this vehicle will be marked out of service.
            </span>
          </p>
        ) : null}
        {submitted ? <p className="text-sm text-muted-foreground">Inspection submitted.</p> : null}
        <Button
          className="w-full"
          disabled={!complete}
          onClick={() => {
            setSubmitted(true);
            onSubmit?.(
              items.map((item) => ({ itemId: item.id, result: results[item.id], ...(notes[item.id] ? { note: notes[item.id] } : {}) })),
              criticalFail,
            );
          }}
        >
          {complete ? (failed.length ? `Submit with ${failed.length} ${failed.length === 1 ? 'defect' : 'defects'}` : 'Submit, all clear') : `${items.length - answered} items left`}
        </Button>
      </div>
    </Card>
  );
}
```
