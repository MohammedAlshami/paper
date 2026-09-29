# ApiKeyList

Keys with their last use, and a way to make or revoke one.

Each key shows its name, scope, visible prefix, creation date and last use. New key opens a dialog for a name; the full secret is shown once with a copy button and is never shown again.

**Category:** Authentication and account · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add badge button card dialog input
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/api-key-list.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/api-key-list.tsx`, `src/components/app/app-kit.ts`

## Usage

```tsx
<ApiKeyList
  keys={keys}
  onCreate={async (name) => createKey(name)}
  onRevoke={(key) => revokeKey(key.id)}
/>
```

## Anatomy

```tsx
import { ApiKeyList, type ApiKey } from '@/components/app/api-key-list';

// onCreate returns the full secret. The list itself only ever holds the prefix.
<ApiKeyList keys={keys} onCreate={(name) => makeSecret(name)} onRevoke={(key) => remove(key)} />
```

## Examples

### No keys yet

```tsx
<ApiKeyList keys={[]} onCreate={(name) => 'lg_live_' + name} />
```

## API reference

#### ApiKeyList

A list of API keys.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `keys` | `ApiKey[]` | — | id, name, prefix, createdAt, lastUsedAt and scope. |
| `onCreate` | `(name) => string \| Promise<string>` | — | Make a key and return its full secret. |
| `onRevoke` | `(key) => void` | — | Called when the bin is pressed. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/api-key-list.tsx`

```tsx
'use client';

import * as React from 'react';
import { Check, Copy, KeyRound, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatDate } from './app-kit';

export interface ApiKey {
  id: string;
  name: string;
  /** The visible start of the key, e.g. "lg_live_4f2a". The rest is never shown again. */
  prefix: string;
  /** ISO date. */
  createdAt: string;
  /** ISO date, or leave out for "never used". */
  lastUsedAt?: string;
  scope?: string;
}

/**
 * ApiKeyList — keys with their prefix, scope and last use, a revoke action, and a dialog to create one. `onCreate`
 * returns the full secret, which is shown once with a copy button and then forgotten.
 */
export function ApiKeyList({
  keys,
  onCreate,
  onRevoke,
  className,
}: {
  keys: ApiKey[];
  /** Make a key from a name and return its full secret. */
  onCreate?: (name: string) => string | Promise<string>;
  onRevoke?: (key: ApiKey) => void;
  className?: string;
}) {
  const [creating, setCreating] = React.useState(false);
  const [name, setName] = React.useState('');
  const [secret, setSecret] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const close = () => {
    setCreating(false);
    setName('');
    setSecret(null);
    setCopied(false);
  };

  const create = async () => {
    setSecret((await onCreate?.(name.trim())) ?? '');
  };

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-sm font-bold">API keys</p>
          <p className="text-xs text-muted-foreground">{keys.length} active</p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus /> New key
        </Button>
      </div>
      {keys.length ? (
        <ul className="divide-y">
          {keys.map((key) => (
            <li key={key.id} className="flex items-center gap-3 px-4 py-3">
              <KeyRound className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span className="truncate">{key.name}</span>
                  {key.scope ? <Badge variant="outline">{key.scope}</Badge> : null}
                </p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {key.prefix}…  ·  created {formatDate(key.createdAt)}  ·  {key.lastUsedAt ? `used ${formatDate(key.lastUsedAt)}` : 'never used'}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label={`Revoke ${key.name}`} onClick={() => onRevoke?.(key)}>
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-6 text-center text-sm text-muted-foreground">No keys yet.</p>
      )}

      <Dialog open={creating} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{secret ? 'Copy your key' : 'New API key'}</DialogTitle>
            <DialogDescription>{secret ? 'This is the only time it is shown. Store it somewhere safe.' : 'Give it a name you will recognise later.'}</DialogDescription>
          </DialogHeader>
          {secret ? (
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2">
              <code className="min-w-0 flex-1 truncate font-mono text-xs">{secret}</code>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Copy key"
                onClick={() => {
                  void navigator.clipboard?.writeText(secret);
                  setCopied(true);
                }}
              >
                {copied ? <Check /> : <Copy />}
              </Button>
            </div>
          ) : (
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Production server" aria-label="Key name" />
          )}
          <DialogFooter>
            {secret ? (
              <Button onClick={close}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button disabled={!name.trim()} onClick={() => void create()}>
                  Create key
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
```
