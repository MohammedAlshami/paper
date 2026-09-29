# IntegrationList

The services an account is wired to, and one button to connect or disconnect each.

A card of services, each with what it does, whether it is connected, and a single action. The component never connects anything itself: it reports the row and what the person asked for, so you can open an OAuth flow or flip a switch in your own state.

**Category:** Data and dashboards · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge button card
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/integration-list.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/integration-list.tsx`

## Usage

```tsx
const [integrations, setIntegrations] = useState(INTEGRATIONS);

<IntegrationList
  integrations={integrations}
  onToggle={(integration, connected) =>
    setIntegrations((list) => list.map((item) => (item.id === integration.id ? { ...item, connected } : item)))
  }
/>
```

## Anatomy

```tsx
import { IntegrationList, type Integration } from '@/components/app/integration-list';

// The header counts the connected rows. onToggle fires with the whole row and the wanted state.
<IntegrationList integrations={integrations} title="Connected apps" onToggle={toggle} />
```

## Examples

### Nothing connected yet

```tsx
<IntegrationList integrations={[{ id: 'slack', name: 'Slack', description: 'Posts alerts to a channel.', connected: false }]} />
```

## API reference

#### IntegrationList

A card of integrations.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `integrations` | `Integration[]` | — | id, name, description and a connected flag for each service. |
| `onToggle` | `(integration: Integration, connected: boolean) => void` | — | Called with the row and the wanted state; the demo screenshot shows the rest. |
| `title` | `string` | `'Integrations'` | Card heading. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/integration-list.tsx`

```tsx
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
```
