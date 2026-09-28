'use client';

import * as React from 'react';
import { CalendarClock, CircleAlert, Gauge, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { clamp, formatKm } from './fleet-kit';

export type IssueSeverity = 'minor' | 'major' | 'critical';

export interface HealthIssue {
  id: string;
  label: string;
  severity: IssueSeverity;
}

const SEVERITY_LABEL: Record<IssueSeverity, string> = { minor: 'Minor', major: 'Major', critical: 'Critical' };

/** A ring that fills to `score` (0 to 100). */
function ScoreRing({ score, accentColor }: { score: number; accentColor: string }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const low = score < 60;
  return (
    <div className="relative size-24 shrink-0" role="img" aria-label={`Health score ${score} out of 100`}>
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="7" className="stroke-muted" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamp(score) / 100)}
          stroke={low ? accentColor : 'currentColor'}
          className={cn('transition-[stroke-dashoffset] duration-500', !low && 'text-foreground')}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums leading-none">{Math.round(score)}</span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">health</span>
      </div>
    </div>
  );
}

/** VehicleHealthCard — one vehicle at a glance: a health score, what is wrong, and what is next. */
export function VehicleHealthCard({
  name,
  model,
  plate,
  odometerKm,
  score,
  issues,
  nextService,
  onOpen,
  onSchedule,
  accentColor = '#ec4899',
  className,
}: {
  name: string;
  /** e.g. "2021 Ford Transit 350". */
  model: string;
  plate: string;
  odometerKm: number;
  /** 0 to 100. Under 60 is drawn in the accent colour. */
  score: number;
  issues: HealthIssue[];
  nextService?: { label: string; due: string };
  onOpen?: () => void;
  onSchedule?: () => void;
  accentColor?: string;
  className?: string;
}) {
  const critical = issues.filter((issue) => issue.severity === 'critical').length;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold leading-tight">{name}</h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{model}</p>
          <p className="mt-2 flex items-center gap-2 text-xs">
            <span className="rounded-md border-2 border-foreground/80 px-1.5 py-0.5 font-mono font-semibold tracking-wider">{plate}</span>
            <span className="flex items-center gap-1 font-mono tabular-nums text-muted-foreground">
              <Gauge className="size-3.5" />
              {formatKm(odometerKm)}
            </span>
          </p>
        </div>
        <ScoreRing score={score} accentColor={accentColor} />
      </div>

      <div className="border-t">
        <div className="flex items-center justify-between px-4 pt-3">
          <p className="text-xs font-medium text-muted-foreground">Open issues</p>
          {critical ? (
            <Badge className="text-white" style={{ background: accentColor }}>
              {critical} critical
            </Badge>
          ) : null}
        </div>
        {issues.length ? (
          <ul className="px-4 pb-3 pt-1.5">
            {issues.map((issue) => (
              <li key={issue.id} className="flex items-center gap-2.5 py-1.5 text-sm">
                <CircleAlert className={cn('size-4 shrink-0', issue.severity === 'minor' && 'text-muted-foreground')} style={issue.severity === 'critical' ? { color: accentColor } : undefined} />
                <span className="min-w-0 flex-1 truncate">{issue.label}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{SEVERITY_LABEL[issue.severity]}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 pb-3 pt-1.5 text-sm text-muted-foreground">Nothing open.</p>
        )}
      </div>

      <div className="flex items-center gap-3 border-t bg-muted/40 px-4 py-3">
        <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{nextService ? nextService.label : 'No service booked'}</p>
          {nextService ? <p className="truncate text-xs text-muted-foreground">{nextService.due}</p> : null}
        </div>
        <Button size="sm" variant="outline" onClick={onSchedule}>
          <Wrench /> Schedule
        </Button>
        {onOpen ? (
          <Button size="sm" onClick={onOpen}>
            Open
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
