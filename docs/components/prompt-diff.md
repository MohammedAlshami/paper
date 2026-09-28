# PromptDiff

What changed in the prompt, and whether to publish it.

Version chips, the author and date on both sides, a line diff of the bodies, and the publish or discard decision — prompt changes reviewed like code.

**Category:** Authoring · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge button separator
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/prompt-diff.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<PromptDiff
  versions={versions}
  activeVersionId="v4"
  onSelectVersion={setVersion}
  before={versions[2].body}
  after={versions[3].body}
  onPublish={publish}
  onDiscard={discard}
/>
```

## Anatomy

```tsx
import { PromptDiff } from '@/components/agent-ops/prompt-diff';

// PromptVersion: id, label, author?, createdAt?, status? ('draft' | 'published' | 'archived')
<PromptDiff versions={versions} before={before} after={after} onPublish={publish} />
```

## Examples

### Draft vs published

```tsx
<PromptDiff versions={versions} before={before} after={after} />
```

## API reference

#### PromptDiff

The diff itself is the same LCS line diff as RunDiff.

| Prop | Type | Description |
| --- | --- | --- |
| `versions` | `PromptVersion[]` | id, label, author?, createdAt?, status? |
| `before / after` | `string` | The two prompt bodies. |
| `activeVersionId` | `string` | Highlights the selected version chip. |
| `onSelectVersion / onPublish / onDiscard` | `callbacks` | Version and decision handlers. |

## Source

`src/components/agent-ops/prompt-diff.tsx`

```tsx
'use client';

import * as React from 'react';
import { ArrowRight, Check, Undo2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DiffLines, DiffStatBadge, useDiff } from './shared/diff-lines';
import { Panel, PanelHeader } from './shared/panel';

export interface PromptVersion {
  id: string;
  label: string;
  author?: string;
  createdAt?: string;
  status?: 'draft' | 'published' | 'archived';
}

/** PromptDiff — what changed in the prompt, and whether to publish it. */
export function PromptDiff({
  versions,
  activeVersionId,
  onSelectVersion,
  before,
  after,
  onPublish,
  onDiscard,
  className,
}: {
  versions: PromptVersion[];
  activeVersionId?: string;
  onSelectVersion?: (version: PromptVersion) => void;
  before: string;
  after: string;
  onPublish?: () => void;
  onDiscard?: () => void;
  className?: string;
}) {
  const { lines, added, removed } = useDiff(before, after);
  const beforeVersion = versions[0];
  const afterVersion = versions[versions.length - 1];

  return (
    <Panel className={className}>
      <PanelHeader
        title="Prompt versions"
        right={versions.map((version) => (
          <button key={version.id} type="button" onClick={() => onSelectVersion?.(version)}>
            <Badge variant={version.id === activeVersionId ? 'default' : 'outline'} className="font-mono">
              {version.label}
            </Badge>
          </button>
        ))}
      />

      <Separator />
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="font-mono">
            v{beforeVersion?.label ?? '—'}
          </Badge>
          <span>{beforeVersion?.author ?? 'unknown'}</span>
          <span>·</span>
          <span>{beforeVersion?.createdAt ?? ''}</span>
          <ArrowRight className="size-3.5" />
          <Badge className="font-mono">v{afterVersion?.label ?? '—'}</Badge>
          <span>{afterVersion?.author ?? 'you'}</span>
          <span>·</span>
          <span>{afterVersion?.createdAt ?? 'now'}</span>
        </div>
        <DiffStatBadge added={added} removed={removed} />
      </div>

      <Separator />
      <DiffLines lines={lines} />

      <Separator />
      <div className="flex flex-wrap items-center gap-2 px-6 py-4">
        <span className="mr-auto font-mono text-xs text-muted-foreground">
          {afterVersion?.status === 'draft' ? 'draft — not used by any workflow yet' : 'published'}
        </span>
        <Button size="sm" variant="outline" onClick={onDiscard}>
          <Undo2 /> Discard
        </Button>
        <Button size="sm" onClick={onPublish}>
          <Check /> Publish version
        </Button>
      </div>
    </Panel>
  );
}
```
