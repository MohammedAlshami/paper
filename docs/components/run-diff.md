# RunDiff

What actually changed between two runs, line by line.

A line diff (LCS, so insertions stay aligned) of any two payloads: a step input you edited, or the outputs of a parent and its branch.

**Category:** Observability · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/run-diff.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<RunDiff
  before={parentStep.input}
  after={branchStep.input}
  beforeLabel={parent.id}
  afterLabel={branch.id}
/>
```

## Anatomy

```tsx
import { RunDiff } from '@/components/agent-ops/run-diff';

// anything line-based: JSON payloads, prompts, generated text
<RunDiff before={before} after={after} title="Input diff" />
```

## Examples

### Editing a step input

```tsx
<RunDiff before={before} after={after} />
```

### Two prompt outputs

```tsx
<RunDiff title="Output diff" before={a} after={b} />
```

## API reference

#### RunDiff

A unified, line-aligned diff.

| Prop | Type | Description |
| --- | --- | --- |
| `before / after` | `string` | The two texts to compare. |
| `beforeLabel / afterLabel` | `string` | Badges in the header. |
| `title` | `string` | Card title. Defaults to Diff. |

## Source

`src/components/agent-ops/run-diff.tsx`

```tsx
'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DiffLines, DiffStatBadge, useDiff } from './shared/diff-lines';
import { Panel, PanelBody, PanelHeader } from './shared/panel';

/** RunDiff — what actually changed between two runs, line by line. */
export function RunDiff({
  before,
  after,
  beforeLabel = 'parent',
  afterLabel = 'branch',
  title = 'Diff',
  className,
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  className?: string;
}) {
  const { lines, added, removed } = useDiff(before, after);

  return (
    <Panel className={className}>
      <PanelHeader
        title={title}
        right={
          <>
            <Badge variant="secondary" className="font-mono">
              {beforeLabel}
            </Badge>
            <ArrowRight className="size-3.5 text-muted-foreground" />
            <Badge className="font-mono">{afterLabel}</Badge>
            <DiffStatBadge added={added} removed={removed} />
          </>
        }
      />

      <PanelBody>
        <DiffLines lines={lines} className="border-t" />
      </PanelBody>
    </Panel>
  );
}
```
