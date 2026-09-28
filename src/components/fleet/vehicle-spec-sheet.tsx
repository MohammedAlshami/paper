'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SpecRow {
  label: string;
  value: string;
  /** Set in the mono font and given a copy button, for VINs, plates and part numbers. */
  copyable?: boolean;
}

export interface SpecGroup {
  title: string;
  rows: SpecRow[];
}

function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${value}`}
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="group inline-flex max-w-full items-center gap-1.5 rounded font-mono text-sm tabular-nums hover:text-foreground"
    >
      {/* The icon sits before the value, so the value stays flush right with the rows around it. */}
      {copied ? <Check className="size-3.5 shrink-0" /> : <Copy className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />}
      <span className="truncate">{value}</span>
    </button>
  );
}

/** VehicleSpecSheet — the facts about a vehicle, grouped: identity, powertrain, capacity, compliance. */
export function VehicleSpecSheet({
  title,
  subtitle,
  groups,
  className,
}: {
  title: string;
  subtitle?: string;
  groups: SpecGroup[];
  className?: string;
}) {
  return (
    <Card className={cn('@container gap-0 overflow-hidden py-0', className)}>
      <div className="border-b px-4 py-3">
        <h3 className="text-base font-bold">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="grid grid-cols-1 divide-y @lg:grid-cols-2 @lg:divide-x @lg:divide-y-0">
        {groups.map((group, index) => (
          <section key={group.title} className={cn('px-4 py-3', index >= 2 && '@lg:border-t')}>
            <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group.title}</h4>
            <dl>
              {group.rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-dashed py-2 last:border-b-0">
                  <dt className="shrink-0 text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="min-w-0 text-right text-sm font-medium">{row.copyable ? <CopyValue value={row.value} /> : row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Card>
  );
}
