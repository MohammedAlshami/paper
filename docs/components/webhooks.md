# WebhookList

The way work arrives, and whether your endpoint is answering.

Endpoints with their subscribed events, the last delivery with its status code and duration, a success rate, and a replay for the delivery you need to send again.

**Category:** Operations · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge button table
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/webhook-list.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<WebhookList
  endpoints={endpoints}
  onSendTest={(endpoint) => sendTest(endpoint.id)}
  onReplay={(endpoint) => replay(endpoint.id)}
  onToggle={(endpoint) => setEnabled(endpoint.id, !endpoint.enabled)}
/>
```

## Anatomy

```tsx
import { WebhookList } from '@/components/agent-ops/webhook-list';

// WebhookEndpoint: id, url, events, enabled, successRate?, lastDelivery?
<WebhookList endpoints={endpoints} onReplay={replay} />
```

## Examples

### A failing endpoint next to a healthy one

```tsx
<WebhookList endpoints={endpoints} onReplay={replay} />
```

### Healthy endpoints only

```tsx
<WebhookList endpoints={endpoints.filter((e) => (e.successRate ?? 0) > 90)} />
```

## API reference

#### WebhookList · WebhookEndpoint

URLs render as plain text, never as links.

| Prop | Type | Description |
| --- | --- | --- |
| `url` | `string` | The endpoint that receives the events. |
| `events` | `string[]` | Subscribed event names, shown as badges. |
| `lastDelivery` | `{ at, status: 'delivered' | 'failed' | 'pending', code?, ms? }` | The last attempt. |
| `successRate` | `number` | Percentage, 0–100. |
| `onSendTest / onReplay / onToggle` | `(endpoint) => void` | Endpoint actions. |

## Source

`src/components/agent-ops/webhook-list.tsx`

```tsx
'use client';

import * as React from 'react';
import { RotateCw, Send, Webhook } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Panel, PanelBody, PanelHeader } from './shared/panel';

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  enabled: boolean;
  successRate?: number;
  lastDelivery?: { at: string; status: 'delivered' | 'failed' | 'pending'; code?: number; ms?: number };
}

/**
 * WebhookList — the way work arrives, and whether your endpoint is answering.
 * `url` is shown as plain text, never rendered as a link.
 */
export function WebhookList({
  endpoints,
  onSendTest,
  onReplay,
  onToggle,
  className,
}: {
  endpoints: WebhookEndpoint[];
  onSendTest?: (endpoint: WebhookEndpoint) => void;
  onReplay?: (endpoint: WebhookEndpoint) => void;
  onToggle?: (endpoint: WebhookEndpoint) => void;
  className?: string;
}) {
  return (
    <Panel className={className}>
      <PanelHeader
        wrap={false}
        title={
          <>
            <Webhook className="size-4 text-muted-foreground" /> Webhooks
          </>
        }
        right={<span className="font-mono text-xs text-muted-foreground tabular-nums">{endpoints.length} endpoints</span>}
      />

      <PanelBody>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endpoint</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Last delivery</TableHead>
              <TableHead className="text-right">Success</TableHead>
              <TableHead className="text-right">Enabled</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.map((endpoint) => (
              <TableRow key={endpoint.id} className={cn(!endpoint.enabled && 'opacity-60')}>
                <TableCell className="max-w-72 truncate font-mono text-xs">{endpoint.url}</TableCell>
                <TableCell>
                  <span className="flex flex-wrap gap-1.5">
                    {endpoint.events.map((event) => (
                      <Badge key={event} variant="outline" className="font-mono">
                        {event}
                      </Badge>
                    ))}
                  </span>
                </TableCell>
                <TableCell>
                  {endpoint.lastDelivery ? (
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge variant={endpoint.lastDelivery.status === 'failed' ? 'destructive' : 'secondary'}>
                        {endpoint.lastDelivery.status}
                        {endpoint.lastDelivery.code ? ` ${endpoint.lastDelivery.code}` : ''}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {endpoint.lastDelivery.at}
                        {endpoint.lastDelivery.ms ? ` · ${endpoint.lastDelivery.ms}ms` : ''}
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">never delivered</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular-nums">
                  {typeof endpoint.successRate === 'number' ? `${endpoint.successRate}%` : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <input
                    type="checkbox"
                    checked={endpoint.enabled}
                    onChange={() => onToggle?.(endpoint)}
                    className="size-4 accent-foreground"
                    aria-label={`Toggle ${endpoint.url}`}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onSendTest?.(endpoint)}>
                      <Send /> Test
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Replay last delivery" onClick={() => onReplay?.(endpoint)}>
                      <RotateCw />
                    </Button>
                  </span>
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
