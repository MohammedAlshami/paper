'use client';

import * as React from 'react';
import { ArrowDownToLine, Search, WrapText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface LogLine {
  id: string;
  ts: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source?: string;
}

const LEVELS: LogLine['level'][] = ['debug', 'info', 'warn', 'error'];

/** LogViewer — the raw logs, with the search box you always end up needing. */
export function LogViewer({ lines, className }: { lines: LogLine[]; className?: string }) {
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState<LogLine['level'][]>(LEVELS);
  const [wrap, setWrap] = React.useState(false);
  const [follow, setFollow] = React.useState(true);
  const scroller = React.useRef<HTMLDivElement>(null);

  const shown = lines.filter(
    (line) =>
      active.includes(line.level) &&
      (!query || `${line.source ?? ''} ${line.message}`.toLowerCase().includes(query.toLowerCase())),
  );

  React.useEffect(() => {
    if (follow && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [follow, lines.length, query]);

  const toggle = (level: LogLine['level']) =>
    setActive((prev) => (prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level]));

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">Logs</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground start-2.5" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter logs"
              className="h-8 w-44 ps-8 font-mono text-xs"
            />
          </div>
          <Button size="sm" variant={wrap ? 'secondary' : 'ghost'} onClick={() => setWrap((value) => !value)}>
            <WrapText /> Wrap
          </Button>
          <Button size="sm" variant={follow ? 'secondary' : 'ghost'} onClick={() => setFollow((value) => !value)}>
            <ArrowDownToLine /> Follow
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-wrap gap-1.5 border-t px-6 py-2">
          {LEVELS.map((level) => (
            <button key={level} type="button" onClick={() => toggle(level)} aria-pressed={active.includes(level)}>
              <Badge variant={active.includes(level) ? 'default' : 'outline'} className="font-mono">
                {level}
              </Badge>
            </button>
          ))}
        </div>
        <div ref={scroller} className="max-h-72 overflow-auto border-t px-6 py-3 font-mono text-xs leading-relaxed">
          {shown.map((line) => (
            <div key={line.id} className={cn('flex gap-3', wrap ? 'items-start' : 'items-center')}>
              <span className="shrink-0 text-muted-foreground tabular-nums">{line.ts}</span>
              <span
                className={cn(
                  'w-10 shrink-0 uppercase',
                  line.level === 'error' && 'text-destructive',
                  line.level === 'warn' && 'text-foreground',
                  line.level === 'debug' && 'text-muted-foreground/70',
                  line.level === 'info' && 'text-muted-foreground',
                )}
              >
                {line.level}
              </span>
              {line.source ? <span className="shrink-0 text-muted-foreground">{line.source}</span> : null}
              <span className={cn('min-w-0 flex-1', !wrap && 'truncate')}>{line.message}</span>
            </div>
          ))}
          {!shown.length ? <p className="py-4 text-muted-foreground">Nothing matches.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
