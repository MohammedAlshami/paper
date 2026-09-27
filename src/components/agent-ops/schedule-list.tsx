'use client';

import * as React from 'react';
import { CalendarClock, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

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
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 py-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <CalendarClock className="size-4 text-muted-foreground" /> Schedules
        </CardTitle>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {active}/{schedules.length} active
        </span>
      </CardHeader>

      <CardContent className="p-0">
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
      </CardContent>
    </Card>
  );
}
