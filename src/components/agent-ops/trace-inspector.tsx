'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/internal/badge';
import { Rule } from '@/components/internal/rule';
import { Eyebrow } from '@/components/internal/eyebrow';

export type SpanKind = 'agent' | 'llm' | 'tool' | 'retrieval';

export interface Span {
  id: string;
  name: string;
  kind: SpanKind;
  durationMs: number;
  status?: 'ok' | 'error';
  tokens?: number;
  cost?: number;
  input?: string;
  output?: string;
}

const kindTone: Record<SpanKind, string> = {
  agent: 'bg-ink',
  llm: 'bg-accent',
  tool: 'bg-ink-faint',
  retrieval: 'bg-line-strong',
};

/**
 * Tool and trace inspector — an embeddable span viewer with OTel-shaped props.
 * Today this only exists inside monolithic observability platforms.
 */
export function TraceInspector({
  spans,
  className,
  currency = '$',
}: {
  spans: Span[];
  className?: string;
  currency?: string;
}) {
  const [open, setOpen] = React.useState<string | null>(spans[0]?.id ?? null);
  const totalMs = spans.reduce((n, s) => n + s.durationMs, 0);
  const totalTokens = spans.reduce((n, s) => n + (s.tokens ?? 0), 0);
  const totalCost = spans.reduce((n, s) => n + (s.cost ?? 0), 0);
  const max = Math.max(...spans.map((s) => s.durationMs), 1);

  return (
    <section
      className={cn('rounded-paper-lg border border-dashed border-line bg-raised', className)}
      aria-label="Trace"
    >
      <header className="flex flex-wrap items-end justify-between gap-3 p-6 pb-0">
        <div>
          <Eyebrow className="mb-2">Trace</Eyebrow>
          <h3 className="font-display text-lg font-bold tracking-tight text-ink">
            {spans.length} spans · {(totalMs / 1000).toFixed(1)}s
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="faint">{totalTokens.toLocaleString()} tokens</Badge>
          <Badge tone="faint">
            {currency}
            {totalCost.toFixed(4)}
          </Badge>
        </div>
      </header>

      <Rule className="mt-5" />

      <ul className="divide-y divide-dashed divide-line">
        {spans.map((span) => {
          const isOpen = open === span.id;
          return (
            <li key={span.id}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : span.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-6 py-3.5 text-left transition-colors hover:bg-ink/[0.03]"
              >
                <ChevronRight
                  aria-hidden
                  className={cn(
                    'size-4 shrink-0 text-ink-faint transition-transform',
                    isOpen && 'rotate-90',
                  )}
                />
                <span aria-hidden className={cn('size-2 shrink-0 rounded-[2px]', kindTone[span.kind])} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{span.name}</span>
                  <span className="mt-0.5 block font-mono text-[11px] text-ink-faint">
                    {span.kind}
                    {span.tokens ? ` · ${span.tokens.toLocaleString()} tok` : ''}
                    {span.cost ? ` · ${currency}${span.cost.toFixed(4)}` : ''}
                  </span>
                </span>
                <span aria-hidden className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-ink/[0.07] sm:block">
                  <span
                    className="block h-full rounded-full bg-ink/40"
                    style={{ width: `${Math.max(4, (span.durationMs / max) * 100)}%` }}
                  />
                </span>
                <span className="w-14 shrink-0 text-right font-mono text-[11px] text-ink-muted">
                  {span.durationMs}ms
                </span>
                {span.status === 'error' ? <Badge tone="accent">error</Badge> : null}
              </button>

              {isOpen && (span.input || span.output) ? (
                <div className="grid gap-3 px-6 pb-5 pl-[3.4rem] lg:grid-cols-2">
                  {span.input ? (
                    <div className="overflow-hidden rounded-paper border border-dashed border-line">
                      <p className="border-b border-dashed border-line bg-sunk/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                        input
                      </p>
                      <pre className="max-h-52 overflow-auto bg-sunk/30 p-3 font-mono text-[12px] leading-relaxed text-ink">
                        {span.input}
                      </pre>
                    </div>
                  ) : null}
                  {span.output ? (
                    <div className="overflow-hidden rounded-paper border border-dashed border-line">
                      <p className="border-b border-dashed border-line bg-sunk/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                        output
                      </p>
                      <pre className="max-h-52 overflow-auto bg-sunk/30 p-3 font-mono text-[12px] leading-relaxed text-ink">
                        {span.output}
                      </pre>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
