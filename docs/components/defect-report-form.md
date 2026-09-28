# DefectReportForm

How a driver reports a problem, in under a minute.

Pick the vehicle, tap what is affected, say how serious it is, describe it, and add a photo (which opens the camera on a phone). It validates before sending and tells the workshop straight away.

**Category:** Work orders and repairs · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button card label textarea
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/defect-report-form.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<DefectReportForm
  vehicles={[{ id: 'v21', name: 'Van 21', plate: '6HJP118' }, { id: 'v12', name: 'Van 12', plate: '8KTR204' }]}
  defaultValues={{ vehicleId: 'v21', system: 'Brakes' }}
  onSubmit={(report) => api.createDefect(report)}
/>
```

## Anatomy

```tsx
import { DefectReportForm, type DefectReport } from '@/components/fleet/defect-report-form';

// report: { vehicleId, system, severity: 'minor' | 'attention' | 'unsafe', description, photo?: File }
// systems defaults to Brakes, Engine, Tyres, Lights, Steering, Body, Cab, Other; pass your own list.
<DefectReportForm vehicles={vehicles} onSubmit={submit} />
```

## Examples

### A blank report

```tsx
<DefectReportForm vehicles={vehicles} />
```

## API reference

#### DefectReportForm

A short report form.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `vehicles` | `{ id; name; plate? }[]` | — | The vehicles a driver can report on. |
| `systems` | `string[]` | `Brakes, Engine, Tyres, Lights, Steering, Body, Cab, Other` | The choices for what is affected. |
| `defaultValues` | `Partial<DefectReport>` | — | Start with a vehicle, system, severity or description filled in. |
| `onSubmit` | `(report: DefectReport) => void` | — | Called with a valid report. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the unsafe option and validation messages. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/defect-report-form.tsx`

```tsx
'use client';

import * as React from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export type DefectSeverity = 'minor' | 'attention' | 'unsafe';

export interface DefectReport {
  vehicleId: string;
  system: string;
  severity: DefectSeverity;
  description: string;
  photo?: File;
}

const SEVERITIES: { id: DefectSeverity; label: string; hint: string }[] = [
  { id: 'minor', label: 'Minor', hint: 'Fix at the next service' },
  { id: 'attention', label: 'Needs attention', hint: 'Fix this week' },
  { id: 'unsafe', label: 'Unsafe', hint: 'Do not drive' },
];

/** DefectReportForm — how a driver reports a problem: which vehicle, which system, how bad, and a photo. */
export function DefectReportForm({
  vehicles,
  systems = ['Brakes', 'Engine', 'Tyres', 'Lights', 'Steering', 'Body', 'Cab', 'Other'],
  defaultValues,
  onSubmit,
  accentColor = '#ec4899',
  className,
}: {
  vehicles: { id: string; name: string; plate?: string }[];
  systems?: string[];
  /** Values to start with, e.g. when reporting from a vehicle's own page. */
  defaultValues?: Partial<Pick<DefectReport, 'vehicleId' | 'system' | 'severity' | 'description'>>;
  onSubmit?: (report: DefectReport) => void;
  accentColor?: string;
  className?: string;
}) {
  const [vehicleId, setVehicleId] = React.useState(defaultValues?.vehicleId ?? vehicles[0]?.id ?? '');
  const [system, setSystem] = React.useState<string | null>(defaultValues?.system ?? null);
  const [severity, setSeverity] = React.useState<DefectSeverity>(defaultValues?.severity ?? 'attention');
  const [description, setDescription] = React.useState(defaultValues?.description ?? '');
  const [photo, setPhoto] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const id = React.useId();

  React.useEffect(() => {
    if (!photo) return setPreview(null);
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const problems = { system: !system, description: description.trim().length < 5 };
  const valid = !problems.system && !problems.description;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          if (!valid || !system) return;
          onSubmit?.({ vehicleId, system, severity, description: description.trim(), ...(photo ? { photo } : {}) });
          setSent(true);
        }}
        className="space-y-5 p-4"
      >
        <div>
          <h3 className="text-base font-bold">Report a defect</h3>
          <p className="text-sm text-muted-foreground">The workshop sees this straight away.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-vehicle`}>Vehicle</Label>
          <select id={`${id}-vehicle`} value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs">
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
                {vehicle.plate ? ` · ${vehicle.plate}` : ''}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium">What is affected?</legend>
          <div className="flex flex-wrap gap-1.5">
            {systems.map((item) => (
              <button key={item} type="button" onClick={() => setSystem(item)} aria-pressed={system === item} className={cn('rounded-full border px-3 py-1 text-sm transition-colors', system === item ? 'border-transparent bg-foreground text-background' : 'hover:bg-muted')}>
                {item}
              </button>
            ))}
          </div>
          {touched && problems.system ? <p className="text-xs" style={{ color: accentColor }}>Choose what is affected.</p> : null}
        </fieldset>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium">How serious is it?</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup">
            {SEVERITIES.map((item) => {
              const on = severity === item.id;
              return (
                <button key={item.id} type="button" role="radio" aria-checked={on} onClick={() => setSeverity(item.id)} className={cn('rounded-lg border p-2.5 text-left transition-colors', on ? 'border-transparent text-white' : 'hover:bg-muted')} style={on ? { background: item.id === 'unsafe' ? accentColor : '#2e2e2e' } : undefined}>
                  <span className="block text-sm font-bold leading-tight">{item.label}</span>
                  <span className={cn('mt-0.5 block text-[11px] leading-tight', on ? 'text-white/80' : 'text-muted-foreground')}>{item.hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-description`}>What happened?</Label>
          <Textarea id={`${id}-description`} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Grinding noise from the front left when braking" className="min-h-24" aria-invalid={touched && problems.description} />
          {touched && problems.description ? <p className="text-xs" style={{ color: accentColor }}>Describe it in a few words.</p> : null}
        </div>

        <div>
          {preview ? (
            <div className="relative w-fit">
              <img src={preview} alt="Attached" className="h-24 rounded-md border object-cover" />
              <button type="button" aria-label="Remove photo" onClick={() => setPhoto(null)} className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background shadow">
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted">
              <Camera className="size-4" /> Add a photo
              <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
            </label>
          )}
        </div>

        {sent ? <p className="text-sm text-muted-foreground">Sent. The workshop has been told.</p> : null}
        <Button type="submit" className="w-full">
          Send report
        </Button>
      </form>
    </Card>
  );
}
```
