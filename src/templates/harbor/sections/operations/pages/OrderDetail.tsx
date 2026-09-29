import * as React from 'react';
import { ArrowRight, PackageSearch, Truck } from 'lucide-react';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { EmptyState } from '@/components/app/empty-state';
import { RecordDetail } from '@/components/app/record-detail-sheet';
import { Timeline } from '@/components/app/timeline';
import { useToast } from '@/components/app/toast';
import { DeliveryTrackerCard } from '@/components/maps/delivery-tracker-card';
import { ProofOfDelivery } from '@/components/maps/proof-of-delivery';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DRIVERS, formatDate, formatTime, getCustomer, getDriver, getLocation, getProduct, getVehicle, jobForOrder, orderSubtotal, orderTax, orderTimeline, orderTotal, ordersByCustomer, type OrderItem } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { DROP_OFF_PHOTO, SIGNATURE_PATH } from '../data/media';
import { OrderStatusBadge, money, nextOrderStatus, productName, statusLabel } from '../parts';
import { gridRoute, positionAlong } from '../route';

const STEPS = [
  { id: 'packed', label: 'Packed' },
  { id: 'picked-up', label: 'Picked up' },
  { id: 'on-the-way', label: 'On the way' },
  { id: 'arriving', label: 'Arriving' },
  { id: 'delivered', label: 'Delivered' },
];

const UNASSIGNED = '__none__';

/** One order from every side: what is in it, who it is for, where it is, and what to do next. */
export function OrderDetail({ id }: { id: string }) {
  const { state, actions } = useHarbor();
  const { navigate, href } = useHarborRouter();
  const { toast } = useToast();
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  const order = state.orders.find((candidate) => candidate.id === id);
  const job = order ? jobForOrder(state.jobs, order.id) : undefined;
  const route = React.useMemo(() => (job ? gridRoute(job.pickup.position, job.dropoff.position) : []), [job]);

  if (!order) {
    return (
      <HarborPage title="Order not found" crumbs={[{ label: 'Orders', path: '/orders' }]}>
        <EmptyState icon={PackageSearch} title={`There is no order ${id}`} description="It may have been mistyped. The orders list has every order." action={{ label: 'Back to orders', onClick: () => navigate('/orders') }} />
      </HarborPage>
    );
  }

  const customer = getCustomer(order.customerId);
  const driver = getDriver(order.driverId ?? '');
  const vehicle = getVehicle(order.vehicleId ?? driver?.vehicleId ?? '');
  const next = nextOrderStatus(order);
  const canAssign = order.method === 'delivery' && order.status !== 'delivered' && order.status !== 'cancelled';

  const advance = () => {
    if (!next) return;
    if (next === 'out-for-delivery' && !order.driverId) {
      toast({ variant: 'error', title: 'Assign a driver first', description: 'Choose one from the list on this page.' });
      return;
    }
    actions.setOrderStatus(order.id, next);
    toast({ variant: 'success', title: `${order.number} moved to ${statusLabel(next).toLowerCase()}` });
  };

  const columns: DataColumn<OrderItem>[] = [
    {
      id: 'product',
      header: 'Product',
      sortValue: (item) => productName(item.productId),
      cell: (item) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{productName(item.productId)}</p>
          <p className="font-mono text-xs text-muted-foreground">{getProduct(item.productId)?.sku}</p>
        </div>
      ),
    },
    { id: 'qty', header: 'Qty', align: 'right', cell: (item) => <span className="font-mono text-sm tabular-nums">{item.qty}</span> },
    { id: 'price', header: 'Price', align: 'right', hideBelow: 'sm', cell: (item) => <span className="font-mono text-sm tabular-nums">{money(item.price)}</span> },
    { id: 'line', header: 'Total', align: 'right', cell: (item) => <span className="font-mono text-sm tabular-nums">{money(item.qty * item.price)}</span> },
  ];

  const progress = job?.progress ?? 0;
  const currentStepId = progress < 0.08 ? 'picked-up' : progress < 0.8 ? 'on-the-way' : 'arriving';

  return (
    <HarborPage
      title={`Order ${order.number}`}
      description={`Placed ${formatDate(order.placedAt)} at ${formatTime(order.placedAt)}, fulfilled from ${getLocation(order.locationId)?.name}.`}
      crumbs={[{ label: 'Orders', path: '/orders' }]}
      badge={<OrderStatusBadge status={order.status} />}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {order.status !== 'delivered' && order.status !== 'cancelled' ? (
            <Button variant="outline" onClick={() => setConfirmCancel(true)}>
              Cancel order
            </Button>
          ) : null}
          {next ? (
            <Button onClick={advance}>
              Mark {statusLabel(next).toLowerCase()} <ArrowRight />
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="flex min-w-0 flex-col gap-3">
            <h2 className="text-sm font-bold">Items</h2>
            <DataTable rows={order.items} columns={columns} getRowId={(item) => item.productId} pageSize={20} pageSizes={[20]} />
          </section>

          {canAssign ? (
            <Card className="gap-0 overflow-hidden py-0">
              <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <Truck className="size-4 text-muted-foreground" /> Driver
                  </p>
                  <p className="text-sm text-muted-foreground">{driver ? `${driver.name}${vehicle ? ` in ${vehicle.name}` : ''}` : 'Nobody is assigned yet.'}</p>
                </div>
                <Select
                  value={order.driverId ?? UNASSIGNED}
                  onValueChange={(value) => {
                    actions.assignDriver(order.id, value === UNASSIGNED ? null : value);
                    toast({ title: value === UNASSIGNED ? 'Driver removed' : `${getDriver(value)?.name} assigned`, description: order.number });
                  }}
                >
                  <SelectTrigger className="w-full sm:w-64" aria-label="Assign a driver">
                    <SelectValue placeholder="Assign a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                    {DRIVERS.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id} disabled={candidate.status === 'off-duty'}>
                        {candidate.name} · {getVehicle(candidate.vehicleId)?.name}
                        {candidate.status === 'off-duty' ? ' (off duty)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          ) : null}

          {order.status === 'out-for-delivery' && job && driver ? (
            <DeliveryTrackerCard
              className="w-full"
              orderId={order.number}
              origin={job.pickup}
              destination={job.dropoff}
              driver={{ name: driver.name, vehicle: vehicle ? `${vehicle.make} ${vehicle.model}` : 'Delivery van', plate: vehicle?.plate, rating: driver.rating, position: positionAlong(route, progress) }}
              route={route}
              steps={STEPS}
              currentStepId={currentStepId}
              etaMinutes={job.etaMinutes ?? 10}
            />
          ) : null}

          {order.status === 'delivered' && job ? (
            <ProofOfDelivery
              className="w-full"
              deliveredAt={`${formatDate(order.deliveredAt ?? order.placedAt, { weekday: 'short', day: 'numeric', month: 'short' })}, ${formatTime(order.deliveredAt ?? order.placedAt)}`}
              recipient={customer?.name ?? 'Customer'}
              address={job.dropoff.label}
              position={job.dropoff.position}
              photoUrl={DROP_OFF_PHOTO}
              photoCaption="Left at the front door"
              signaturePath={SIGNATURE_PATH}
              driver={driver?.name}
              note={order.note}
            />
          ) : null}

          {order.status === 'packed' && order.method === 'delivery' ? (
            <EmptyState icon={Truck} title="Waiting for a van" description={order.driverId ? 'A driver is assigned. Mark it out for delivery when they leave.' : 'Assign a driver above, then mark it out for delivery.'} />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card className="gap-0 overflow-hidden py-0">
            <p className="border-b px-4 py-3 text-sm font-bold">Progress</p>
            <div className="p-4">
              <Timeline events={orderTimeline(order)} />
            </div>
          </Card>

          <Card className="gap-0 overflow-hidden py-0">
            <RecordDetail
              title={customer?.name ?? 'Unknown customer'}
              subtitle={customer?.email}
              status={customer ? { label: customer.segment, tone: customer.segment === 'vip' ? 'accent' : 'default' } : undefined}
              fields={[
                { label: 'Phone', value: customer?.phone },
                { label: 'Address', value: customer?.address },
                { label: 'Orders', value: customer ? ordersByCustomer(state.orders, customer.id).length : 0, mono: true },
                ...(order.note ? [{ label: 'Note', value: order.note }] : []),
              ]}
              actions={
                customer ? (
                  <Button asChild variant="outline">
                    <a href={href(`/customers/${customer.id}`)}>View customer</a>
                  </Button>
                ) : undefined
              }
            />
          </Card>

          <Card className="gap-0 overflow-hidden py-0">
            <RecordDetail
              title="Payment"
              status={{ label: order.payment, tone: order.payment === 'pending' ? 'accent' : order.payment === 'refunded' ? 'muted' : 'default' }}
              fields={[
                { label: 'Subtotal', value: money(orderSubtotal(order)), mono: true },
                { label: 'Tax (8.75%)', value: money(orderTax(order)), mono: true },
                { label: 'Delivery', value: order.deliveryFee ? money(order.deliveryFee) : 'Free', mono: true },
                { label: 'Total', value: money(orderTotal(order)), mono: true },
              ]}
            />
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        destructive
        title={`Cancel order ${order.number}?`}
        description="The customer is refunded in full and any delivery job is removed. This cannot be undone."
        confirmLabel="Cancel order"
        cancelLabel="Keep it"
        onConfirm={() => {
          actions.cancelOrder(order.id);
          toast({ title: `${order.number} cancelled`, description: 'Refunded in full.' });
        }}
      />
    </HarborPage>
  );
}
