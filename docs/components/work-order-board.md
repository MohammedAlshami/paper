# WorkOrderBoard

Every job in its column. Drag it on, or use the menu.

A kanban of work orders by status. Drag a card to another column, or use the status menu on each card, which is what touchscreens use. Columns scroll sideways on a phone and snap into place.

**Category:** Work orders and repairs · **Family:** fleet · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/fleet/work-order-board.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/fleet/work-order-board.tsx`, `src/components/fleet/fleet-kit.ts`, `src/components/fleet/work-order-card.tsx`

## Usage

```tsx
<WorkOrderBoard
  orders={orders}
  onMove={(order, status) => api.setStatus(order.id, status)}
  onOpen={(order) => openWorkOrder(order.id)}
/>
```

## Anatomy

```tsx
import { WorkOrderBoard, type BoardOrder } from '@/components/fleet/work-order-board';

// Shares its status list with work-order-card.tsx, so copy that file too.
// Dragging uses the browser's own drag and drop; the status menu covers touch and keyboards.
<WorkOrderBoard orders={orders} onMove={move} />
```

## Examples

### Only open work

```tsx
<WorkOrderBoard orders={orders.filter((order) => order.status !== 'done')} />
```

## API reference

#### WorkOrderBoard

Columns of cards.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orders` | `BoardOrder[]` | — | id, title, vehicle, status, priority, technician? and openedOn. |
| `onMove` | `(order: BoardOrder, status: WorkOrderStatus) => void` | — | Called when a card lands in another column. |
| `onOpen` | `(order: BoardOrder) => void` | — | Called when a card is pressed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the drop target and urgent jobs. Charts and inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/fleet/work-order-board.tsx`

```tsx
'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate } from './fleet-kit';
import { WORK_ORDER_STATUSES, type WorkOrderPriority, type WorkOrderStatus } from './work-order-card';

export interface BoardOrder {
  id: string;
  title: string;
  vehicle: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  technician?: string;
  /** ISO date. */
  openedOn: string;
}

/**
 * WorkOrderBoard — every job in its column. Drag a card to another column, or use the status menu on the card,
 * which is what touchscreens use.
 */
export function WorkOrderBoard({
  orders,
  onMove,
  onOpen,
  accentColor = '#ec4899',
  className,
}: {
  orders: BoardOrder[];
  onMove?: (order: BoardOrder, status: WorkOrderStatus) => void;
  onOpen?: (order: BoardOrder) => void;
  accentColor?: string;
  className?: string;
}) {
  const [items, setItems] = React.useState(orders);
  const [overColumn, setOverColumn] = React.useState<WorkOrderStatus | null>(null);

  const move = (id: string, status: WorkOrderStatus) => {
    const order = items.find((item) => item.id === id);
    if (!order || order.status === status) return;
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    onMove?.(order, status);
  };

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex snap-x snap-mandatory gap-3 relative overflow-x-auto p-3 @container">
        {WORK_ORDER_STATUSES.map((column) => {
          const cards = items.filter((item) => item.status === column.id);
          const over = overColumn === column.id;
          return (
            <section
              key={column.id}
              aria-label={column.label}
              onDragOver={(event) => {
                event.preventDefault();
                setOverColumn(column.id);
              }}
              onDragLeave={() => setOverColumn((current) => (current === column.id ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                setOverColumn(null);
                move(event.dataTransfer.getData('text/plain'), column.id);
              }}
              className={cn('flex w-64 shrink-0 snap-start flex-col rounded-lg bg-muted/50 transition-colors', over && 'bg-muted')}
              style={over ? { boxShadow: `inset 0 0 0 1.5px ${accentColor}` } : undefined}
            >
              <h3 className="flex items-center justify-between px-3 py-2.5 text-sm font-bold">
                {column.label}
                <span className="font-mono text-xs font-normal tabular-nums text-muted-foreground">{cards.length}</span>
              </h3>
              <ul className="flex min-h-24 flex-col gap-2 px-2 pb-2">
                {cards.map((order) => (
                  <li key={order.id}>
                    <div
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', order.id);
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      className="cursor-grab rounded-md border bg-card p-3 shadow-xs active:cursor-grabbing"
                    >
                      <button type="button" onClick={() => onOpen?.(order)} className="block w-full text-left">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-muted-foreground">{order.id}</span>
                          {order.priority === 'urgent' || order.priority === 'high' ? (
                            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize text-white" style={{ background: order.priority === 'urgent' ? accentColor : '#2e2e2e' }}>
                              {order.priority}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-sm font-bold leading-snug">{order.title}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{order.vehicle}</span>
                      </button>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <span className="truncate">{order.technician ?? 'Unassigned'}</span>
                        <span className="shrink-0 tabular-nums">{formatDate(order.openedOn, { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <label className="mt-2 block">
                        <span className="sr-only">Status of {order.id}</span>
                        <select
                          value={order.status}
                          onChange={(event) => move(order.id, event.target.value as WorkOrderStatus)}
                          className="h-7 w-full rounded border bg-background px-1.5 text-xs"
                        >
                          {WORK_ORDER_STATUSES.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Card>
  );
}
```
