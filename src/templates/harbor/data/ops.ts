import type { WorkOrder } from '@/components/fleet/work-order-card';
import { VEHICLES, getProduct } from './entities';
import { TODAY, addDays, minutesAgo, seeded } from './seed';

/* ---------------- purchase orders ---------------- */

export type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'part-received' | 'received';
export const PO_STATUSES: { id: PurchaseOrderStatus; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'part-received', label: 'Part received' },
  { id: 'received', label: 'Received' },
];

export interface PurchaseOrderLine {
  productId: string;
  qty: number;
  received: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  /** "PO-2201". */
  number: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  lines: PurchaseOrderLine[];
  createdOn: string;
  expectedOn: string;
}

export const poTotal = (order: Pick<PurchaseOrder, 'lines'>) => order.lines.reduce((sum, line) => sum + line.qty * line.unitCost, 0);

const line = (productId: string, qty: number, received = 0): PurchaseOrderLine => ({ productId, qty, received, unitCost: getProduct(productId)?.cost ?? 0 });

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: 'po-2208', number: 'PO-2208', supplierId: 's-northline', status: 'draft', lines: [line('p-04', 24), line('p-07', 18)], createdOn: TODAY, expectedOn: addDays(TODAY, 5) },
  { id: 'po-2207', number: 'PO-2207', supplierId: 's-greenfield', status: 'sent', lines: [line('p-22', 15), line('p-24', 20)], createdOn: addDays(TODAY, -1), expectedOn: addDays(TODAY, 4) },
  { id: 'po-2206', number: 'PO-2206', supplierId: 's-luma', status: 'confirmed', lines: [line('p-14', 15), line('p-16', 15), line('p-19', 20)], createdOn: addDays(TODAY, -4), expectedOn: addDays(TODAY, 8) },
  { id: 'po-2205', number: 'PO-2205', supplierId: 's-cedar', status: 'part-received', lines: [line('p-09', 60, 40), line('p-13', 30, 30), line('p-35', 40, 0)], createdOn: addDays(TODAY, -9), expectedOn: addDays(TODAY, 1) },
  { id: 'po-2204', number: 'PO-2204', supplierId: 's-tidyworks', status: 'confirmed', lines: [line('p-29', 36), line('p-30', 30)], createdOn: addDays(TODAY, -6), expectedOn: addDays(TODAY, 2) },
  { id: 'po-2203', number: 'PO-2203', supplierId: 's-bayview', status: 'received', lines: [line('p-02', 30, 30), line('p-37', 24, 24)], createdOn: addDays(TODAY, -16), expectedOn: addDays(TODAY, -6) },
  { id: 'po-2202', number: 'PO-2202', supplierId: 's-northline', status: 'received', lines: [line('p-01', 40, 40), line('p-03', 40, 40)], createdOn: addDays(TODAY, -24), expectedOn: addDays(TODAY, -15) },
  { id: 'po-2201', number: 'PO-2201', supplierId: 's-luma', status: 'received', lines: [line('p-17', 60, 60), line('p-18', 60, 60)], createdOn: addDays(TODAY, -31), expectedOn: addDays(TODAY, -19) },
];
export const nextPoNumber = (existing: PurchaseOrder[]) => 2200 + existing.length + 1;

/* ---------------- fleet: work orders, service due, fuel ---------------- */

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  { id: 'wo-3109', title: 'Brakes and cooling repair', vehicle: 'Van 21', status: 'in-bay', priority: 'urgent', technician: 'Marco Bellini', bay: 'Bay 2', openedOn: addDays(TODAY, -3), tasks: [{ id: 't1', label: 'Replace water pump', done: true }, { id: 't2', label: 'Flush coolant', done: false }, { id: 't3', label: 'Rear brake pads and rotors', done: false }], parts: [{ id: 'pp1', name: 'Water pump', qty: 1, unitCost: 184 }, { id: 'pp2', name: 'Coolant 50/50, 20 L', qty: 1, unitCost: 46 }, { id: 'pp3', name: 'Rear brake pad set', qty: 1, unitCost: 54 }], laborHours: 5.5, laborRate: 95 },
  { id: 'wo-3108', title: 'Tyre rotation and balance', vehicle: 'Van 12', status: 'scheduled', priority: 'normal', technician: 'Marco Bellini', bay: 'Bay 1', openedOn: addDays(TODAY, -2), tasks: [{ id: 't1', label: 'Rotate and balance', done: false }, { id: 't2', label: 'Set pressures', done: false }], parts: [], laborHours: 1, laborRate: 95 },
  { id: 'wo-3107', title: 'Oil and filter', vehicle: 'Truck 02', status: 'scheduled', priority: 'normal', openedOn: addDays(TODAY, -1), tasks: [{ id: 't1', label: 'Drain and refill oil', done: false }, { id: 't2', label: 'Replace filter', done: false }], parts: [{ id: 'pp1', name: 'Engine oil 5W-30, 5 L', qty: 2, unitCost: 32 }, { id: 'pp2', name: 'Oil filter', qty: 1, unitCost: 6.8 }], laborHours: 1, laborRate: 95 },
  { id: 'wo-3106', title: 'Battery test and replace', vehicle: 'Van 18', status: 'waiting-parts', priority: 'high', technician: 'Lia Okonkwo', bay: 'Bay 3', openedOn: addDays(TODAY, -4), tasks: [{ id: 't1', label: 'Load test the battery', done: true }, { id: 't2', label: 'Fit new battery', done: false }], parts: [{ id: 'pp1', name: 'Battery H8 95 Ah', qty: 1, unitCost: 168 }], laborHours: 1.5, laborRate: 95 },
  { id: 'wo-3105', title: 'Rattle from the rear door', vehicle: 'Pickup 09', status: 'requested', priority: 'low', openedOn: TODAY, tasks: [{ id: 't1', label: 'Inspect and re-seat the latch', done: false }], parts: [], laborHours: 0.5, laborRate: 95 },
  { id: 'wo-3104', title: 'Annual inspection', vehicle: 'Pickup 09', status: 'requested', priority: 'normal', openedOn: addDays(TODAY, -1), tasks: [{ id: 't1', label: 'Full inspection', done: false }], parts: [], laborHours: 2, laborRate: 95 },
  { id: 'wo-3103', title: 'Wiper blades and washer', vehicle: 'Van 07', status: 'done', priority: 'low', technician: 'Lia Okonkwo', bay: 'Bay 1', openedOn: addDays(TODAY, -5), tasks: [{ id: 't1', label: 'Fit blades', done: true }, { id: 't2', label: 'Top up washer fluid', done: true }], parts: [{ id: 'pp1', name: 'Wiper blade set 24/19"', qty: 1, unitCost: 15.9 }], laborHours: 0.5, laborRate: 95 },
  { id: 'wo-3102', title: 'Transmission fluid', vehicle: 'Van 18', status: 'done', priority: 'normal', technician: 'Marco Bellini', bay: 'Bay 2', openedOn: addDays(TODAY, -8), tasks: [{ id: 't1', label: 'Drain and refill', done: true }], parts: [{ id: 'pp1', name: 'ATF, 4 L', qty: 2, unitCost: 38 }], laborHours: 1.5, laborRate: 95 },
  { id: 'wo-3101', title: 'Coolant flush', vehicle: 'Truck 05', status: 'done', priority: 'normal', technician: 'Lia Okonkwo', bay: 'Bay 1', openedOn: addDays(TODAY, -12), tasks: [{ id: 't1', label: 'Flush and refill', done: true }], parts: [{ id: 'pp1', name: 'Coolant 50/50, 20 L', qty: 1, unitCost: 46 }], laborHours: 1, laborRate: 95 },
];

export interface ServiceDue {
  id: string;
  vehicleId: string;
  service: string;
  dueKm?: number;
  dueDate?: string;
}
export const SERVICE_DUE: ServiceDue[] = [
  { id: 'sd1', vehicleId: 'v21', service: 'Brake inspection', dueKm: 230000, dueDate: addDays(TODAY, -6) },
  { id: 'sd2', vehicleId: 'v12', service: 'Tyre rotation', dueKm: 147000 },
  { id: 'sd3', vehicleId: 't02', service: 'Oil and filter', dueKm: 205000, dueDate: addDays(TODAY, 5) },
  { id: 'sd4', vehicleId: 'p09', service: 'Annual inspection', dueDate: addDays(TODAY, 9) },
  { id: 'sd5', vehicleId: 'v18', service: 'Transmission fluid', dueKm: 190000, dueDate: addDays(TODAY, 20) },
  { id: 'sd6', vehicleId: 'v07', service: 'Oil and filter', dueKm: 102000, dueDate: addDays(TODAY, 74) },
  { id: 'sd7', vehicleId: 't05', service: 'Coolant flush', dueKm: 130000, dueDate: addDays(TODAY, 58) },
];

export interface FuelTransaction {
  id: string;
  vehicleId: string;
  date: string;
  station: string;
  litres: number;
  pricePerLitre: number;
  odometerKm: number;
}
export const FUEL_TRANSACTIONS: FuelTransaction[] = (() => {
  const rand = seeded(5);
  const stations = ['Shell Bayshore', 'Chevron 3rd St', 'Arco Cesar Chavez', 'Shell Van Ness', 'Valero Geary'];
  return Array.from({ length: 24 }, (_, i) => {
    const vehicle = VEHICLES[i % VEHICLES.length];
    const litres = Math.round((45 + rand() * 40) * 10) / 10;
    return { id: `ft${i + 1}`, vehicleId: vehicle.id, date: addDays(TODAY, -Math.floor(i / 2.4)), station: stations[Math.floor(rand() * stations.length)], litres, pricePerLitre: Math.round((1.62 + rand() * 0.2) * 100) / 100, odometerKm: vehicle.odometerKm - i * 310 };
  });
})();

/* ---------------- alerts (the inbox) ---------------- */

export type AlertKind = 'late-delivery' | 'low-stock' | 'service-due' | 'po-arrived' | 'return-request' | 'geofence' | 'payment-failed' | 'document-expiry';
export interface Alert {
  id: string;
  kind: AlertKind;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  detail: string;
  at: string;
  read: boolean;
  resolved: boolean;
  /** A path inside Harbor, e.g. "/orders/o-1042". */
  href: string;
}
export const INITIAL_ALERTS: Alert[] = [
  { id: 'a1', kind: 'late-delivery', severity: 'critical', title: 'Order #1051 is running late', detail: 'Van 07 is 25 minutes behind its window.', at: minutesAgo(9), read: false, resolved: false, href: '/orders/o-1051' },
  { id: 'a2', kind: 'low-stock', severity: 'critical', title: 'Raised garden bed, cedar is out of stock', detail: 'No units left in the warehouse. 15 are on order (PO-2207).', at: minutesAgo(26), read: false, resolved: false, href: '/inventory' },
  { id: 'a3', kind: 'service-due', severity: 'warning', title: 'Van 21 brake inspection is 6 days overdue', detail: 'The van is in the shop for brakes and cooling.', at: minutesAgo(48), read: false, resolved: false, href: '/vehicles/v21' },
  { id: 'a4', kind: 'po-arrived', severity: 'info', title: 'PO-2205 has part arrived', detail: '40 of 60 bath towels and 30 of 30 shower curtains received. 40 throw blankets still due.', at: minutesAgo(95), read: false, resolved: false, href: '/purchasing' },
  { id: 'a5', kind: 'return-request', severity: 'info', title: 'New return request', detail: 'Corner chipped when the box was opened.', at: minutesAgo(140), read: true, resolved: false, href: '/returns' },
  { id: 'a6', kind: 'geofence', severity: 'warning', title: 'Truck 02 left the delivery zone', detail: 'Crossed the Sunset boundary at 10:22 with 4 orders on board.', at: minutesAgo(58), read: true, resolved: false, href: '/live-map' },
  { id: 'a7', kind: 'payment-failed', severity: 'warning', title: 'Payment failed for #1061', detail: 'The card was declined. The order is on hold.', at: minutesAgo(210), read: true, resolved: false, href: '/orders/o-1061' },
  { id: 'a8', kind: 'low-stock', severity: 'warning', title: 'Chef knife is below its reorder point', detail: '4 left in the warehouse; reorder at 8.', at: minutesAgo(260), read: true, resolved: false, href: '/inventory' },
  { id: 'a9', kind: 'document-expiry', severity: 'warning', title: 'Van 07 registration expires in 12 days', detail: 'Renew before 11 Oct.', at: minutesAgo(600), read: true, resolved: false, href: '/vehicles/v07' },
  { id: 'a10', kind: 'low-stock', severity: 'warning', title: 'Arc floor lamp is running low', detail: '3 left in the warehouse; 15 arriving on PO-2206.', at: minutesAgo(820), read: true, resolved: true, href: '/inventory' },
  { id: 'a11', kind: 'late-delivery', severity: 'warning', title: 'Order #1029 delivered 40 minutes late', detail: 'Traffic on the Bay Bridge approach.', at: minutesAgo(1500), read: true, resolved: true, href: '/orders/o-1029' },
];

/* ---------------- audit log ---------------- */

export type AuditKind = 'order' | 'stock' | 'delivery' | 'fleet' | 'team' | 'settings';
export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  subject: string;
  kind: AuditKind;
  at: string;
  href?: string;
}
export const INITIAL_AUDIT: AuditEvent[] = [
  { id: 'e1', actor: 'Sam Okafor', action: 'marked packed', subject: 'Order #1054', kind: 'order', at: minutesAgo(14), href: '/orders/o-1054' },
  { id: 'e2', actor: 'Tom Adeyemi', action: 'assigned Van 07 to', subject: 'Order #1051', kind: 'delivery', at: minutesAgo(33), href: '/orders/o-1051' },
  { id: 'e3', actor: 'Nadia Rahman', action: 'approved return', subject: 'R-04', kind: 'order', at: minutesAgo(70), href: '/returns' },
  { id: 'e4', actor: 'Sam Okafor', action: 'received 30 of 30', subject: 'PO-2205 · Cotton shower curtain', kind: 'stock', at: minutesAgo(96), href: '/purchasing' },
  { id: 'e5', actor: 'Ines Duarte', action: 'adjusted stock of', subject: 'Linen apron (Mission, −2)', kind: 'stock', at: minutesAgo(150), href: '/inventory' },
  { id: 'e6', actor: 'Tom Adeyemi', action: 'moved to In bay', subject: 'Work order WO-3109', kind: 'fleet', at: minutesAgo(190), href: '/work-orders' },
  { id: 'e7', actor: 'Nadia Rahman', action: 'changed the role of Owen Blake to', subject: 'Manager', kind: 'team', at: minutesAgo(400) },
  { id: 'e8', actor: 'Tom Adeyemi', action: 'sent', subject: 'PO-2207 to Greenfield Garden Wholesale', kind: 'stock', at: minutesAgo(1200), href: '/purchasing' },
  { id: 'e9', actor: 'Hana Sato', action: 'cancelled', subject: 'Order #1037', kind: 'order', at: minutesAgo(1300), href: '/orders/o-1037' },
  { id: 'e10', actor: 'Nadia Rahman', action: 'updated the delivery fee to', subject: '$6.00', kind: 'settings', at: minutesAgo(2900) },
  { id: 'e11', actor: 'Sam Okafor', action: 'received', subject: 'PO-2203 in full', kind: 'stock', at: minutesAgo(8700), href: '/purchasing' },
  { id: 'e12', actor: 'Jo Martin', action: 'refunded', subject: 'Order #1012', kind: 'order', at: minutesAgo(9600), href: '/orders/o-1012' },
];

/* ---------------- roster: who works this week ---------------- */

export const ROSTER_DAYS = Array.from({ length: 7 }, (_, i) => addDays('2026-09-28', i));
export const ROSTER_SHIFTS = [
  { id: 'am', label: 'Morning', short: 'AM', hours: '06:00 – 14:00' },
  { id: 'pm', label: 'Evening', short: 'PM', hours: '14:00 – 22:00', accent: true },
  { id: 'on', label: 'On call', short: 'OC', hours: 'All day' },
];
export const ROSTER_PEOPLE = [
  { id: 'd-priya', name: 'Priya Nair', role: 'Driver' },
  { id: 'd-diego', name: 'Diego Alvarez', role: 'Driver' },
  { id: 'd-jon', name: 'Jon Berg', role: 'Driver' },
  { id: 'd-omar', name: 'Omar Haddad', role: 'Driver' },
  { id: 'd-mia', name: 'Mia Chen', role: 'Driver' },
  { id: 'd-ana', name: 'Ana Costa', role: 'Driver' },
  { id: 'u-sam', name: 'Sam Okafor', role: 'Warehouse' },
  { id: 'u-jo', name: 'Jo Martin', role: 'Support' },
];
export const INITIAL_ROSTER: Record<string, string | undefined> = (() => {
  const rand = seeded(63);
  const out: Record<string, string | undefined> = {};
  ROSTER_PEOPLE.forEach((person, pi) => {
    ROSTER_DAYS.forEach((day, di) => {
      if (di >= 5 && rand() < 0.65) return;
      if (rand() < 0.08) return;
      out[`${person.id}.${day}`] = pi % 3 === 0 ? 'pm' : pi === 7 ? 'am' : rand() < 0.1 ? 'on' : 'am';
    });
  });
  return out;
})();

/* ---------------- sales ---------------- */

export interface SalesPoint {
  date: string;
  value: number;
}
/** Daily revenue for the last 400 days, all channels (in store and online), oldest first. */
export const SALES_DAILY: SalesPoint[] = (() => {
  const rand = seeded(303);
  const days = 400;
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(TODAY, -(days - 1 - i));
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
    const weekend = dow === 0 || dow === 6 ? 1.35 : dow === 5 ? 1.15 : 1;
    const trend = 1500 + i * 3.2;
    const season = 1 + 0.18 * Math.sin((i / 365) * Math.PI * 2 + 1.2);
    return { date, value: Math.round(trend * weekend * season * (0.85 + rand() * 0.3)) };
  });
})();

/** Share of revenue by location, last 30 days. */
export const SALES_BY_LOCATION = [
  { locationId: 'mission', share: 0.31 },
  { locationId: 'soma', share: 0.24 },
  { locationId: 'marina', share: 0.19 },
  { locationId: 'sunset', share: 0.14 },
  { locationId: 'warehouse', share: 0.12 },
];

