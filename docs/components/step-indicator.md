# StepIndicator

Where someone is in a short flow.

A row of numbered steps joined by a line. Finished steps show a tick and can be pressed to go back, the current step takes the accent colour, and on a phone only the current label is shown so the row always fits.

**Category:** Layout and navigation · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add 
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/step-indicator.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<StepIndicator
  steps={[
    { id: 'address', label: 'Address', description: 'Where to deliver' },
    { id: 'area', label: 'Delivery area', description: 'Check we reach you' },
    { id: 'method', label: 'Pickup or door', description: 'How you want it' },
  ]}
  currentId="area"
  onSelect={(id) => setStep(id)}
/>
```

## Anatomy

```tsx
import { StepIndicator, type Step } from '@/components/app/step-indicator';

// You own the current step: keep it in state and pass it as currentId.
// onSelect only fires for steps before the current one.
<StepIndicator steps={steps} currentId={step} onSelect={setStep} />
```

## Examples

### Not interactive

```tsx
<StepIndicator steps={steps} currentId="method" />
```

## API reference

#### StepIndicator

A horizontal progress row.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `steps` | `Step[]` | — | id, label and an optional description for each step, in order. |
| `currentId` | `string` | — | The step being worked on. Earlier steps are drawn as done. |
| `onSelect` | `(id: string) => void` | — | Called when a finished step is pressed. Without it steps are not interactive. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the current step. Inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the list. |

## Source

`src/components/app/step-indicator.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  label: string;
  /** One line under the label, shown on wide screens. */
  description?: string;
}

/**
 * StepIndicator — where someone is in a short flow: checkout, onboarding, a wizard. Finished steps show a tick and can be
 * pressed to go back; the current step is drawn in the accent colour. On a phone only the current label is shown.
 */
export function StepIndicator({
  steps,
  currentId,
  onSelect,
  accentColor = '#ec4899',
  className,
}: {
  steps: Step[];
  currentId: string;
  /** Called when a finished step is pressed. Without it steps are not interactive. */
  onSelect?: (id: string) => void;
  accentColor?: string;
  className?: string;
}) {
  const current = Math.max(0, steps.findIndex((step) => step.id === currentId));

  return (
    <ol className={cn('flex w-full items-start', className)} aria-label="Progress">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const interactive = done && Boolean(onSelect);
        const marker = (
          <>
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs tabular-nums transition-colors',
                done && 'border-transparent bg-foreground text-background',
                !done && !active && 'text-muted-foreground',
              )}
              style={active ? { borderColor: accentColor, color: accentColor, fontWeight: 600 } : undefined}
            >
              {done ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span className={cn('text-left', active ? 'shrink-0' : 'hidden min-w-0 sm:block')}>
              <span className={cn('block text-sm', !active && 'truncate', active ? 'font-bold' : done ? 'font-medium' : 'text-muted-foreground')}>{step.label}</span>
              {step.description ? <span className="hidden truncate text-xs text-muted-foreground md:block">{step.description}</span> : null}
            </span>
          </>
        );
        return (
          <li key={step.id} className={cn('flex items-center', active ? 'shrink-0' : 'min-w-0', index < steps.length - 1 ? 'flex-1' : 'shrink-0')} aria-current={active ? 'step' : undefined}>
            {interactive ? (
              <button type="button" onClick={() => onSelect?.(step.id)} className="flex min-w-0 items-center gap-2.5 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                {marker}
              </button>
            ) : (
              <div className="flex min-w-0 items-center gap-2.5">{marker}</div>
            )}
            {index < steps.length - 1 ? <span className={cn('mx-2 h-px min-w-2 flex-1 sm:mx-3', done ? 'bg-foreground' : 'bg-border')} aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}
```
