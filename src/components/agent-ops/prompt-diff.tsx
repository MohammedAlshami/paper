'use client';

import * as React from 'react';
import { ArrowRight, Check, Undo2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { diffLines, diffStats } from '@/components/internal/diff';
import { cn } from '@/lib/utils';

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
  const lines = React.useMemo(() => diffLines(before.split('\n'), after.split('\n')), [before, after]);
  const { added, removed } = diffStats(lines);
  const beforeVersion = versions[0];
  const afterVersion = versions[versions.length - 1];

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 py-4">
        <span className="text-sm font-medium">Prompt versions</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {versions.map((version) => (
            <button key={version.id} type="button" onClick={() => onSelectVersion?.(version)}>
              <Badge variant={version.id === activeVersionId ? 'default' : 'outline'} className="font-mono">
                {version.label}
              </Badge>
            </button>
          ))}
        </div>
      </CardHeader>

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
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          +{added} −{removed}
        </span>
      </div>

      <Separator />
      <div className="overflow-x-auto font-mono text-xs leading-relaxed">
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

      <Separator />
      <CardContent className="flex flex-wrap items-center gap-2 py-4">
        <span className="mr-auto font-mono text-xs text-muted-foreground">
          {afterVersion?.status === 'draft' ? 'draft — not used by any workflow yet' : 'published'}
        </span>
        <Button size="sm" variant="outline" onClick={onDiscard}>
          <Undo2 /> Discard
        </Button>
        <Button size="sm" onClick={onPublish}>
          <Check /> Publish version
        </Button>
      </CardContent>
    </Card>
  );
}
