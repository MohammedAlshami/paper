'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate, formatMoney } from './app-kit';

export type InvoiceStatus = 'paid' | 'open' | 'failed' | 'refunded';

export interface Invoice {
  id: string;
  number: string;
  /** ISO date. */
  date: string;
  amount: number;
  status: InvoiceStatus;
  description?: string;
}

const STATUS_LABEL: Record<InvoiceStatus, string> = { paid: 'Paid', open: 'Open', failed: 'Failed', refunded: 'Refunded' };

/** InvoiceList — past invoices with their status and a download button. Failed ones take the accent colour. */
export function InvoiceList({
  invoices,
  currency = 'USD',
  onDownload,
  accentColor = '#ec4899',
  className,
}: {
  invoices: Invoice[];
  currency?: string;
  onDownload?: (invoice: Invoice) => void;
  accentColor?: string;
  className?: string;
}) {
  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <ul className="divide-y">
        {invoices.map((invoice) => (
          <li key={invoice.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{invoice.description ?? invoice.number}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {invoice.number} · {formatDate(invoice.date)}
              </p>
            </div>
            <Badge variant={invoice.status === 'paid' ? 'outline' : invoice.status === 'open' ? 'secondary' : 'outline'} className={invoice.status === 'failed' ? 'border-transparent text-white' : undefined} style={invoice.status === 'failed' ? { background: accentColor } : undefined}>
              {STATUS_LABEL[invoice.status]}
            </Badge>
            <span className="w-20 text-right font-mono text-sm tabular-nums">{formatMoney(invoice.amount, currency, 2)}</span>
            <Button variant="ghost" size="icon-sm" aria-label={`Download ${invoice.number}`} onClick={() => onDownload?.(invoice)}>
              <Download />
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
