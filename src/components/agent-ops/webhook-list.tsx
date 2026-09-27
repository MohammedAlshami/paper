'use client';

import * as React from 'react';
import { RotateCw, Send, Webhook } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

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
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 py-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Webhook className="size-4 text-muted-foreground" /> Webhooks
        </CardTitle>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{endpoints.length} endpoints</span>
      </CardHeader>

      <CardContent className="p-0">
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
      </CardContent>
    </Card>
  );
}
