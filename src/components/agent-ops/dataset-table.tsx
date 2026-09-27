'use client';

import * as React from 'react';
import { Download, Plus, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

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
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 py-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {name}
          {version ? (
            <Badge variant="secondary" className="font-mono">
              v{version}
            </Badge>
          ) : null}
          <span className="font-mono text-xs font-normal text-muted-foreground tabular-nums">{rows.length} rows</span>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onImport}>
            <Upload /> Import CSV
          </Button>
          <Button size="sm" variant="outline" onClick={onExport}>
            <Download /> Export
          </Button>
          <Button size="sm" onClick={onAddRow}>
            <Plus /> Add row
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
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
      </CardContent>
    </Card>
  );
}
