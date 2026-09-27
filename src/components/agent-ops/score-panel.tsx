'use client';

import * as React from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface Criterion {
  name: string;
  /** 0–100. */
  score: number;
  weight?: number;
  comment?: string;
}

/** ScorePanel — how the graders scored this output, criterion by criterion. */
export function ScorePanel({
  criteria,
  overall,
  verdict,
  notes,
  onVerdict,
  onSaveNote,
  className,
}: {
  criteria: Criterion[];
  overall?: number;
  verdict?: 'pass' | 'fail' | 'needs-review';
  notes?: string;
  onVerdict?: (verdict: 'pass' | 'fail') => void;
  onSaveNote?: (note: string) => void;
  className?: string;
}) {
  const [note, setNote] = React.useState(notes ?? '');
  const total = overall ?? Math.round(criteria.reduce((sum, item) => sum + item.score, 0) / Math.max(1, criteria.length));

  return (
    <Card className={cn('gap-0 py-0', className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">Score</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {verdict ? (
            <Badge variant={verdict === 'fail' ? 'destructive' : verdict === 'pass' ? 'default' : 'outline'}>{verdict}</Badge>
          ) : null}
          <Badge variant="secondary" className="font-mono tabular-nums">
            {total}/100
          </Badge>
        </div>
      </CardHeader>

      <Separator />
      <CardContent className="space-y-3 py-4">
        {criteria.map((item) => (
          <div key={item.name} className="grid gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm">{item.name}</span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {item.weight ? `${item.weight}× ` : ''}
                {item.score}
              </span>
            </div>
            <span className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${item.score}%` }} />
            </span>
            {item.comment ? <p className="text-xs text-muted-foreground">{item.comment}</p> : null}
          </div>
        ))}
      </CardContent>

      <Separator />
      <CardContent className="space-y-3 py-4">
        <Textarea
          value={note}
          rows={3}
          placeholder="Why this score?"
          onChange={(event) => setNote(event.target.value)}
          className="text-xs leading-relaxed"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onSaveNote?.(note)}>
            Save note
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => onVerdict?.('fail')}>
              <ThumbsDown /> Override to fail
            </Button>
            <Button size="sm" onClick={() => onVerdict?.('pass')}>
              <ThumbsUp /> Accept
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
