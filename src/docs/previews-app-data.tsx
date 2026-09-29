import * as React from 'react';
import { Download, Trash2 } from 'lucide-react';
import { ActivityFeed } from '@/components/app/activity-feed';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { RecordDetail, RecordDetailSheet } from '@/components/app/record-detail-sheet';
import { RevenueChart } from '@/components/app/revenue-chart';
import { StatCardGrid } from '@/components/app/stat-card-grid';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { initials } from '@/components/app/app-kit';
import { ACTIVITY, APP_TODAY, CUSTOMER_EVENTS, CUSTOMER_RECORD, CUSTOMER_STATUSES, CUSTOMERS, REVENUE, STATS, type DemoCustomer } from './fixtures/app-data';

const NARROW = 'w-full max-w-[28rem]';
const MEDIUM = 'w-full max-w-[36rem]';
const WIDE = 'w-full max-w-[60rem]';

const money = (value: number) => (value ? `$${value}` : '$0');

export const CUSTOMER_COLUMNS: DataColumn<DemoCustomer>[] = [
  {
    id: 'name',
    header: 'Customer',
    sortValue: (row) => row.name,
    cell: (row) => (
      <span className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarFallback>{initials(row.name)}</AvatarFallback>
        </Avatar>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold">{row.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{row.email}</span>
        </span>
      </span>
    ),
  },
  { id: 'status', header: 'Status', sortValue: (row) => row.status, cell: (row) => <Badge variant={row.status === 'Past due' ? 'default' : 'outline'} style={row.status === 'Past due' ? { background: '#ec4899' } : undefined}>{row.status}</Badge> },
  { id: 'plan', header: 'Plan', hideBelow: 'sm', sortValue: (row) => row.plan, cell: (row) => row.plan },
  { id: 'mrr', header: 'MRR', align: 'right', sortValue: (row) => row.mrr, cell: (row) => <span className="font-mono tabular-nums">{money(row.mrr)}</span> },
  { id: 'joined', header: 'Joined', hideBelow: 'md', align: 'right', sortValue: (row) => row.joined, cell: (row) => <span className="font-mono text-xs text-muted-foreground">{row.joined}</span> },
];

function SheetDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex w-full max-w-[28rem] flex-col gap-3">
      <div className="flex min-h-[26rem] flex-col overflow-hidden rounded-xl border bg-card">
        <RecordDetail {...CUSTOMER_RECORD} tabs={[{ id: 'activity', label: 'Activity', content: <ul className="divide-y">{CUSTOMER_EVENTS.map((event) => <li key={event.id} className="flex justify-between py-2.5 text-sm"><span>{event.text}</span><span className="text-muted-foreground">{event.when}</span></li>)}</ul> }]} actions={<><Button variant="outline" size="sm">Refund</Button><Button size="sm">Message</Button></>} />
      </div>
      <Button variant="outline" onClick={() => setOpen(true)}>Open as a sheet</Button>
      <RecordDetailSheet open={open} onOpenChange={setOpen} {...CUSTOMER_RECORD} actions={<Button size="sm">Message</Button>} />
    </div>
  );
}

export const APP_DATA_PREVIEWS: Record<string, React.ReactNode> = {
  'data-table': (
    <DataTable
      className={WIDE}
      rows={CUSTOMERS}
      columns={CUSTOMER_COLUMNS}
      getRowId={(row) => row.id}
      searchText={(row) => `${row.name} ${row.email} ${row.country}`}
      searchPlaceholder="Search customers"
      filter={{ label: 'Status', options: CUSTOMER_STATUSES, match: (row, value) => row.status === value }}
      defaultSort={{ id: 'mrr', dir: 'desc' }}
      selectable
      bulkActions={(selected, clear) => (
        <>
          <Button variant="outline" size="sm" onClick={clear}><Download /> Export {selected.length}</Button>
          <Button variant="outline" size="sm" onClick={clear}><Trash2 /> Delete</Button>
        </>
      )}
      onRowClick={() => undefined}
    />
  ),
  'stat-card-grid': <StatCardGrid className={WIDE} stats={STATS} />,
  'activity-feed': <ActivityFeed className={MEDIUM} items={ACTIVITY} today={APP_TODAY} />,
  'revenue-chart': <RevenueChart className={MEDIUM} data={REVENUE} title="Revenue" />,
  'record-detail-sheet': <SheetDemo />,
};

export const APP_DATA_EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {
  'data-table': [
    { label: 'Loading', node: <DataTable className={WIDE} rows={[]} columns={CUSTOMER_COLUMNS} getRowId={(row: DemoCustomer) => row.id} loading /> },
    { label: 'Nothing to show', node: <DataTable className={WIDE} rows={[]} columns={CUSTOMER_COLUMNS} getRowId={(row: DemoCustomer) => row.id} emptyTitle="No customers yet" emptyDescription="Invite the first one to get started." /> },
  ],
  'stat-card-grid': [{ label: 'Three cards', node: <StatCardGrid className={MEDIUM} stats={STATS.slice(0, 3)} period="vs Aug" /> }],
  'activity-feed': [{ label: 'Short list', node: <ActivityFeed className={MEDIUM} items={ACTIVITY.slice(0, 3)} today={APP_TODAY} title="Recent" /> }],
  'revenue-chart': [{ label: 'The last year, as bars', node: <RevenueChart className={MEDIUM} data={REVENUE} defaultRange="12m" title="Yearly revenue" /> }],
  'record-detail-sheet': [],
};
