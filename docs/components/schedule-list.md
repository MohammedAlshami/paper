# ScheduleList

The cron jobs behind the workflows, with last night’s outcome.

Cron expression and a human reading of it, the next run in local time, and how the last run actually ended — the detail that decides whether a schedule is trustworthy.

**Category:** Operations · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge button table
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/schedule-list.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<ScheduleList
  schedules={schedules}
  onToggle={(schedule) => setEnabled(schedule.id, !schedule.enabled)}
  onEdit={(schedule) => openEditor(schedule)}
/>
```

## Anatomy

```tsx
import { ScheduleList } from '@/components/agent-ops/schedule-list';

// Schedule: id, workflow, cron, humanReading, timezone?, nextRun, lastRun?, enabled
<ScheduleList schedules={schedules} onToggle={toggle} />
```

## Examples

### A failed nightly and a paused weekly

```tsx
<ScheduleList schedules={schedules} onToggle={toggle} />
```

## API reference

#### ScheduleList · Schedule

Cron is rendered as code; the human reading sits next to it.

| Prop | Type | Description |
| --- | --- | --- |
| `workflow / cron / humanReading` | `string` | What runs and when. |
| `nextRun / timezone?` | `string` | e.g. in 15h 32m · Asia/Kuala_Lumpur. |
| `lastRun` | `{ at: string, status: 'succeeded' | 'failed' | 'cancelled' }` | Rendered as a badge. |
| `enabled / onToggle / onEdit` | `boolean · callbacks` | Enable and edit actions. |

## Source

`src/components/agent-ops/schedule-list.tsx`

```tsx
'use client';

import * as React from 'react';
import { CalendarClock, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Panel, PanelBody, PanelHeader } from './shared/panel';

export interface Schedule {
  id: string;
  workflow: string;
  cron: string;
  humanReading: string;
  timezone?: string;
  nextRun: string;
  lastRun?: { at: string; status: 'succeeded' | 'failed' | 'cancelled' };
  enabled: boolean;
}

/** ScheduleList — the cron jobs behind the workflows, with last night's outcome. */
export function ScheduleList({
  schedules,
  onToggle,
  onEdit,
  className,
}: {
  schedules: Schedule[];
  onToggle?: (schedule: Schedule) => void;
  onEdit?: (schedule: Schedule) => void;
  className?: string;
}) {
  const active = schedules.filter((schedule) => schedule.enabled).length;

  return (
    <Panel className={className}>
      <PanelHeader
        wrap={false}
        title={
          <>
            <CalendarClock className="size-4 text-muted-foreground" /> Schedules
          </>
        }
        right={
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {active}/{schedules.length} active
          </span>
        }
      />

      <PanelBody>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Cron</TableHead>
              <TableHead>Next run</TableHead>
              <TableHead>Last run</TableHead>
              <TableHead className="text-right">Enabled</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id} className={cn(!schedule.enabled && 'opacity-60')}>
                <TableCell className="font-medium">{schedule.workflow}</TableCell>
                <TableCell>
                  <span className="flex flex-wrap items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{schedule.cron}</code>
                    <span className="text-xs text-muted-foreground">{schedule.humanReading}</span>
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {schedule.nextRun}
                  {schedule.timezone ? ` · ${schedule.timezone}` : ''}
                </TableCell>
                <TableCell>
                  {schedule.lastRun ? (
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge variant={schedule.lastRun.status === 'failed' ? 'destructive' : 'secondary'}>
                        {schedule.lastRun.status}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">{schedule.lastRun.at}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">never run</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={schedule.enabled}
                      onChange={() => onToggle?.(schedule)}
                      className="size-4 accent-foreground"
                      aria-label={`Toggle ${schedule.workflow}`}
                    />
                  </label>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" aria-label="Edit schedule" onClick={() => onEdit?.(schedule)}>
                    <Pencil />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PanelBody>
    </Panel>
  );
}
```
