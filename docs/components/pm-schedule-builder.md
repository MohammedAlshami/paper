# PMScheduleBuilder

Set the maintenance intervals once, per vehicle class.

A tab per vehicle class, with its tasks as editable rows: every N kilometres, every N months, whichever comes first. Add and remove tasks, see when there are unsaved changes, and save the whole schedule.

**Category:** Maintenance scheduling · **Family:** fleet · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add button card input
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/pm-schedule-builder.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/fleet/pm-schedule-builder.tsx`

## Usage

```tsx
<PMScheduleBuilder
  defaultValue={[
    { id: 'van', name: 'Vans', vehicleCount: 5, tasks: [
      { id: 'oil', task: 'Oil and filter', everyKm: 12000, everyMonths: 6 },
      { id: 'rot', task: 'Tyre rotation', everyKm: 15000 },
    ] },
  ]}
  onSave={(schedule) => api.saveSchedule(schedule)}
/>
```

## Anatomy

```tsx
import { PMScheduleBuilder, type PMClass } from '@/components/fleet/pm-schedule-builder';

// A task with only everyKm is distance-based; with only everyMonths it is date-based; with both, whichever is first.
// The component holds the edits. onChange fires on every edit, onSave on Save.
<PMScheduleBuilder defaultValue={schedule} onSave={save} />
```

## Examples

### One class

```tsx
<PMScheduleBuilder defaultValue={schedule.slice(1, 2)} />
```

## API reference

#### PMScheduleBuilder

An editable schedule. It keeps its own copy; use onChange and onSave to read it.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultValue` | `PMClass[]` | — | Each class has id, name, vehicleCount and tasks (id, task, everyKm?, everyMonths?). |
| `onChange` | `(schedule: PMClass[]) => void` | — | Fires on every edit with the whole schedule. |
| `onSave` | `(schedule: PMClass[]) => void` | — | Called when Save schedule is pressed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the unsaved-changes dot. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/pm-schedule-builder.tsx`

```tsx
'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface PMTask {
  id: string;
  task: string;
  /** Repeat every N kilometres. Leave empty for date-only tasks. */
  everyKm?: number;
  /** Repeat every N months. Leave empty for distance-only tasks. */
  everyMonths?: number;
}

export interface PMClass {
  id: string;
  name: string;
  /** How many vehicles this schedule applies to. */
  vehicleCount: number;
  tasks: PMTask[];
}

/** PMScheduleBuilder — set preventive-maintenance intervals per vehicle class: every N km, every N months, whichever first. */
export function PMScheduleBuilder({
  defaultValue,
  onChange,
  onSave,
  accentColor = '#ec4899',
  className,
}: {
  defaultValue: PMClass[];
  /** Fires on every edit with the whole schedule. */
  onChange?: (schedule: PMClass[]) => void;
  onSave?: (schedule: PMClass[]) => void;
  accentColor?: string;
  className?: string;
}) {
  const [schedule, setSchedule] = React.useState(defaultValue);
  const [activeId, setActiveId] = React.useState(defaultValue[0]?.id);
  const [dirty, setDirty] = React.useState(false);
  const active = schedule.find((item) => item.id === activeId) ?? schedule[0];

  const update = (next: PMClass[]) => {
    setSchedule(next);
    setDirty(true);
    onChange?.(next);
  };
  const editTask = (taskId: string, patch: Partial<PMTask>) =>
    update(schedule.map((item) => (item.id === active.id ? { ...item, tasks: item.tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task)) } : item)));
  const number = (value: string) => (value.trim() === '' ? undefined : Math.max(0, Number(value) || 0));

  if (!active) return null;

  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <div className="flex gap-1 overflow-x-auto border-b p-2" role="tablist" aria-label="Vehicle classes">
        {schedule.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === active.id}
            onClick={() => setActiveId(item.id)}
            className={cn('shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors', item.id === active.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted')}
          >
            {item.name} <span className="font-mono text-xs opacity-70">{item.vehicleCount}</span>
          </button>
        ))}
      </div>

      <div className="px-4 pb-1 pt-3">
        <p className="text-sm font-bold">{active.name} schedule</p>
        <p className="text-xs text-muted-foreground">Applies to {active.vehicleCount} vehicles. A task is due at whichever limit is reached first.</p>
      </div>

      <div className="hidden grid-cols-[1fr_7rem_7rem_2rem] gap-2 px-4 pb-1 pt-2 text-xs text-muted-foreground @lg:grid">
        <span>Task</span>
        <span>Every (km)</span>
        <span>Every (months)</span>
        <span />
      </div>
      <ul className="divide-y">
        {active.tasks.map((task) => (
          <li key={task.id} className="grid grid-cols-2 items-center gap-2 px-4 py-2.5 @lg:grid-cols-[1fr_7rem_7rem_2rem]">
            <Input value={task.task} onChange={(event) => editTask(task.id, { task: event.target.value })} aria-label="Task" className="col-span-2 font-medium @lg:col-span-1" />
            <label className="block @lg:contents">
              <span className="text-[11px] text-muted-foreground @lg:sr-only">Every (km)</span>
              <Input value={task.everyKm ?? ''} inputMode="numeric" placeholder="none" onChange={(event) => editTask(task.id, { everyKm: number(event.target.value) })} aria-label={`${task.task}: every km`} className="font-mono tabular-nums" />
            </label>
            <label className="block @lg:contents">
              <span className="text-[11px] text-muted-foreground @lg:sr-only">Every (months)</span>
              <Input value={task.everyMonths ?? ''} inputMode="numeric" placeholder="none" onChange={(event) => editTask(task.id, { everyMonths: number(event.target.value) })} aria-label={`${task.task}: every months`} className="font-mono tabular-nums" />
            </label>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove ${task.task}`}
              onClick={() => update(schedule.map((item) => (item.id === active.id ? { ...item, tasks: item.tasks.filter((other) => other.id !== task.id) } : item)))}
              className="col-start-2 justify-self-end @lg:col-start-auto"
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => update(schedule.map((item) => (item.id === active.id ? { ...item, tasks: [...item.tasks, { id: `task-${Date.now()}`, task: 'New task', everyKm: 10000 }] } : item)))}
        >
          <Plus /> Add task
        </Button>
        <div className="flex items-center gap-3">
          {dirty ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full" style={{ background: accentColor }} /> Unsaved changes
            </span>
          ) : null}
          <Button
            size="sm"
            disabled={!dirty}
            onClick={() => {
              onSave?.(schedule);
              setDirty(false);
            }}
          >
            Save schedule
          </Button>
        </div>
      </div>
    </Card>
  );
}
```
