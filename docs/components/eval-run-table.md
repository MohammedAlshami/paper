# EvalRunTable

Every test case, its score, and the ones that regressed.

A pass rate in the header, a score bar per case, and duration, tokens and cost per case — so a regression is a row, not a vibe.

**Category:** Evaluation · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge button table
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/eval-run-table.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<EvalRunTable
  name="Groundedness eval"
  model="gpt-5"
  cases={cases}
  onRun={runEval}
  onRerunCase={(testCase) => rerun(testCase.id)}
/>
```

## Anatomy

```tsx
import { EvalRunTable } from '@/components/agent-ops/eval-run-table';

// EvalCase: id, name, input, expected?, score? (0-100), passed?, durationMs?, tokens?, cost?
<EvalRunTable cases={cases} onRun={runEval} />
```

## Examples

### With one case still running

```tsx
<EvalRunTable cases={cases} onRun={runEval} />
```

### Pass rate only

```tsx
<EvalRunTable cases={cases.filter((c) => c.score !== undefined)} />
```

## API reference

#### EvalRunTable · EvalCase

Cases without a score render as unscored.

| Prop | Type | Description |
| --- | --- | --- |
| `name / model` | `string` | Header labels. |
| `cases` | `EvalCase[]` | id, name, input, expected?, score?, passed?, durationMs?, tokens?, cost? |
| `onRun` | `() => void` | Runs the whole eval. |
| `onRerunCase / onSelectCase` | `(testCase) => void` | Per-row actions. |

## Source

`src/components/agent-ops/eval-run-table.tsx`

```tsx
'use client';

import * as React from 'react';
import { Play, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Panel, PanelBody, PanelHeader } from './shared/panel';

export interface EvalCase {
  id: string;
  name: string;
  input: string;
  expected?: string;
  score?: number;
  passed?: boolean;
  durationMs?: number;
  tokens?: number;
  cost?: number;
}

/** EvalRunTable — every test case, its score, and the ones that regressed. */
export function EvalRunTable({
  name = 'Eval run',
  model,
  cases,
  onRun,
  onRerunCase,
  onSelectCase,
  className,
}: {
  name?: string;
  model?: string;
  cases: EvalCase[];
  onRun?: () => void;
  onRerunCase?: (testCase: EvalCase) => void;
  onSelectCase?: (testCase: EvalCase) => void;
  className?: string;
}) {
  const scored = cases.filter((testCase) => typeof testCase.score === 'number');
  const passed = scored.filter((testCase) => testCase.passed).length;
  const passRate = scored.length ? Math.round((passed / scored.length) * 100) : 0;

  return (
    <Panel className={className}>
      <PanelHeader
        title={name}
        right={
          <>
            {model ? (
              <Badge variant="secondary" className="font-mono">
                {model}
              </Badge>
            ) : null}
            <Badge variant="outline" className="font-mono tabular-nums">
              {passRate}% pass · {passed}/{scored.length}
            </Badge>
            <Button size="sm" onClick={onRun}>
              <Play /> Run eval
            </Button>
          </>
        }
      />

      <PanelBody>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case</TableHead>
              <TableHead>Input</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((testCase) => (
              <TableRow key={testCase.id} className="cursor-pointer" onClick={() => onSelectCase?.(testCase)}>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    {testCase.passed === undefined ? (
                      <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                    ) : testCase.passed ? (
                      <span className="size-1.5 rounded-full bg-primary" />
                    ) : (
                      <span className="size-1.5 rounded-full border border-primary" />
                    )}
                    {testCase.name}
                  </span>
                </TableCell>
                <TableCell className="max-w-72 truncate font-mono text-xs text-muted-foreground">{testCase.input}</TableCell>
                <TableCell className="text-right font-mono text-xs tabular-nums">
                  {typeof testCase.score === 'number' ? (
                    <span className="flex items-center justify-end gap-2">
                      <span className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                        <span className="block h-full rounded-full bg-primary" style={{ width: `${testCase.score}%` }} />
                      </span>
                      {testCase.score}
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {testCase.durationMs ? `${(testCase.durationMs / 1000).toFixed(1)}s` : '—'}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {testCase.tokens ?? '—'}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {testCase.cost ? `$${testCase.cost.toFixed(3)}` : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Re-run case"
                    onClick={(event: React.MouseEvent) => {
                      event.stopPropagation();
                      onRerunCase?.(testCase);
                    }}
                  >
                    <RotateCw />
                  </Button>
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
