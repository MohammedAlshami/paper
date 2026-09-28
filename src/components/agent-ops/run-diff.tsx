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
