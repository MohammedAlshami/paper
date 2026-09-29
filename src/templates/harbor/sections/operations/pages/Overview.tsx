import * as React from 'react';
import { Boxes, Clock, PackageCheck, Timer, TriangleAlert, Truck, Undo2, Wallet } from 'lucide-react';
import { ActivityFeed, type ActivityItem } from '@/components/app/activity-feed';
import { DateRangePicker, type DateRange } from '@/components/app/date-range-picker';
import { KanbanBoard } from '@/components/app/kanban-board';
import { RevenueChart } from '@/components/app/revenue-chart';
import { StatCardGrid, type Stat } from '@/components/app/stat-card-grid';
import { useToast } from '@/components/app/toast';
import { ServiceDueList } from '@/components/fleet/service-due-list';
import { StockLevelBar } from '@/components/fleet/stock-level-bar';
import { NOW, ORDER_STATUSES, SALES_DAILY, SERVICE_DUE, TODAY, VEHICLES, addDays, daysBetween, formatMoney, getVehicle, isLate, lowStockProducts, onOrder, orderTotal, ordersOnDay, relativeTime, warehouseStock, type Order } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { customerName, money } from '../parts';

const PIPELINE = ORDER_STATUSES.filter((status) => status.id !== 'cancelled').map((status) => ({ id: status.id, title: status.label }));

/** Orders placed between two ISO dates (inclusive), leaving out cancelled ones. */
const inRange = (orders: Order[], from: string, to: string) =>
  orders.filter((order) => order.status !== 'cancelled' && order.placedAt.slice(0, 10) >= from && order.placedAt.slice(0, 10) <= to);

const percentChange = (now: number, before: number) => (before > 0 ? ((now - before) / before) * 100 : undefined);

/** The day at a glance: the numbers, the money, the pipeline of today's orders, and what needs attention. */
export function Overview() {
  const { state, actions, counts } = useHarbor();
  const { navigate } = useHarborRouter();
  const { toast } = useToast();
  const [range, setRange] = React.useState<DateRange>({ from: TODAY, to: TODAY });

  const from = range.from ?? TODAY;
  const to = range.to ?? from;
  const days = daysBetween(from, to) + 1;

  const stats = React.useMemo<Stat[]>(() => {
    const current = inRange(state.orders, from, to);
    const before = inRange(state.orders, addDays(from, -days), addDays(from, -1));
    const revenue = current.reduce((sum, order) => sum + orderTotal(order), 0);
    const revenueBefore = before.reduce((sum, order) => sum + orderTotal(order), 0);
    const week = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6));
    const enRoute = state.jobs.filter((job) => job.status === 'en-route').length;
    const late = state.jobs.filter(isLate).length;
    const available = VEHICLES.filter((vehicle) => vehicle.status !== 'in-shop').length;
    const backlog = state.orders.filter((order) => order.status === 'new' || order.status === 'picking').length;
    return [
      { id: 'orders', label: days > 1 ? `Online orders, ${days} days` : 'Online orders today', value: String(current.length), icon: PackageCheck, delta: percentChange(current.length, before.length), goodWhen: 'up', trend: week.map((day) => ordersOnDay(state.orders, day).length) },
      { id: 'revenue', label: 'Online revenue', value: formatMoney(revenue), icon: Wallet, delta: percentChange(revenue, revenueBefore), goodWhen: 'up', trend: week.map((day) => inRange(state.orders, day, day).reduce((sum, order) => sum + orderTotal(order), 0)) },
      { id: 'out', label: 'Out for delivery', value: String(enRoute), icon: Truck },
      { id: 'late', label: 'Running late', value: String(late), icon: Clock },
      { id: 'backlog', label: 'To pick and pack', value: String(backlog), icon: Timer },
      { id: 'low', label: 'Low stock lines', value: String(counts.lowStock), icon: Boxes },
      { id: 'vans', label: 'Vans available', value: `${available} of ${VEHICLES.length}`, icon: TriangleAlert },
      { id: 'returns', label: 'Returns waiting', value: String(counts.pendingReturns), icon: Undo2 },
    ];
  }, [state.orders, state.jobs, from, to, days, counts.lowStock, counts.pendingReturns]);

  const today = React.useMemo(() => state.orders.filter((order) => order.status !== 'cancelled' && order.placedAt.slice(0, 10) === TODAY), [state.orders]);

  const feed = React.useMemo<ActivityItem[]>(() => state.audit.map((event) => ({ id: event.id, actor: { name: event.actor }, action: event.action, subject: event.subject, at: event.at })), [state.audit]);

  const lowStock = React.useMemo(
    () =>
      lowStockProducts(state.stock)
        .slice(0, 6)
        .map((product) => ({ id: product.id, name: product.name, onHand: warehouseStock(state.stock, product.id), min: product.reorderPoint, max: product.reorderPoint + product.reorderQty, onOrder: onOrder(state.purchaseOrders, product.id) || undefined })),
    [state.stock, state.purchaseOrders],
  );

  const due = React.useMemo(
    () =>
      SERVICE_DUE.slice(0, 5).map((service) => {
        const vehicle = getVehicle(service.vehicleId);
        return { id: service.id, vehicle: vehicle?.name ?? service.vehicleId, service: service.service, dueKm: service.dueKm, currentKm: vehicle?.odometerKm, dueDate: service.dueDate };
      }),
    [],
  );

  const move = (order: Order, status: string) => {
    if (status === 'out-for-delivery' && (order.method === 'pickup' || !order.driverId)) {
      toast({ variant: 'error', title: order.method === 'pickup' ? 'Pickup orders do not go out in a van' : 'Assign a driver first', description: `${order.number} stays where it is.` });
      return;
    }
    actions.setOrderStatus(order.id, status as Order['status']);
    toast({ variant: 'success', title: `${order.number} moved to ${PIPELINE.find((column) => column.id === status)?.title.toLowerCase()}` });
  };

  return (
    <HarborPage
      title="Overview"
      description={
        <>
          Tuesday 29 September, {new Date(NOW).toISOString().slice(11, 16)}. The order figures count online orders only; the sales chart includes the stores.
        </>
      }
      actions={<DateRangePicker value={range} onChange={setRange} today={TODAY} max={TODAY} placeholder="Today" />}
    >
      <StatCardGrid stats={stats} period={days > 1 ? 'vs the period before' : 'vs yesterday'} onSelect={(stat) => navigate(stat.id === 'low' ? '/inventory' : stat.id === 'vans' ? '/vehicles' : stat.id === 'returns' ? '/returns' : stat.id === 'backlog' ? '/pick-and-pack' : stat.id === 'out' || stat.id === 'late' ? '/live-map' : '/orders')} />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <RevenueChart data={SALES_DAILY} title="Sales, all channels" />
        <ActivityFeed items={feed} today={NOW} title="Activity" pageSize={5} onItemClick={(item) => { const event = state.audit.find((candidate) => candidate.id === item.id); if (event?.href) navigate(event.href); }} />
      </div>

      <section className="flex min-w-0 flex-col gap-3">
        <div>
          <h2 className="text-sm font-bold">Today&apos;s order pipeline</h2>
          <p className="text-sm text-muted-foreground">{today.length} online orders placed today. Drag a card, or use its menu, to move it on.</p>
        </div>
        <KanbanBoard
          columns={PIPELINE}
          items={today}
          getId={(order) => order.id}
          getColumn={(order) => order.status}
          onMove={(order, column) => move(order, column)}
          onCardClick={(order) => navigate(`/orders/${order.id}`)}
          columnWidth="w-64"
          renderCard={(order) => (
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono font-semibold">{order.number}</span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{money(orderTotal(order))}</span>
              </div>
              <span className="truncate">{customerName(order)}</span>
              <span className="text-xs text-muted-foreground">
                {order.items.length} {order.items.length === 1 ? 'line' : 'lines'} · {order.method} · {relativeTime(order.placedAt)}
              </span>
            </div>
          )}
        />
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-3">
          <h2 className="text-sm font-bold">Running low in the warehouse</h2>
          <StockLevelBar items={lowStock} onSelect={() => navigate('/inventory')} />
        </section>
        <section className="flex min-w-0 flex-col gap-3">
          <h2 className="text-sm font-bold">Vehicle services due</h2>
          <ServiceDueList items={due} today={TODAY} onSchedule={() => navigate('/maintenance')} />
        </section>
      </div>
    </HarborPage>
  );
}
