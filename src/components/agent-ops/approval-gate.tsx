'use client';

import * as React from 'react';
import { Check, Clock, ShieldAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/editorial/eyebrow';

export type Risk = 'low' | 'medium' | 'high';

export interface ApprovalRequest {
  id: string;
  /** Short sentence describing the side effect, e.g. "Send email to 3 recipients". */
  action: string;
  tool: string;
  /** Pretty-printed JSON of the arguments, shown before anything runs. */
  args: string;
  risk: Risk;
  reason?: string;
  requestedBy?: string;
  expiresIn?: string;
}

const riskTone: Record<Risk, 'default' | 'accent' | 'ink'> = {
  low: 'default',
  medium: 'accent',
  high: 'ink',
};

/**
 * Pre-execution approval gate — the decision happens *before* the side effect,
 * bound to the run, not bolted on as an "Approve" button at the end.
 */
export function ApprovalGate({
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
  return (
    <section
      className={cn('rounded-paper-lg border border-dashed border-line bg-raised p-6', className)}
      aria-label={`Approval required: ${request.action}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Eyebrow className="mb-2">Approval required</Eyebrow>
          <h3 className="font-display text-lg font-bold tracking-tight text-ink">{request.action}</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Nothing runs until you approve. The agent is paused at{' '}
            <span className="font-mono text-[12px] text-ink">{request.tool}</span>.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={riskTone[request.risk]}>
            <ShieldAlert className="size-3" /> {request.risk} risk
          </Badge>
          {request.expiresIn ? (
            <Badge tone="faint">
              <Clock className="size-3" /> {request.expiresIn}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-paper border border-dashed border-line">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-line bg-sunk/60 px-3 py-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">arguments</span>
          <span className="font-mono text-[11px] text-ink-faint">{request.tool}</span>
        </div>
        <pre className="overflow-x-auto bg-sunk/30 p-4 font-mono text-[12.5px] leading-relaxed text-ink">
          {request.args}
        </pre>
      </div>

      {request.reason ? (
        <p className="mt-4 border-l-2 border-dashed border-line-strong pl-3 text-sm leading-relaxed text-ink-muted">
          {request.reason}
        </p>
      ) : null}

      <footer className="mt-6 flex flex-wrap items-center gap-2 border-t border-dashed border-line pt-4">
        <span className="mr-auto text-xs text-ink-faint">
          {request.requestedBy ? `requested by ${request.requestedBy}` : 'requested by the agent'}
        </span>
        <Button size="sm" variant="outline" onClick={onReject}>
          <X className="size-3.5" /> Reject
        </Button>
        <Button size="sm" variant="ghost">
          Edit arguments
        </Button>
        <Button size="sm" onClick={onApprove}>
          <Check className="size-3.5" /> Approve and run
        </Button>
      </footer>
    </section>
  );
}
