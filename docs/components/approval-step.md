# ApprovalStep

Consent before the side effect.

A human step inside the workflow: the action, the tool, the arguments shown in full, the risk and the reason — approve, reject or edit before anything runs.

**Category:** Human in the loop · **Status:** ready

## Installation

```bash
pnpm dlx shadcn@latest add card button badge separator
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/approval-step.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<ApprovalStep request={request} onApprove={approve} onReject={reject} />
```

## Anatomy

```tsx
import { ApprovalStep } from '@/components/agent-ops/approval-step';

// ApprovalRequest: action, tool, args, risk, reason?, requestedBy?, expiresIn?
<ApprovalStep request={request} onApprove={approve} />
```

## Examples

### Medium risk — sending email

```tsx
<ApprovalStep request={emailRequest} onApprove={approve} />
```

### High risk — destructive tool

```tsx
<ApprovalStep request={{ ...request, risk: 'high' }} />
```

## API reference

#### ApprovalStep · ApprovalRequest

A pre-execution approval gate.

| Prop | Type | Description |
| --- | --- | --- |
| `action` | `string` | What will happen, in one line. |
| `tool` | `string` | The tool that will run, e.g. mail.send. |
| `args` | `string` | The exact arguments, shown in full. |
| `risk` | `'low' | 'medium' | 'high'` | Drives the risk badge and severity line. |
| `reason` | `string` | Optional explanation of why approval is needed. |
| `requestedBy` | `string` | Who (or what) is asking. |
| `expiresIn` | `string` | Optional expiry label, e.g. expires in 9m. |
| `onApprove` | `() => void` | Called when the request is approved. |
| `onReject` | `() => void` | Called when the request is rejected. |

## Source

`src/components/agent-ops/approval-step.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check, Clock, Pencil, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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
  const severity = request.risk === 'high' ? 'Step 3 of 3' : request.risk === 'medium' ? 'Step 2 of 3' : 'Step 1 of 3';

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="gap-3 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Human approval</Badge>
              <Badge variant={request.risk === 'high' ? 'destructive' : 'secondary'}>{request.risk} risk</Badge>
              <span className="font-mono text-xs text-muted-foreground">{severity}</span>
            </div>
            <CardTitle className="text-sm font-semibold tracking-tight">{request.action}</CardTitle>
            <CardDescription>
              Nothing runs until this is approved. The workflow is paused before{' '}
              <span className="font-mono text-xs text-foreground">{request.tool}</span>.
            </CardDescription>
          </div>
          {request.expiresIn ? (
            <Badge variant="outline" className="gap-1">
              <Clock /> {request.expiresIn}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <Separator />
      <div className="flex items-center gap-2 bg-muted px-6 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">arguments · {request.tool}</span>
      </div>
      <pre className="overflow-x-auto px-6 py-4 font-mono text-xs leading-relaxed">{request.args}</pre>

      {request.reason ? (
        <>
          <Separator />
          <p className="px-6 py-3 text-sm text-muted-foreground">{request.reason}</p>
        </>
      ) : null}

      <Separator />
      <CardContent className="flex flex-wrap items-center gap-2 py-4">
        <span className="mr-auto font-mono text-xs text-muted-foreground">
          {request.requestedBy ?? 'requested by the agent'}
        </span>
        <Button size="sm" variant="outline" onClick={onReject}>
          <X /> Reject
        </Button>
        <Button size="sm" variant="ghost">
          <Pencil /> Edit arguments
        </Button>
        <Button size="sm" onClick={onApprove}>
          <Check /> Approve and run
        </Button>
      </CardContent>
    </Card>
  );
}
```
