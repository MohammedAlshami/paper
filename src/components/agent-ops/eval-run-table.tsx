'use client';

import * as React from 'react';
import { Play, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

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
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
      </CardHeader>

      <CardContent className="p-0">
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
      </CardContent>
    </Card>
  );
}
