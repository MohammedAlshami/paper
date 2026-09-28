'use client';

import * as React from 'react';
import { diffLines, diffStats } from '@/components/internal/diff';
import { cn } from '@/lib/utils';

/** Computes the line diff once and memoises the +/− counts alongside it. */
export function useDiff(before: string, after: string) {
  const lines = React.useMemo(() => diffLines(before.split('\n'), after.split('\n')), [before, after]);
  const stats = React.useMemo(() => diffStats(lines), [lines]);
  return { lines, ...stats };
}

/** DiffLines — the +/− line-by-line body shared by RunDiff and PromptDiff. */
export function DiffLines({ lines, className }: { lines: ReturnType<typeof useDiff>['lines']; className?: string }) {
  return (
    <div className={cn('overflow-x-auto font-mono text-xs leading-relaxed', className)}>
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
  );
}

/** DiffStatBadge — the "+N −M" mono counter used next to a diff's version badges. */
export function DiffStatBadge({ added, removed, className }: { added: number; removed: number; className?: string }) {
  return (
    <span className={cn('font-mono text-xs tabular-nums', className)}>
      <span className="text-muted-foreground">+{added}</span> <span className="text-muted-foreground">−{removed}</span>
    </span>
  );
}
