'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { diffLines, diffStats } from '@/components/internal/diff';
import { cn } from '@/lib/utils';

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
  const lines = React.useMemo(() => diffLines(before.split('\n'), after.split('\n')), [before, after]);
  const { added, removed } = diffStats(lines);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 py-4">
        <span className="text-sm font-medium">{title}</span>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {beforeLabel}
          </Badge>
          <ArrowRight className="size-3.5 text-muted-foreground" />
          <Badge className="font-mono">{afterLabel}</Badge>
          <span className="font-mono text-xs tabular-nums">
            <span className="text-muted-foreground">+{added}</span> <span className="text-muted-foreground">−{removed}</span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto border-t font-mono text-xs leading-relaxed">
          {lines.map((line, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-2 px-6',
                line.kind === 'add' && 'bg-primary/[0.06]',
                line.kind === 'remove' && 'text-muted-foreground',
              )}
            >
              <span className="w-3 shrink-0 select-none text-muted-foreground">
                {line.kind === 'add' ? '+' : line.kind === 'remove' ? '−' : ' '}
              </span>
              <span className={cn('whitespace-pre', line.kind === 'remove' && 'line-through decoration-muted-foreground/40')}>
                {line.text || ' '}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
