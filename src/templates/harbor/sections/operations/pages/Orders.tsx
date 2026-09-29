import * as React from 'react';
import { ArrowRight, PackageCheck, Truck, X } from 'lucide-react';
import { BulkActionBar } from '@/components/app/bulk-action-bar';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { DateRangePicker, type DateRange } from '@/components/app/date-range-picker';
import { FilterBar } from '@/components/app/filter-bar';
import { RecordDetailSheet } from '@/components/app/record-detail-sheet';
import { useToast } from '@/components/app/toast';
import { Button } from '@/components/ui/button';
import { DRIVERS, LOCATIONS, ORDER_STATUSES, TODAY, formatDate, formatTime, getDriver, getLocation, orderTotal, orderUnits, type Order } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { OrderStatusBadge, customerName, money, nextOrderStatus, productName, statusLabel } from '../parts';

/** Every order, with saved views by status, filters, a quick-look sheet, and bulk actions. */
export function Orders() {
  const { state, actions } = useHarbor();
  const { navigate, href } = useHarborRouter();
  const { toast } = useToast();

  const [view, setView] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [range, setRange] = React.useState<DateRange>({});
  const [selected, setSelected] = React.useState<Order[]>([]);
  const [tableKey, setTableKey] = React.useState(0);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return state.orders.filter((order) => {
      if (view !== 'all' && order.status !== view) return false;
      if (filters.store && order.locationId !== filters.store) return false;
      if (filters.method && order.method !== filters.method) return false;
      if (filters.payment && order.payment !== filters.payment) return false;
      const day = order.placedAt.slice(0, 10);
      if (range.from && day < range.from) return false;
      if (range.to && day > range.to) return false;
      return !query || `${order.number} ${customerName(order)}`.toLowerCase().includes(query);
    });
  }, [state.orders, view, search, filters, range]);

  const viewCount = (status: string) => state.orders.filter((order) => status === 'all' || order.status === status).length;

  const clearSelection = () => {
    setSelected([]);
    setTableKey((key) => key + 1);
  };

  /** Move every selected order that can take this step, and say how many did. */
  const bulkMove = (to: Order['status'], from: Order['status'][]) => {
    const movable = selected.filter((order) => from.includes(order.status));
    movable.forEach((order) => actions.setOrderStatus(order.id, to));
    toast({ variant: movable.length ? 'success' : 'error', title: movable.length ? `${movable.length} orders moved to ${statusLabel(to).toLowerCase()}` : `None of the selected orders can move to ${statusLabel(to).toLowerCase()}` });
    if (movable.length) clearSelection();
  };

  const bulkAssign = () => {
    const free = DRIVERS.filter((driver) => driver.status !== 'off-duty');
    const targets = selected.filter((order) => order.method === 'delivery' && (order.status === 'packed' || order.status === 'new' || order.status === 'picking') && !order.driverId);
    targets.forEach((order, index) => actions.assignDriver(order.id, free[index % free.length].id));
    toast({ variant: targets.length ? 'success' : 'error', title: targets.length ? `${targets.length} orders shared between ${Math.min(targets.length, free.length)} drivers` : 'Nothing to assign', description: targets.length ? undefined : 'Pick delivery orders that have no driver yet.' });
    if (targets.length) clearSelection();
  };

  const columns: DataColumn<Order>[] = [
    {
      id: 'order',
      header: 'Order',
      sortValue: (order) => order.placedAt,
      cell: (order) => (
        <div>
          <p className="font-mono text-sm font-semibold">{order.number}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(order.placedAt)}, {formatTime(order.placedAt)}
          </p>
        </div>
      ),
    },
    { id: 'customer', header: 'Customer', sortValue: (order) => customerName(order), cell: (order) => <span className="text-sm">{customerName(order)}</span> },
    { id: 'status', header: 'Status', sortValue: (order) => ORDER_STATUSES.findIndex((status) => status.id === order.status), cell: (order) => <OrderStatusBadge status={order.status} /> },
    { id: 'items', header: 'Items', align: 'right', hideBelow: 'md', sortValue: (order) => orderUnits(order), cell: (order) => <span className="font-mono text-sm tabular-nums">{orderUnits(order)}</span> },
    { id: 'total', header: 'Total', align: 'right', sortValue: (order) => orderTotal(order), cell: (order) => <span className="font-mono text-sm tabular-nums">{money(orderTotal(order))}</span> },
    { id: 'store', header: 'From', hideBelow: 'lg', sortValue: (order) => getLocation(order.locationId)?.name ?? '', cell: (order) => <span className="text-sm text-muted-foreground">{getLocation(order.locationId)?.name}</span> },
    { id: 'delivery', header: 'Delivery', hideBelow: 'lg', cell: (order) => <span className="text-sm text-muted-foreground">{order.method === 'pickup' ? 'Pickup' : (getDriver(order.driverId ?? '')?.name ?? 'No driver yet')}</span> },
  ];

  const open = openId ? state.orders.find((order) => order.id === openId) : undefined;
  const next = open ? nextOrderStatus(open) : null;

  return (
    <HarborPage title="Orders" description={`${filtered.length} of ${state.orders.length} online orders. Click a row for a quick look, or open the order.`}>
      <FilterBar
        views={[{ id: 'all', label: 'All', count: viewCount('all') }, ...ORDER_STATUSES.map((status) => ({ id: status.id, label: status.label, count: viewCount(status.id) }))]}
        activeView={view}
        onViewChange={(id) => {
          setView(id);
          clearSelection();
        }}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search number or customer"
        filters={[
          { id: 'store', label: 'Store', options: LOCATIONS.map((location) => ({ value: location.id, label: location.name })) },
          { id: 'method', label: 'Method', options: [{ value: 'delivery', label: 'Delivery' }, { value: 'pickup', label: 'Pickup' }] },
          { id: 'payment', label: 'Payment', options: [{ value: 'paid', label: 'Paid' }, { value: 'pending', label: 'Pending' }, { value: 'refunded', label: 'Refunded' }] },
        ]}
        values={filters}
        onFilterChange={(id, value) => setFilters((current) => ({ ...current, [id]: value }))}
        onClear={() => {
          setSearch('');
          setFilters({});
          setRange({});
        }}
        trailing={<DateRangePicker value={range} onChange={setRange} today={TODAY} max={TODAY} placeholder="Any date" />}
      />

      <DataTable
        key={tableKey}
        rows={filtered}
        columns={columns}
        getRowId={(order) => order.id}
        selectable
        onSelectionChange={setSelected}
        defaultSort={{ id: 'order', dir: 'desc' }}
        pageSize={10}
        pageSizes={[10, 20, 40]}
        onRowClick={(order) => setOpenId(order.id)}
        emptyTitle="No orders match"
        emptyDescription="Try another view or clear the filters."
      />

      <BulkActionBar
        count={selected.length}
        noun={selected.length === 1 ? 'order selected' : 'orders selected'}
        onClear={clearSelection}
        actions={[
          { id: 'pick', label: 'Start picking', icon: PackageCheck, onSelect: () => bulkMove('picking', ['new']) },
          { id: 'pack', label: 'Mark packed', icon: PackageCheck, onSelect: () => bulkMove('packed', ['picking']) },
          { id: 'assign', label: 'Assign drivers', icon: Truck, onSelect: bulkAssign },
          { id: 'cancel', label: 'Cancel', icon: X, destructive: true, onSelect: () => setConfirmCancel(true) },
        ]}
      />

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        destructive
        title={`Cancel ${selected.length} ${selected.length === 1 ? 'order' : 'orders'}?`}
        description="The customers are refunded and any delivery jobs are removed. Orders already delivered are left alone."
        confirmLabel="Cancel orders"
        cancelLabel="Keep them"
        onConfirm={() => {
          const cancellable = selected.filter((order) => order.status !== 'delivered' && order.status !== 'cancelled');
          cancellable.forEach((order) => actions.cancelOrder(order.id));
          toast({ title: `${cancellable.length} orders cancelled` });
          clearSelection();
        }}
      />

      {open ? (
        <RecordDetailSheet
          open
          onOpenChange={(value) => !value && setOpenId(null)}
          title={`Order ${open.number}`}
          subtitle={customerName(open)}
          status={{ label: statusLabel(open.status), tone: open.status === 'new' ? 'accent' : open.status === 'cancelled' ? 'muted' : 'default' }}
          fields={[
            { label: 'Placed', value: `${formatDate(open.placedAt)}, ${formatTime(open.placedAt)}` },
            { label: 'Fulfilled from', value: getLocation(open.locationId)?.name },
            { label: 'Method', value: open.method === 'delivery' ? 'Delivery' : 'Pickup' },
            { label: 'Driver', value: open.method === 'pickup' ? 'Not needed' : (getDriver(open.driverId ?? '')?.name ?? 'None yet') },
            { label: 'Payment', value: open.payment },
            { label: 'Items', value: orderUnits(open), mono: true },
            { label: 'Total', value: money(orderTotal(open)), mono: true },
          ]}
          tabs={[
            {
              id: 'items',
              label: 'Items',
              content: (
                <ul className="divide-y text-sm">
                  {open.items.map((item) => (
                    <li key={item.productId} className="flex items-baseline justify-between gap-3 py-2.5">
                      <span className="min-w-0 truncate">{productName(item.productId)}</span>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {item.qty} × {money(item.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              ),
            },
          ]}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href={href(`/orders/${open.id}`)}>
                  Open order <ArrowRight />
                </a>
              </Button>
              {next ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (next === 'out-for-delivery' && !open.driverId) {
                      toast({ variant: 'error', title: 'Assign a driver first', description: 'Open the order to choose one.' });
                      return;
                    }
                    actions.setOrderStatus(open.id, next);
                    toast({ variant: 'success', title: `${open.number} moved to ${statusLabel(next).toLowerCase()}` });
                  }}
                >
                  Mark {statusLabel(next).toLowerCase()}
                </Button>
              ) : null}
            </div>
          }
        />
      ) : null}
    </HarborPage>
  );
}
