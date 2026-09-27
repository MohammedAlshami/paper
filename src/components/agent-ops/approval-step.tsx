'use client';

import * as React from 'react';
import { Check, Clock, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/internal/badge';
import { Button } from '@/components/internal/button';
import { Card } from '@/components/internal/card';
import { Eyebrow } from '@/components/internal/eyebrow';
import type { RunStep } from './types';

export type Risk = 'low' | 'medium' | 'high';

export interface ApprovalRequest {
  id: string;
  action: string;
  tool: string;
  args: string;
  risk: Risk;
  reason?: string;
  requestedBy?: string;
  expiresIn?: string;
  step?: Pick<RunStep, 'id' | 'name' | 'type'>;
}

/** ApprovalStep — human-in-the-loop as a step in the workflow, before the side effect. */
export function ApprovalStep({
  request,
  onApprove,
  onReject,
  className,
}: {
  request: ApprovalRequest;
  onApprove?: () => void;
  onReject?: () => void;
  className?: string;
}) {
  const severity = request.risk === 'high' ? 'step 3 of 3' : request.risk === 'medium' ? 'step 2 of 3' : 'step 1 of 3';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow>Step · human approval</Eyebrow>
            <Badge tone="outline">{request.risk} risk</Badge>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">{severity}</span>
          </div>
          <h4 className="mt-2 font-display text-base font-bold tracking-tight text-foreground">{request.action}</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Nothing runs until this is approved. The workflow is paused before{' '}
            <span className="font-mono text-[12px] text-foreground">{request.tool}</span>.
          </p>
        </div>
        {request.expiresIn ? (
          <Badge tone="muted">
            <Clock className="size-3" /> {request.expiresIn}
          </Badge>
        ) : null}
      </div>

      <div className="overflow-hidden">
        <p className="border-b border-border bg-muted px-4 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
          arguments · {request.tool}
        </p>
        <pre className="overflow-x-auto bg-card p-4 font-mono text-[12px] leading-relaxed text-foreground">
          {request.args}
        </pre>
      </div>

      {request.reason ? (
        <p className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {request.reason}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
        <span className="mr-auto font-mono text-[11px] text-faint">
          {request.requestedBy ?? 'requested by the agent'}
        </span>
        <Button size="sm" variant="outline" onClick={onReject}>
          <X className="size-3.5" /> Reject
        </Button>
        <Button size="sm" variant="ghost">
          <Pencil className="size-3.5" /> Edit arguments
        </Button>
        <Button size="sm" onClick={onApprove}>
          <Check className="size-3.5" /> Approve and run
        </Button>
      </div>
    </Card>
  );
}
