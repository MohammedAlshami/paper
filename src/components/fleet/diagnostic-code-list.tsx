'use client';

import * as React from 'react';
import { ChevronDown, CircleAlert, Info, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate } from './fleet-kit';

export type CodeSeverity = 'info' | 'warning' | 'critical';
export type CodeStatus = 'active' | 'pending' | 'cleared';

export interface DiagnosticCode {
  /** e.g. "P0420". */
  code: string;
  /** Plain English, not the SAE wording. */
  description: string;
  system: string;
  severity: CodeSeverity;
  status: CodeStatus;
  /** ISO date the code first appeared. */
  firstSeen: string;
  /** How many times it has come back. */
  occurrences: number;
  likelyCauses?: string[];
}

const ICON = { info: Info, warning: TriangleAlert, critical: CircleAlert } as const;

/** DiagnosticCodeList — OBD-II fault codes in plain English, worst first, with likely causes and a clear action. */
export function DiagnosticCodeList({
  codes,
  onClear,
  onCreateWorkOrder,
  accentColor = '#ec4899',
  className,
}: {
  codes: DiagnosticCode[];
  /** Called when a code's Clear button is pressed. The code is then shown as cleared. */
  onClear?: (code: DiagnosticCode) => void;
  onCreateWorkOrder?: (code: DiagnosticCode) => void;
  accentColor?: string;
  className?: string;
}) {
  const [cleared, setCleared] = React.useState<string[]>([]);
  const [openCode, setOpenCode] = React.useState<string | null>(null);
  const [showCleared, setShowCleared] = React.useState(false);

  const rank = { critical: 0, warning: 1, info: 2 } as const;
  const all = codes.map((code) => (cleared.includes(code.code) ? { ...code, status: 'cleared' as const } : code));
  const visible = all.filter((code) => showCleared || code.status !== 'cleared').sort((a, b) => rank[a.severity] - rank[b.severity]);
  const active = all.filter((code) => code.status === 'active').length;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-sm font-bold">Fault codes</p>
          <p className="font-mono text-xs tabular-nums text-muted-foreground">{active} active</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={showCleared} onChange={(event) => setShowCleared(event.target.checked)} className="size-3.5" style={{ accentColor }} />
          Show cleared
        </label>
      </div>

      <ul className="divide-y">
        {visible.map((code) => {
          const Icon = ICON[code.severity];
          const open = openCode === code.code;
          const isCleared = code.status === 'cleared';
          return (
            <li key={code.code} className={cn(isCleared && 'opacity-60')}>
              <button
                type="button"
                onClick={() => setOpenCode(open ? null : code.code)}
                aria-expanded={open}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <Icon className={cn('mt-0.5 size-4 shrink-0', code.severity === 'info' && 'text-muted-foreground')} style={code.severity === 'critical' ? { color: accentColor } : undefined} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{code.code}</span>
                    <Badge variant="outline" className="capitalize">
                      {code.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{code.system}</span>
                  </span>
                  <span className="mt-0.5 block text-sm">{code.description}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    First seen {formatDate(code.firstSeen)} · {code.occurrences} {code.occurrences === 1 ? 'time' : 'times'}
                  </span>
                </span>
                <ChevronDown className={cn('mt-1 size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
              </button>
              {open ? (
                <div className="space-y-3 bg-muted/40 px-4 pb-4 pl-11 pt-1">
                  {code.likelyCauses?.length ? (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Likely causes</p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm">
                        {code.likelyCauses.map((cause) => (
                          <li key={cause}>{cause}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => onCreateWorkOrder?.(code)}>
                      Create work order
                    </Button>
                    {!isCleared ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCleared((current) => [...current, code.code]);
                          onClear?.(code);
                        }}
                      >
                        Clear code
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
        {!visible.length ? <li className="px-4 py-10 text-center text-sm text-muted-foreground">No fault codes. The vehicle is reporting clean.</li> : null}
      </ul>
    </Card>
  );
}
