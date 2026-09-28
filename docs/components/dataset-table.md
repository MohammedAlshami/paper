# DatasetTable

The test data behind the evals, versioned like everything else.

Dataset rows with their expected output, tags and last score, plus import, export and add-row actions — the part of evals that is easy to leave in a spreadsheet.

**Category:** Evaluation · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add card badge button table
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/agent-ops/dataset-table.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

## Usage

```tsx
<DatasetTable
  name="Brief test set"
  version="7"
  rows={rows}
  onAddRow={addRow}
  onImport={importCsv}
  onExport={exportCsv}
/>
```

## Anatomy

```tsx
import { DatasetTable } from '@/components/agent-ops/dataset-table';

// DatasetRow: id, input, expected?, lastScore?, tags?
<DatasetTable name="Brief test set" rows={rows} onAddRow={addRow} />
```

## Examples

### A versioned test set

```tsx
<DatasetTable name="Brief test set" version="7" rows={rows} />
```

## API reference

#### DatasetTable · DatasetRow

Scores render as a slim bar so regressions are scannable.

| Prop | Type | Description |
| --- | --- | --- |
| `rows` | `DatasetRow[]` | id, input, expected?, lastScore?, tags? |
| `name / version` | `string` | Header labels. |
| `onAddRow / onImport / onExport` | `() => void` | Dataset actions. |

## Source

`src/components/agent-ops/dataset-table.tsx`

```tsx
'use client';

import * as React from 'react';
import { Download, Plus, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Panel, PanelBody, PanelHeader } from './shared/panel';

export interface DatasetRow {
  id: string;
  input: string;
  expected?: string;
  lastScore?: number;
  tags?: string[];
}

/** DatasetTable — the test data behind the evals, versioned like everything else. */
export function DatasetTable({
  name = 'Dataset',
  version,
  rows,
  onAddRow,
  onImport,
  onExport,
  className,
}: {
  name?: string;
  version?: string;
  rows: DatasetRow[];
  onAddRow?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  className?: string;
}) {
  return (
    <Panel className={className}>
      <PanelHeader
        title={
          <>
            {name}
            {version ? (
              <Badge variant="secondary" className="font-mono">
                v{version}
              </Badge>
            ) : null}
            <span className="font-mono text-xs font-normal text-muted-foreground tabular-nums">{rows.length} rows</span>
          </>
        }
        right={
          <>
            <Button size="sm" variant="ghost" onClick={onImport}>
              <Upload /> Import CSV
            </Button>
            <Button size="sm" variant="outline" onClick={onExport}>
              <Download /> Export
            </Button>
            <Button size="sm" onClick={onAddRow}>
              <Plus /> Add row
            </Button>
          </>
        }
      />

      <PanelBody>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Input</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Last score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="max-w-80 truncate font-mono text-xs">{row.input}</TableCell>
                <TableCell className="max-w-64 truncate font-mono text-xs text-muted-foreground">{row.expected ?? '—'}</TableCell>
                <TableCell>
                  <span className="flex flex-wrap gap-1.5">
                    {(row.tags ?? []).map((tag) => (
                      <Badge key={tag} variant="outline" className="font-mono">
                        {tag}
                      </Badge>
                    ))}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular-nums">
                  {typeof row.lastScore === 'number' ? (
                    <span className="flex items-center justify-end gap-2">
                      <span className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                        <span className="block h-full rounded-full bg-primary" style={{ width: `${row.lastScore}%` }} />
                      </span>
                      {row.lastScore}
                    </span>
                  ) : (
                    '—'
                  )}
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
