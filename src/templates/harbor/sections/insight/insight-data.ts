import type { ApiKey } from '@/components/app/api-key-list';
import type { DangerAction } from '@/components/app/danger-zone-card';
import type { NotificationChannel, NotificationGroup } from '@/components/app/notification-preferences';

/** Static data for the reports, settings and integrations pages. Everything else comes from ../../data and the state. */

export interface ReportType {
  id: string;
  title: string;
  description: string;
}

export const REPORT_TYPES: ReportType[] = [
  { id: 'sales', title: 'Sales summary', description: 'Revenue, orders and average basket by store and day.' },
  { id: 'inventory', title: 'Stock valuation', description: 'Units and value on hand by product and location.' },
  { id: 'delivery', title: 'Delivery performance', description: 'On-time rate, late orders and time per drop, by driver.' },
  { id: 'returns', title: 'Returns and refunds', description: 'What came back, why, and what it cost.' },
  { id: 'fleet', title: 'Fleet running costs', description: 'Fuel, maintenance and downtime per vehicle.' },
];

export const REPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'pdf', label: 'PDF' },
];

export interface GeneratedReport {
  id: string;
  typeId: string;
  range: string;
  format: string;
  locations: string;
  requestedBy: string;
  createdAt: string;
  size: string;
  status: 'generating' | 'ready';
}

export const SEED_REPORTS: GeneratedReport[] = [
  { id: 'rp-1', typeId: 'sales', range: '1 – 28 Sep', format: 'PDF', locations: 'All locations', requestedBy: 'Nadia Rahman', createdAt: '2026-09-29T08:10:00Z', size: '212 KB', status: 'ready' },
  { id: 'rp-2', typeId: 'inventory', range: 'As of 28 Sep', format: 'Excel', locations: 'Warehouse', requestedBy: 'Sam Okafor', createdAt: '2026-09-28T16:45:00Z', size: '86 KB', status: 'ready' },
  { id: 'rp-3', typeId: 'delivery', range: '22 – 28 Sep', format: 'CSV', locations: 'All locations', requestedBy: 'Tom Adeyemi', createdAt: '2026-09-28T09:02:00Z', size: '41 KB', status: 'ready' },
  { id: 'rp-4', typeId: 'returns', range: 'August', format: 'PDF', locations: 'All locations', requestedBy: 'Jo Martin', createdAt: '2026-09-02T10:30:00Z', size: '158 KB', status: 'ready' },
  { id: 'rp-5', typeId: 'fleet', range: 'Q3 to date', format: 'Excel', locations: 'Warehouse', requestedBy: 'Nadia Rahman', createdAt: '2026-09-01T07:55:00Z', size: '124 KB', status: 'ready' },
];

/* ---------------- settings ---------------- */

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  { id: 'email', label: 'Email' },
  { id: 'push', label: 'Push' },
  { id: 'slack', label: 'Slack' },
];

export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    id: 'orders',
    title: 'Orders and delivery',
    items: [
      { id: 'late', label: 'A delivery is running late', description: 'When a van falls behind its window.' },
      { id: 'payment', label: 'A payment fails', description: 'The order is held until it is fixed.' },
      { id: 'returns', label: 'A return is requested' },
    ],
  },
  {
    id: 'stock',
    title: 'Stock and purchasing',
    items: [
      { id: 'low', label: 'A product reaches its reorder point' },
      { id: 'po', label: 'A purchase order arrives', description: 'Fully or in part.' },
    ],
  },
  {
    id: 'fleet',
    title: 'Fleet',
    items: [
      { id: 'service', label: 'A service is overdue' },
      { id: 'docs', label: 'A vehicle document is about to expire' },
    ],
  },
];

export const NOTIFICATION_DEFAULTS: Record<string, boolean> = {
  'late.email': true, 'late.push': true, 'late.slack': true,
  'payment.email': true, 'payment.push': true,
  'returns.email': true,
  'low.email': true, 'low.slack': true,
  'po.email': true,
  'service.email': true, 'service.push': true,
  'docs.email': true,
};

export interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
}

export const INTEGRATIONS: Integration[] = [
  { id: 'stripe', name: 'Stripe', description: 'Card payments and refunds for online orders.', connected: true },
  { id: 'slack', name: 'Slack', description: 'Late deliveries and low stock, posted to #operations.', connected: true },
  { id: 'quickbooks', name: 'QuickBooks', description: 'Sends invoices and purchase orders to your books.', connected: false },
  { id: 'pos', name: 'Store point of sale', description: 'Keeps in-store sales and stock in step with the warehouse.', connected: true },
  { id: 'analytics', name: 'Google Analytics', description: 'Tracks the checkout funnel on the storefront.', connected: false },
];

export const SEED_API_KEYS: ApiKey[] = [
  { id: 'k1', name: 'Storefront checkout', prefix: 'hb_live_3f9c', createdAt: '2026-03-14', lastUsedAt: '2026-09-29', scope: 'Orders: read and write' },
  { id: 'k2', name: 'Stock sync (POS)', prefix: 'hb_live_a71e', createdAt: '2026-05-02', lastUsedAt: '2026-09-29', scope: 'Stock: read and write' },
  { id: 'k3', name: 'Reporting export', prefix: 'hb_live_0d42', createdAt: '2026-08-19', lastUsedAt: '2026-09-21', scope: 'Read only' },
];

export const DANGER_ACTIONS: DangerAction[] = [
  { id: 'reset', title: 'Reset demo data', description: 'Puts orders, stock and every other change back to how the demo started.', actionLabel: 'Reset data', confirmPhrase: 'reset' },
  { id: 'delete', title: 'Delete this workspace', description: 'Removes every store, product, order and person. This cannot be undone.', actionLabel: 'Delete workspace', confirmPhrase: 'harbor' },
];

export const CUTOFF_OPTIONS = [
  { value: '14:00', label: '2:00 pm' },
  { value: '16:00', label: '4:00 pm' },
  { value: '18:00', label: '6:00 pm' },
];
