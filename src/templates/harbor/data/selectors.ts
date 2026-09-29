import type { TimelineEvent } from '@/components/app/timeline';
import { PRODUCTS, getCustomer, getDriver, getLocation, getVehicle } from './entities';
import { orderTotal, type DeliveryJob, type Order } from './orders';
import { NOW, TODAY, formatTime } from './seed';
import type { PurchaseOrder } from './ops';

/** The slice of state these selectors read. Harbor's real state (state.tsx) extends it. */
export interface Ledgerish {
  orders: Order[];
  jobs: DeliveryJob[];
  stock: Record<string, Record<string, number>>;
  purchaseOrders: PurchaseOrder[];
}

export const totalStock = (stock: Ledgerish['stock'], productId: string) => Object.values(stock[productId] ?? {}).reduce((sum, qty) => sum + qty, 0);
export const warehouseStock = (stock: Ledgerish['stock'], productId: string) => stock[productId]?.warehouse ?? 0;

/** Units on order for a product across purchase orders not yet fully received. */
export const onOrder = (purchaseOrders: PurchaseOrder[], productId: string) =>
  purchaseOrders.reduce((sum, po) => (po.status === 'received' || po.status === 'draft' ? sum : sum + po.lines.filter((l) => l.productId === productId).reduce((s, l) => s + (l.qty - l.received), 0)), 0);

/** Products at or below their reorder point in the warehouse. */
export const lowStockProducts = (stock: Ledgerish['stock']) => PRODUCTS.filter((product) => product.status !== 'retired' && warehouseStock(stock, product.id) <= product.reorderPoint);

export const ordersByCustomer = (orders: Order[], customerId: string) => orders.filter((order) => order.customerId === customerId);
export const customerSpend = (orders: Order[], customerId: string) => ordersByCustomer(orders, customerId).filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + orderTotal(order), 0);
export const jobForOrder = (jobs: DeliveryJob[], orderId: string) => jobs.find((job) => job.orderId === orderId);
export const ordersForProduct = (orders: Order[], productId: string) => orders.filter((order) => order.items.some((item) => item.productId === productId));
export const unitsSold = (orders: Order[], productId: string) => orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.items.filter((item) => item.productId === productId).reduce((s, item) => s + item.qty, 0), 0);
export const ordersOnDay = (orders: Order[], day: string) => orders.filter((order) => order.placedAt.slice(0, 10) === day);
export const isLate = (job: DeliveryJob) => job.status !== 'delivered' && job.status !== 'failed' && new Date(job.windowTo).getTime() < new Date(NOW).getTime();

/** The customer-facing steps of an order as Timeline events, with times. */
export function orderTimeline(order: Order): TimelineEvent[] {
  const placed = new Date(order.placedAt).getTime();
  const stamp = (minutes: number) => formatTime(new Date(placed + minutes * 60_000).toISOString());
  const order_ = ['new', 'picking', 'packed', 'out-for-delivery', 'delivered'] as const;
  if (order.status === 'cancelled') {
    return [
      { id: 'placed', title: 'Order placed', time: stamp(0), state: 'done' },
      { id: 'cancelled', title: 'Cancelled', detail: order.payment === 'refunded' ? 'Refunded in full.' : undefined, time: stamp(24), state: 'current' },
    ];
  }
  const at_ = order_.indexOf(order.status);
  const steps: { id: string; title: string; detail?: string; minutes: number }[] = [
    { id: 'placed', title: 'Order placed', detail: `${getCustomer(order.customerId)?.name ?? ''}`, minutes: 0 },
    { id: 'picking', title: 'Picking', detail: `At ${getLocation(order.locationId)?.name}`, minutes: 8 },
    { id: 'packed', title: order.method === 'pickup' ? 'Ready to collect' : 'Packed', minutes: 35 },
    ...(order.method === 'delivery'
      ? [{ id: 'out', title: 'Out for delivery', detail: order.driverId ? `${getDriver(order.driverId)?.name} · ${getVehicle(order.vehicleId ?? '')?.name}` : 'Waiting for a driver', minutes: 70 }]
      : []),
    { id: 'delivered', title: order.method === 'pickup' ? 'Collected' : 'Delivered', minutes: order.method === 'pickup' ? 90 : 150 },
  ];
  const stepIndexOf = (id: string) => (id === 'placed' ? 0 : id === 'picking' ? 1 : id === 'packed' ? 2 : id === 'out' ? 3 : 4);
  return steps.map((step) => {
    const index = stepIndexOf(step.id);
    const state: TimelineEvent['state'] = index < at_ ? 'done' : index === at_ ? (order.status === 'delivered' ? 'done' : 'current') : 'upcoming';
    return { id: step.id, title: step.title, detail: step.detail, time: state === 'upcoming' ? undefined : stamp(step.minutes), state };
  });
}

/** Day totals for the overview: orders, revenue and units for the online orders in the app. */
export function dayStats(orders: Order[], day = TODAY) {
  const list = ordersOnDay(orders, day).filter((order) => order.status !== 'cancelled');
  return { orders: list.length, revenue: list.reduce((sum, order) => sum + orderTotal(order), 0), units: list.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.qty, 0), 0) };
}
