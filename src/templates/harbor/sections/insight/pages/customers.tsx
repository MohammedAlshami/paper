import * as React from 'react';
import { Download, Mail, Star } from 'lucide-react';
import { BulkActionBar } from '@/components/app/bulk-action-bar';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { FilterBar } from '@/components/app/filter-bar';
import { RecordDetailSheet } from '@/components/app/record-detail-sheet';
import { Timeline } from '@/components/app/timeline';
import { useToast } from '@/components/app/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CUSTOMERS, ORDER_STATUSES, customerSpend, formatDate, formatMoney, ordersByCustomer, orderTotal, relativeTime, type Customer } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';

interface Row extends Customer {
  orders: number;
  spend: number;
  lastOrder?: string;
}

const SEGMENTS = [
  { id: 'all', label: 'Everyone' },
  { id: 'vip', label: 'VIP' },
  { id: 'regular', label: 'Regular' },
  { id: 'new', label: 'New' },
] as const;

const columns: DataColumn<Row>[] = [
  {
    id: 'name',
    header: 'Customer',
    sortValue: (row) => row.name,
    cell: (row) => (
      <span className="flex flex-col">
        <span className="font-medium">{row.name}</span>
        <span className="text-xs text-muted-foreground">{row.email}</span>
      </span>
    ),
  },
  { id: 'segment', header: 'Segment', hideBelow: 'sm', sortValue: (row) => row.segment, cell: (row) => <Badge variant={row.segment === 'vip' ? 'default' : 'outline'}>{row.segment === 'vip' ? 'VIP' : row.segment[0].toUpperCase() + row.segment.slice(1)}</Badge> },
  { id: 'orders', header: 'Orders', align: 'right', hideBelow: 'md', sortValue: (row) => row.orders, cell: (row) => <span className="font-mono tabular-nums">{row.orders}</span> },
  { id: 'spend', header: 'Spend', align: 'right', sortValue: (row) => row.spend, cell: (row) => <span className="font-mono tabular-nums">{formatMoney(row.spend)}</span> },
  { id: 'last', header: 'Last order', hideBelow: 'lg', sortValue: (row) => row.lastOrder ?? '', cell: (row) => (row.lastOrder ? relativeTime(row.lastOrder) : <span className="text-muted-foreground">Never</span>) },
];

/** Everyone who has bought, with the segment views, a detail sheet, and bulk actions. */
export function CustomersPage() {
  const { state, actions } = useHarbor();
  const { navigate } = useHarborRouter();
  const { toast } = useToast();
  const [view, setView] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<Row[]>([]);
  const [tableKey, setTableKey] = React.useState(0);
  const [open, setOpen] = React.useState<Row | null>(null);

  const rows: Row[] = React.useMemo(
    () =>
      CUSTOMERS.map((customer) => {
        const orders = ordersByCustomer(state.orders, customer.id);
        return { ...customer, orders: orders.length, spend: customerSpend(state.orders, customer.id), lastOrder: [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt))[0]?.placedAt };
      }),
    [state.orders],
  );

  const visible = rows.filter((row) => {
    if (view !== 'all' && row.segment !== view) return false;
    if (filters.marketing === 'yes' && !row.marketing) return false;
    if (filters.marketing === 'no' && row.marketing) return false;
    const needle = search.trim().toLowerCase();
    return !needle || `${row.name} ${row.email} ${row.address}`.toLowerCase().includes(needle);
  });

  const clear = () => {
    setSelected([]);
    setTableKey((key) => key + 1);
  };
  const names = (list: Row[]) => (list.length === 1 ? list[0].name : `${list.length} customers`);
  const customerOrders = open ? ordersByCustomer(state.orders, open.id).sort((a, b) => b.placedAt.localeCompare(a.placedAt)) : [];

  return (
    <HarborPage
      title="Customers"
      description={`${CUSTOMERS.length} people have ordered. Open one to see what they buy.`}
      actions={
        <Button variant="outline" onClick={() => toast({ title: 'Customer export started', description: `${visible.length} customers, CSV`, variant: 'success' })}>
          <Download /> Export
        </Button>
      }
    >
      <FilterBar
        views={SEGMENTS.map((segment) => ({ id: segment.id, label: segment.label, count: segment.id === 'all' ? rows.length : rows.filter((row) => row.segment === segment.id).length }))}
        activeView={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email or street"
        filters={[{ id: 'marketing', label: 'Marketing', options: [{ value: 'yes', label: 'Subscribed' }, { value: 'no', label: 'Not subscribed' }] }]}
        values={filters}
        onFilterChange={(id, value) => setFilters((current) => ({ ...current, [id]: value }))}
        onClear={() => {
          setSearch('');
          setFilters({});
        }}
      />

      <DataTable
        key={tableKey}
        rows={visible}
        columns={columns}
        getRowId={(row) => row.id}
        defaultSort={{ id: 'spend', dir: 'desc' }}
        pageSize={10}
        pageSizes={[10, 20]}
        selectable
        onSelectionChange={setSelected}
        onRowClick={setOpen}
        emptyTitle="No customers match"
        emptyDescription="Try another view or clear the filters."
      />

      <BulkActionBar
        count={selected.length}
        noun={selected.length === 1 ? 'customer selected' : 'customers selected'}
        onClear={clear}
        actions={[
          {
            id: 'email',
            label: 'Email',
            icon: Mail,
            onSelect: () => {
              toast({ title: `Email drafted for ${names(selected)}`, variant: 'success' });
              actions.log('drafted an email to', names(selected), 'order');
              clear();
            },
          },
          {
            id: 'vip',
            label: 'Add to VIP list',
            icon: Star,
            onSelect: () => {
              toast({ title: `${names(selected)} added to the VIP list`, variant: 'success' });
              actions.log('added to the VIP list:', names(selected), 'order');
              clear();
            },
          },
          {
            id: 'export',
            label: 'Export',
            icon: Download,
            onSelect: () => {
              toast({ title: `Exported ${selected.length} customers`, description: 'CSV', variant: 'success' });
              clear();
            },
          },
        ]}
      />

      <RecordDetailSheet
        open={Boolean(open)}
        onOpenChange={(next) => !next && setOpen(null)}
        title={open?.name ?? ''}
        subtitle={open?.email}
        status={open ? { label: open.segment === 'vip' ? 'VIP' : open.segment, tone: open.segment === 'vip' ? 'accent' : 'muted' } : undefined}
        fields={
          open
            ? [
                { label: 'Phone', value: open.phone, mono: true },
                { label: 'Address', value: open.address },
                { label: 'Customer since', value: formatDate(open.joined, { day: 'numeric', month: 'short', year: 'numeric' }) },
                { label: 'Orders', value: String(open.orders), mono: true },
                { label: 'Lifetime spend', value: formatMoney(open.spend), mono: true },
                { label: 'Marketing', value: open.marketing ? 'Subscribed' : 'Not subscribed' },
              ]
            : []
        }
        tabs={
          open
            ? [
                {
                  id: 'orders',
                  label: `Orders ${customerOrders.length}`,
                  content: customerOrders.length ? (
                    <Timeline
                      events={customerOrders.slice(0, 6).map((order) => ({
                        id: order.id,
                        title: `Order ${order.number}`,
                        detail: `${formatMoney(orderTotal(order), 'USD', 2)} · ${ORDER_STATUSES.find((status) => status.id === order.status)?.label ?? order.status}`,
                        time: formatDate(order.placedAt),
                        state: order.status === 'delivered' || order.status === 'cancelled' ? 'done' : 'current',
                      }))}
                    />
                  ) : (
                    <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
                  ),
                },
              ]
            : []
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setOpen(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                const id = open?.id;
                setOpen(null);
                if (id) navigate(`/customers/${id}`);
              }}
            >
              Open customer
            </Button>
          </>
        }
      />
    </HarborPage>
  );
}
