import { CUSTOMERS, DRIVERS, PRODUCTS, STORES, WAREHOUSE, type LngLat, type Location } from './entities';
import { TODAY, addDays, at, seeded } from './seed';

export type OrderStatus = 'new' | 'picking' | 'packed' | 'out-for-delivery' | 'delivered' | 'cancelled';
export const ORDER_STATUSES: { id: OrderStatus; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'picking', label: 'Picking' },
  { id: 'packed', label: 'Packed' },
  { id: 'out-for-delivery', label: 'Out for delivery' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export interface OrderItem {
  productId: string;
  qty: number;
  /** Unit price at the time of the order. */
  price: number;
}

export interface Order {
  id: string;
  /** "#1042". */
  number: string;
  customerId: string;
  /** The store or warehouse fulfilling it. */
  locationId: string;
  method: 'delivery' | 'pickup';
  items: OrderItem[];
  status: OrderStatus;
  /** ISO date-time. */
  placedAt: string;
  deliveredAt?: string;
  payment: 'paid' | 'pending' | 'refunded';
  deliveryFee: number;
  note?: string;
  driverId?: string;
  vehicleId?: string;
  /** The delivery job for this order, when it has one. */
  jobId?: string;
}

export const orderSubtotal = (order: Pick<Order, 'items'>) => order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
export const orderTax = (order: Pick<Order, 'items'>) => Math.round(orderSubtotal(order) * 0.0875 * 100) / 100;
export const orderTotal = (order: Pick<Order, 'items' | 'deliveryFee'>) => Math.round((orderSubtotal(order) + orderTax(order) + order.deliveryFee) * 100) / 100;
export const orderUnits = (order: Pick<Order, 'items'>) => order.items.reduce((sum, item) => sum + item.qty, 0);

/* ---------------- delivery jobs ---------------- */

export type JobStatus = 'unassigned' | 'assigned' | 'en-route' | 'delivered' | 'failed';

export interface DeliveryJob {
  id: string;
  orderId: string;
  status: JobStatus;
  driverId?: string;
  vehicleId?: string;
  pickup: { label: string; position: LngLat };
  dropoff: { label: string; position: LngLat };
  /** Delivery window, ISO date-times. */
  windowFrom: string;
  windowTo: string;
  distanceKm: number;
  /** 0 to 1 along the way, for jobs en route. */
  progress: number;
  etaMinutes?: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;
export function distanceKm(a: LngLat, b: LngLat) {
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
export const lerp = (a: LngLat, b: LngLat, t: number): LngLat => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Where a job's vehicle is right now: on the line between pickup and drop-off. */
export const jobPosition = (job: DeliveryJob): LngLat => lerp(job.pickup.position, job.dropoff.position, job.status === 'delivered' ? 1 : job.progress);

/* ---------------- generation ---------------- */

function nearestStore(position: LngLat): Location {
  return [...STORES].sort((a, b) => distanceKm(a.position, position) - distanceKm(b.position, position))[0];
}

/** Status for each of today's 16 orders, newest first. */
const TODAY_STATUS: OrderStatus[] = ['new', 'new', 'new', 'new', 'picking', 'picking', 'picking', 'packed', 'packed', 'out-for-delivery', 'out-for-delivery', 'out-for-delivery', 'out-for-delivery', 'out-for-delivery', 'delivered', 'delivered'];
const ON_ROAD_DRIVERS = ['d-priya', 'd-diego', 'd-jon', 'd-omar', 'd-ana'];

function buildOrders() {
  const rand = seeded(1042);
  const orders: Order[] = [];
  const jobs: DeliveryJob[] = [];
  const total = 62;
  let outIndex = 0;

  for (let i = 0; i < total; i += 1) {
    const number = 1000 + (total - i);
    const daysAgo = i < 16 ? 0 : i < 28 ? 1 : 2 + Math.floor(((i - 28) / (total - 28)) * 24);
    const day = addDays(TODAY, -daysAgo);
    const hour = daysAgo === 0 ? Math.max(6, 11 - Math.floor(i / 3)) : 8 + Math.floor(rand() * 11);
    const placedAt = at(day, hour, Math.floor(rand() * 59));
    const customer = CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)];
    const method: Order['method'] = rand() < 0.22 ? 'pickup' : 'delivery';

    const lineCount = 1 + Math.floor(rand() * 3.4);
    const picked = new Set<number>();
    const items: OrderItem[] = [];
    while (items.length < lineCount) {
      const index = Math.floor(rand() * PRODUCTS.length);
      if (picked.has(index) || PRODUCTS[index].status === 'retired') continue;
      picked.add(index);
      items.push({ productId: PRODUCTS[index].id, qty: 1 + Math.floor(rand() * (PRODUCTS[index].price < 40 ? 3 : 2)), price: PRODUCTS[index].price });
    }

    let status: OrderStatus;
    if (daysAgo === 0) status = TODAY_STATUS[i];
    else if (daysAgo === 1) status = i === 16 ? 'packed' : i === 22 ? 'cancelled' : 'delivered';
    else status = rand() < 0.09 ? 'cancelled' : 'delivered';
    if (method === 'pickup' && status === 'out-for-delivery') status = 'packed';

    const store = method === 'delivery' ? nearestStore(customer.position) : STORES[Math.floor(rand() * STORES.length)];
    const location = items.reduce((sum, item) => sum + item.qty * item.price, 0) > 220 ? WAREHOUSE : store;

    const order: Order = {
      id: `o-${number}`,
      number: `#${number}`,
      customerId: customer.id,
      locationId: location.id,
      method,
      items,
      status,
      placedAt,
      payment: status === 'cancelled' ? 'refunded' : status === 'new' && rand() < 0.2 ? 'pending' : 'paid',
      deliveryFee: method === 'delivery' ? 6 : 0,
      ...(rand() < 0.12 ? { note: ['Leave with the neighbour', 'Ring twice', 'Gift, no invoice in the box', 'Call on arrival'][Math.floor(rand() * 4)] } : {}),
    };
    if (status === 'delivered') order.deliveredAt = new Date(new Date(placedAt).getTime() + (method === 'delivery' ? 150 : 90) * 60_000).toISOString();

    // A delivery job exists once the order is packed, and stays for the last two days of history.
    if (method === 'delivery' && (status === 'packed' || status === 'out-for-delivery' || (status === 'delivered' && daysAgo <= 1))) {
      const jobId = `j-${number}`;
      let jobStatus: JobStatus = status === 'delivered' ? 'delivered' : status === 'out-for-delivery' ? 'en-route' : 'unassigned';
      let driverId: string | undefined;
      if (status === 'out-for-delivery') {
        driverId = ON_ROAD_DRIVERS[outIndex % ON_ROAD_DRIVERS.length];
        outIndex += 1;
      } else if (status === 'delivered') {
        driverId = ON_ROAD_DRIVERS[Math.floor(rand() * ON_ROAD_DRIVERS.length)];
      } else if (i === 8) {
        // One packed order already has a driver waiting at the depot.
        driverId = 'd-mia';
        jobStatus = 'assigned';
      }
      const driver = DRIVERS.find((candidate) => candidate.id === driverId);
      const dist = Math.round(distanceKm(location.position, customer.position) * 10) / 10;
      const windowStart = Math.max(hour + 2, 12);
      const job: DeliveryJob = {
        id: jobId,
        orderId: order.id,
        status: jobStatus,
        ...(driver ? { driverId: driver.id, vehicleId: driver.vehicleId } : {}),
        pickup: { label: location.name, position: location.position },
        dropoff: { label: customer.address.replace(', San Francisco', ''), position: customer.position },
        windowFrom: at(day, windowStart),
        windowTo: at(day, windowStart + 2),
        distanceKm: dist,
        progress: jobStatus === 'en-route' ? 0.25 + rand() * 0.6 : jobStatus === 'delivered' ? 1 : 0,
        ...(jobStatus === 'en-route' ? { etaMinutes: 6 + Math.floor(rand() * 34) } : {}),
      };
      order.jobId = jobId;
      if (driver) {
        order.driverId = driver.id;
        order.vehicleId = driver.vehicleId;
      }
      jobs.push(job);
    }
    orders.push(order);
  }
  // The inbox mentions a late delivery on #1051 (Van 07), so its window has already closed.
  const late = jobs.find((job) => job.orderId === 'o-1051');
  if (late) {
    late.windowFrom = at(TODAY, 9);
    late.windowTo = at(TODAY, 10, 55);
    late.etaMinutes = 25;
  }
  // The inbox mentions a declined card on #1061, so make it so.
  const declined = orders.find((candidate) => candidate.id === 'o-1061');
  if (declined) {
    declined.payment = 'pending';
    declined.note = 'Card declined. On hold until the customer pays.';
  }
  return { orders, jobs };
}

const BUILT = buildOrders();
export const INITIAL_ORDERS: Order[] = BUILT.orders;
export const INITIAL_JOBS: DeliveryJob[] = BUILT.jobs;

/* ---------------- returns ---------------- */

export type ReturnStatus = 'requested' | 'approved' | 'received' | 'refunded' | 'rejected';
export const RETURN_STATUSES: { id: ReturnStatus; label: string }[] = [
  { id: 'requested', label: 'Requested' },
  { id: 'approved', label: 'Approved' },
  { id: 'received', label: 'Received' },
  { id: 'refunded', label: 'Refunded' },
  { id: 'rejected', label: 'Rejected' },
];
export const RETURN_REASONS = ['Damaged in transit', 'Changed their mind', 'Wrong item sent', 'Faulty', 'Arrived too late', 'Not as described'] as const;

export interface ReturnRequest {
  id: string;
  orderId: string;
  productId: string;
  qty: number;
  reason: (typeof RETURN_REASONS)[number];
  status: ReturnStatus;
  requestedAt: string;
  refundAmount: number;
  note?: string;
}

export const INITIAL_RETURNS: ReturnRequest[] = (() => {
  const rand = seeded(88);
  const delivered = INITIAL_ORDERS.filter((order) => order.status === 'delivered');
  const statuses: ReturnStatus[] = ['requested', 'requested', 'requested', 'approved', 'approved', 'received', 'refunded', 'refunded', 'rejected', 'refunded'];
  return statuses.map((status, index) => {
    const order = delivered[index * 3 + 1];
    const item = order.items[Math.floor(rand() * order.items.length)];
    return {
      id: `r-${String(index + 1).padStart(2, '0')}`,
      orderId: order.id,
      productId: item.productId,
      qty: 1,
      reason: RETURN_REASONS[Math.floor(rand() * RETURN_REASONS.length)],
      status,
      requestedAt: new Date(new Date(order.deliveredAt ?? order.placedAt).getTime() + (1 + Math.floor(rand() * 60)) * 3_600_000).toISOString(),
      refundAmount: item.price,
      ...(index === 0 ? { note: 'Corner chipped when the box was opened.' } : {}),
    };
  });
})();

