# PromptEditor

Write the prompt, see its variables and what it will cost.

System and user prompt bodies, the {{variables}} detected in them, and a token estimate per version — the smallest thing that stops prompts living in a string constant.

**Category:** Authoring · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge button separator textarea
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/prompt-editor.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<PromptEditor
  system={prompt.system}
  user={prompt.user}
  model="gpt-5"
  onChange={setPrompt}
  onSave={(value) => saveVersion(value)}
  onTest={(value) => runOn(value, cases)}
/>
```

## Anatomy

```tsx
import { PromptEditor } from '@/components/agent-ops/prompt-editor';

// variables are detected from {{name}} and shown as chips
<PromptEditor system={system} user={user} model="gpt-5" onSave={save} />
```

## Examples

### With variables and a token estimate

```tsx
<PromptEditor system={system} user={user} onSave={save} />
```

## API reference

#### PromptEditor

Token count is a ~4 characters per token estimate, not a tokenizer.

| Prop | Type | Description |
| --- | --- | --- |
| `system / user` | `string` | Initial prompt bodies. |
| `model` | `string` | Shown as a badge. |
| `onChange / onSave / onTest` | `({ system, user }) => void` | Called as the prompt changes, is saved, or is tested. |

## Source

`src/components/agent-ops/prompt-editor.tsx`

```tsx
'use client';

import * as React from 'react';
import { Save, Sparkles, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/** Rough token estimate: ~4 characters per token, the usual rule of thumb. */
const estimateTokens = (text: string) => Math.ceil(text.length / 4);

/** PromptEditor — write the prompt, see its variables and what it will cost. */
export function PromptEditor({
  system = '',
  user = '',
  model = 'gpt-5',
  onChange,
  onSave,
  onTest,
  className,
}: {
  system?: string;
  user?: string;
  model?: string;
  onChange?: (value: { system: string; user: string }) => void;
  onSave?: (value: { system: string; user: string }) => void;
  onTest?: (value: { system: string; user: string }) => void;
  className?: string;
}) {
  const [value, setValue] = React.useState({ system, user });
  const update = (patch: Partial<{ system: string; user: string }>) => {
    const next = { ...value, ...patch };
    setValue(next);
    onChange?.(next);
  };

  const variables = Array.from(new Set(`${value.system} ${value.user}`.match(/\{\{\s*[\w.]+\s*\}\}/g) ?? []));
  const tokens = estimateTokens(value.system) + estimateTokens(value.user);

  return (
    <Card className={cn('gap-0 py-0', className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">Prompt</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {model}
          </Badge>
          <Badge variant="outline" className="font-mono tabular-nums">
            ~{tokens.toLocaleString()} tokens
          </Badge>
        </div>
      </CardHeader>

      <Separator />
      <CardContent className="grid gap-4 py-4">
        <div className="grid gap-2">
          <span className="font-mono text-xs text-muted-foreground">system</span>
          <Textarea
            value={value.system}
            rows={3}
            onChange={(event) => update({ system: event.target.value })}
            className="font-mono text-xs leading-relaxed"
          />
        </div>
        <div className="grid gap-2">
          <span className="font-mono text-xs text-muted-foreground">user</span>
          <Textarea
            value={value.user}
            rows={6}
            onChange={(event) => update({ user: event.target.value })}
            className="font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="grid gap-2">
          <span className="font-mono text-xs text-muted-foreground">variables</span>
          <div className="flex flex-wrap gap-1.5">
            {variables.length ? (
              variables.map((variable) => (
                <Badge key={variable} variant="outline" className="font-mono">
                  {variable}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No variables. Use {'{{name}}'} to add one.</span>
            )}
          </div>
        </div>
      </CardContent>

      <Separator />
      <CardContent className="flex flex-wrap items-center gap-2 py-4">
        <Button size="sm" variant="ghost">
          <Wand2 /> Format
        </Button>
        <Button size="sm" variant="outline" onClick={() => onTest?.(value)}>
          <Sparkles /> Test on 3 cases
        </Button>
        <Button size="sm" className="ml-auto" onClick={() => onSave?.(value)}>
          <Save /> Save version
        </Button>
      </CardContent>
    </Card>
  );
}
```
