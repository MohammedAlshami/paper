# ApprovalQueue

Every run blocked on a person, in one inbox.

Pending approvals across all runs with multi-select and bulk approve or reject, filtered by risk — the screen that makes human-in-the-loop workable at more than one run a day.

**Category:** Operations · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge button table
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/approval-queue.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<ApprovalQueue
  approvals={approvals}
  onApprove={(selected) => approve(selected.map((a) => a.id))}
  onReject={(selected) => reject(selected.map((a) => a.id))}
/>
```

## Anatomy

```tsx
import { ApprovalQueue } from '@/components/agent-ops/approval-queue';

// PendingApproval: id, action, tool, risk, runId, workflow, requestedAt, expiresIn?
<ApprovalQueue approvals={approvals} onApprove={approve} onReject={reject} />
```

## Examples

### Four runs blocked on people

```tsx
<ApprovalQueue approvals={approvals} onApprove={approve} />
```

## API reference

#### ApprovalQueue · PendingApproval

Bulk actions receive the selected approvals.

| Prop | Type | Description |
| --- | --- | --- |
| `approvals` | `PendingApproval[]` | id, action, tool, risk, runId, workflow, requestedAt, expiresIn? |
| `onApprove / onReject` | `(approvals: PendingApproval[]) => void` | Called with the selection. |

## Source

`src/components/agent-ops/approval-queue.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Panel, PanelBody, PanelHeader } from './shared/panel';

export interface PendingApproval {
  id: string;
  action: string;
  tool: string;
  risk: 'low' | 'medium' | 'high';
  runId: string;
  workflow: string;
  requestedBy?: string;
  requestedAt: string;
  expiresIn?: string;
}

/** ApprovalQueue — every run currently blocked on a person, in one inbox. */
export function ApprovalQueue({
  approvals,
  onApprove,
  onReject,
  className,
}: {
  approvals: PendingApproval[];
  onApprove?: (approvals: PendingApproval[]) => void;
  onReject?: (approvals: PendingApproval[]) => void;
  className?: string;
}) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [risk, setRisk] = React.useState<'all' | PendingApproval['risk']>('all');
  const shown = risk === 'all' ? approvals : approvals.filter((item) => item.risk === risk);
  const picked = approvals.filter((item) => selected.includes(item.id));
  const allShownSelected = shown.length > 0 && shown.every((item) => selected.includes(item.id));

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  return (
    <Panel className={className}>
      <PanelHeader
        title={
          <>
            Pending approvals{' '}
            <span className="font-mono text-xs font-normal text-muted-foreground">({approvals.length})</span>
          </>
        }
        right={(['all', 'high', 'medium', 'low'] as const).map((value) => (
          <button key={value} type="button" onClick={() => setRisk(value)} aria-pressed={risk === value}>
            <Badge variant={risk === value ? 'default' : 'outline'} className="font-mono">
              {value}
            </Badge>
          </button>
        ))}
      />

      <PanelBody>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  className="size-4 accent-foreground"
                  checked={allShownSelected}
                  onChange={() =>
                    setSelected((prev) =>
                      allShownSelected
                        ? prev.filter((id) => !shown.some((item) => item.id === id))
                        : Array.from(new Set([...prev, ...shown.map((item) => item.id)])),
                    )
                  }
                />
              </TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Run</TableHead>
              <TableHead className="text-right">Waiting</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((approval) => (
              <TableRow key={approval.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    aria-label={`Select ${approval.action}`}
                    className="size-4 accent-foreground"
                    checked={selected.includes(approval.id)}
                    onChange={() => toggle(approval.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{approval.action}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{approval.tool}</TableCell>
                <TableCell>
                  <Badge variant={approval.risk === 'high' ? 'destructive' : approval.risk === 'medium' ? 'outline' : 'secondary'}>
                    {approval.risk}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {approval.runId} · {approval.workflow}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {approval.requestedAt}
                  {approval.expiresIn ? ` · ${approval.expiresIn}` : ''}
                </TableCell>
              </TableRow>
            ))}
            {!shown.length ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Nothing waiting on you.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </PanelBody>

      <div className="flex flex-wrap items-center gap-2 border-t px-6 py-3">
        <span className="mr-auto font-mono text-xs text-muted-foreground tabular-nums">
          {picked.length ? `${picked.length} selected` : 'Select approvals to act on'}
        </span>
        <Button size="sm" variant="outline" disabled={!picked.length} onClick={() => onReject?.(picked)}>
          <X /> Reject selected
        </Button>
        <Button size="sm" disabled={!picked.length} onClick={() => onApprove?.(picked)}>
          <Check /> Approve selected
        </Button>
      </div>
    </Panel>
  );
}
```
