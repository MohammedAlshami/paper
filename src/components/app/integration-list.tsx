'use client';

import * as React from 'react';
import { Plug, Unplug } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
}

/**
 * IntegrationList — the services an account is wired to. Each row says what the service does, whether it is
 * connected, and gives one button to connect or disconnect. The component never connects anything itself;
 * `onToggle` receives the row and what the person asked for.
 */
export function IntegrationList({
  integrations,
  onToggle,
  title = 'Integrations',
  className,
}: {
  integrations: Integration[];
  onToggle?: (integration: Integration, connected: boolean) => void;
  title?: string;
  className?: string;
}) {
  const connected = integrations.filter((integration) => integration.connected).length;

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-muted-foreground">
            {connected} of {integrations.length} connected
          </p>
        </div>
        <Plug className="size-4 text-muted-foreground" aria-hidden />
      </div>
      {integrations.length ? (
        <ul className="divide-y">
          {integrations.map((integration) => (
            <li key={integration.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {integration.name}
                  {integration.connected ? <Badge variant="outline">Connected</Badge> : null}
                </p>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => onToggle?.(integration, !integration.connected)}>
                {integration.connected ? <Unplug /> : <Plug />}
                {integration.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-6 text-center text-sm text-muted-foreground">Nothing to connect yet.</p>
      )}
    </Card>
  );
}
