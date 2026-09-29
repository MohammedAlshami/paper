import * as React from 'react';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { PageHeader } from '@/components/app/page-header';
import { RecordDetailSheet } from '@/components/app/record-detail-sheet';
import { formatDate, formatMoney } from '@/components/app/app-kit';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CUSTOMERS, type Customer } from '../data';
import { AppLayout } from '../layouts';
import type { PageProps } from './types';

const columns: DataColumn<Customer>[] = [
  {
    id: 'name',
    header: 'Customer',
    sortValue: (row) => row.name,
    cell: (row) => (
      <span className="flex flex-col">
        <span className="font-medium">{row.name}</span>
        <span className="text-xs text-muted-foreground">{row.company}</span>
      </span>
    ),
  },
  { id: 'plan', header: 'Plan', hideBelow: 'sm', sortValue: (row) => row.plan, cell: (row) => <Badge variant="outline">{row.plan}</Badge> },
  {
    id: 'status',
    header: 'Status',
    sortValue: (row) => row.status,
    cell: (row) => <Badge variant={row.status === 'Past due' ? 'default' : 'secondary'}>{row.status}</Badge>,
  },
  { id: 'mrr', header: 'MRR', align: 'right', hideBelow: 'md', sortValue: (row) => row.mrr, cell: (row) => <span className="font-mono tabular-nums">{formatMoney(row.mrr)}</span> },
  { id: 'joined', header: 'Joined', hideBelow: 'lg', sortValue: (row) => row.joined, cell: (row) => formatDate(row.joined) },
];

export function CustomersPage(props: PageProps) {
  const [open, setOpen] = React.useState<Customer | null>(null);
  return (
    <AppLayout {...props} active="/app/customers">
      <PageHeader title="Customers" description="Everyone who pays you, or is about to." breadcrumbs={[{ label: 'Ledger' }, { label: 'Customers' }]} actions={<Button>Add customer</Button>} />
      <DataTable
        rows={CUSTOMERS}
        columns={columns}
        getRowId={(row) => row.id}
        searchText={(row) => `${row.name} ${row.company} ${row.email}`}
        searchPlaceholder="Search customers"
        filter={{
          label: 'Status',
          options: ['Active', 'Trial', 'Past due', 'Cancelled'].map((status) => ({ value: status, label: status })),
          match: (row, value) => row.status === value,
        }}
        defaultSort={{ id: 'name', dir: 'asc' }}
        pageSize={8}
        selectable
        bulkActions={(selected, clear) => (
          <>
            <Button size="sm" variant="outline" onClick={clear}>
              Export {selected.length}
            </Button>
            <Button size="sm" variant="outline" onClick={clear}>
              Send reminder
            </Button>
          </>
        )}
        onRowClick={setOpen}
      />
      <RecordDetailSheet
        open={Boolean(open)}
        onOpenChange={(next) => !next && setOpen(null)}
        title={open?.name ?? ''}
        subtitle={open?.company}
        status={open ? { label: open.status, tone: open.status === 'Past due' ? 'accent' : 'muted' } : undefined}
        fields={
          open
            ? [
                { label: 'Email', value: open.email },
                { label: 'Plan', value: open.plan },
                { label: 'Monthly revenue', value: formatMoney(open.mrr), mono: true },
                { label: 'Country', value: open.country },
                { label: 'Customer since', value: formatDate(open.joined) },
              ]
            : []
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setOpen(null)}>
              Close
            </Button>
            <Button onClick={() => setOpen(null)}>Send invoice</Button>
          </>
        }
      />
    </AppLayout>
  );
}
