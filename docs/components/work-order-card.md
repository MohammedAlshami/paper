# WorkOrderCard

One repair job: where it is, who has it, what it costs so far.

The status as a five-step bar, priority, technician and bay, a task checklist you can tick, and parts, labour and total cost. A primary action moves the job to its next status.

**Category:** Work orders and repairs · **Family:** fleet · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge button card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/work-order-card.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/fleet/work-order-card.tsx`, `src/components/fleet/fleet-kit.ts`

## Usage

```tsx
<WorkOrderCard
  order={{
    id: 'WO-2261',
    title: 'Replace front brake pads and rotors',
    vehicle: 'Van 21 · 6HJP118',
    status: 'in-bay',
    priority: 'urgent',
    technician: 'Tomas Reyes',
    bay: 'Bay 2',
    openedOn: '2026-09-26',
    tasks: [{ id: 't1', label: 'Lift and remove front wheels', done: true }],
    parts: [{ id: 'p1', name: 'Front brake rotor', qty: 2, unitCost: 68.5 }],
    laborHours: 3.5,
    laborRate: 95,
  }}
  onAdvance={(status) => api.setStatus('WO-2261', status)}
/>
```

## Anatomy

```tsx
import { WorkOrderCard, WORK_ORDER_STATUSES, type WorkOrder } from '@/components/fleet/work-order-card';

// status: 'requested' | 'scheduled' | 'in-bay' | 'waiting-parts' | 'done'
// priority: 'low' | 'normal' | 'high' | 'urgent'
// The card keeps its own copy of the ticks and the status; use the callbacks to persist them.
<WorkOrderCard order={order} onAdvance={advance} />
```

## Examples

### Just requested

```tsx
<WorkOrderCard order={{ ...order, status: 'requested', technician: undefined, bay: undefined }} />
```

## API reference

#### WorkOrderCard

A single job.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `order` | `WorkOrder` | — | id, title, vehicle, status, priority, technician?, bay?, openedOn, tasks, parts, laborHours and laborRate. |
| `currency` | `string` | `'USD'` | An ISO currency code, used to format money. |
| `onToggleTask` | `(task, done: boolean) => void` | — | Called when a task is ticked or unticked. |
| `onAdvance` | `(next: WorkOrderStatus) => void` | — | Called when the action moves the job to its next status. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the current step and urgent priority. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/work-order-card.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check, Clock, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate, formatMoney, initials } from './fleet-kit';

export type WorkOrderStatus = 'requested' | 'scheduled' | 'in-bay' | 'waiting-parts' | 'done';
export type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export const WORK_ORDER_STATUSES: { id: WorkOrderStatus; label: string }[] = [
  { id: 'requested', label: 'Requested' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'in-bay', label: 'In bay' },
  { id: 'waiting-parts', label: 'Waiting for parts' },
  { id: 'done', label: 'Done' },
];

export interface WorkOrder {
  id: string;
  title: string;
  vehicle: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  technician?: string;
  bay?: string;
  /** ISO date. */
  openedOn: string;
  tasks: { id: string; label: string; done: boolean }[];
  parts: { id: string; name: string; qty: number; unitCost: number }[];
  laborHours: number;
  laborRate: number;
}

/** WorkOrderCard — one repair job: where it is, who has it, what is left to do, and what it costs so far. */
export function WorkOrderCard({
  order,
  currency = 'USD',
  onToggleTask,
  onAdvance,
  accentColor = '#ec4899',
  className,
}: {
  order: WorkOrder;
  currency?: string;
  /** Called when a task is ticked or unticked. The card keeps its own copy of the ticks. */
  onToggleTask?: (task: WorkOrder['tasks'][number], done: boolean) => void;
  /** Called when the primary action moves the job to its next status. */
  onAdvance?: (next: WorkOrderStatus) => void;
  accentColor?: string;
  className?: string;
}) {
  const [done, setDone] = React.useState<Record<string, boolean>>(() => Object.fromEntries(order.tasks.map((task) => [task.id, task.done])));
  const [status, setStatus] = React.useState(order.status);

  const statusIndex = WORK_ORDER_STATUSES.findIndex((item) => item.id === status);
  const next = WORK_ORDER_STATUSES[statusIndex + 1];
  const tasksDone = order.tasks.filter((task) => done[task.id]).length;
  const partsTotal = order.parts.reduce((sum, part) => sum + part.qty * part.unitCost, 0);
  const laborTotal = order.laborHours * order.laborRate;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">{order.id}</p>
          <h3 className="mt-0.5 text-base font-bold leading-tight">{order.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.vehicle} · opened {formatDate(order.openedOn, { day: 'numeric', month: 'short' })}
          </p>
        </div>
        <Badge variant={order.priority === 'urgent' || order.priority === 'high' ? 'default' : 'outline'} className="shrink-0 capitalize" style={order.priority === 'urgent' ? { background: accentColor } : undefined}>
          {order.priority}
        </Badge>
      </div>

      <ol className="grid gap-1 px-4 pb-4" style={{ gridTemplateColumns: `repeat(${WORK_ORDER_STATUSES.length}, minmax(0, 1fr))` }} aria-label="Status">
        {WORK_ORDER_STATUSES.map((item, index) => (
          <li key={item.id} className="space-y-1">
            <span className="block h-1 rounded-full" style={{ background: index < statusIndex ? '#2e2e2e' : index === statusIndex ? accentColor : 'var(--muted)' }} />
            <span className={cn('hidden truncate text-[10px] sm:block', index === statusIndex ? 'font-semibold text-foreground' : 'text-muted-foreground')}>{item.label}</span>
          </li>
        ))}
      </ol>
      <p className="-mt-2 px-4 pb-3 text-xs font-semibold sm:hidden">{WORK_ORDER_STATUSES[statusIndex].label}</p>

      <div className="flex items-center gap-3 border-t px-4 py-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{order.technician ? initials(order.technician) : <Wrench className="size-4 text-muted-foreground" />}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{order.technician ?? 'Unassigned'}</p>
          <p className="truncate text-xs text-muted-foreground">{order.bay ?? 'No bay yet'}</p>
        </div>
        <span className="flex items-center gap-1 font-mono text-xs tabular-nums text-muted-foreground">
          <Clock className="size-3.5" />
          {order.laborHours}h
        </span>
      </div>

      <div className="border-t px-4 py-3">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Tasks</span>
          <span className="font-mono tabular-nums text-muted-foreground">
            {tasksDone}/{order.tasks.length}
          </span>
        </div>
        <ul className="space-y-0.5">
          {order.tasks.map((task) => (
            <li key={task.id}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded px-1 py-1.5 text-sm hover:bg-muted/50">
                <input
                  type="checkbox"
                  checked={Boolean(done[task.id])}
                  onChange={(event) => {
                    setDone((current) => ({ ...current, [task.id]: event.target.checked }));
                    onToggleTask?.(task, event.target.checked);
                  }}
                  className="size-4 shrink-0"
                  style={{ accentColor }}
                />
                <span className={cn('min-w-0 flex-1', done[task.id] && 'text-muted-foreground line-through decoration-muted-foreground/40')}>{task.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <dl className="grid grid-cols-3 divide-x border-t text-sm">
        {[
          { label: 'Parts', value: partsTotal },
          { label: `Labour · ${order.laborHours}h`, value: laborTotal },
          { label: 'Total', value: partsTotal + laborTotal, strong: true },
        ].map((cell) => (
          <div key={cell.label} className="px-3 py-3">
            <dt className="truncate text-[11px] text-muted-foreground">{cell.label}</dt>
            <dd className={cn('mt-0.5 font-mono tabular-nums', cell.strong ? 'font-semibold' : 'text-muted-foreground')}>{formatMoney(cell.value, currency)}</dd>
          </div>
        ))}
      </dl>

      {next ? (
        <div className="border-t p-3">
          <Button
            className="w-full"
            onClick={() => {
              setStatus(next.id);
              onAdvance?.(next.id);
            }}
          >
            Move to {next.label.toLowerCase()}
          </Button>
        </div>
      ) : (
        <p className="flex items-center justify-center gap-1.5 border-t px-4 py-3 text-sm text-muted-foreground">
          <Check className="size-4" /> Completed
        </p>
      )}
    </Card>
  );
}
```
