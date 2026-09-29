import type { TemplatePage } from '../../../types';

/** Metadata only (no component imports) so tooling can read it in Node. */
export const OPERATIONS_PAGES: TemplatePage[] = [
  {
    path: '/',
    label: 'Overview',
    description: 'The day at a glance: eight headline numbers, sales, the pipeline of today’s orders you can drag forward, low stock and services due.',
    components: ['app-shell', 'stat-card-grid', 'date-range-picker', 'revenue-chart', 'activity-feed', 'kanban-board', 'stock-level-bar', 'service-due-list'],
  },
  {
    path: '/inbox',
    label: 'Inbox',
    description: 'Every alert in one list: grouped by deliveries, stock, fleet and orders, resolvable one at a time or in bulk.',
    components: ['page-tabs', 'data-table', 'empty-state', 'toast'],
  },
  {
    path: '/orders',
    label: 'Orders',
    description: 'Saved views by status, filters and a date range over a sortable table, with a quick-look sheet and bulk actions.',
    components: ['filter-bar', 'date-range-picker', 'data-table', 'bulk-action-bar', 'record-detail-sheet', 'confirm-dialog', 'toast'],
  },
  {
    path: '/orders/:id',
    label: 'Order detail',
    description: 'One order from every side: items, driver, timeline, live tracking while it is out and proof of delivery once it is done.',
    components: ['data-table', 'timeline', 'record-detail-sheet', 'delivery-tracker-card', 'proof-of-delivery', 'confirm-dialog', 'empty-state'],
    example: '/orders/o-1051',
  },
  {
    path: '/pick-and-pack',
    label: 'Pick and pack',
    description: 'The warehouse floor as a board. Select an order to tick its lines off; a short line keeps it in picking.',
    components: ['stat-card-grid', 'kanban-board', 'inspection-checklist', 'empty-state', 'toast'],
  },
  {
    path: '/returns',
    label: 'Returns',
    description: 'Return requests by stage, with approve, receive, refund and reject actions behind confirmations.',
    components: ['page-tabs', 'stat-card-grid', 'data-table', 'record-detail-sheet', 'confirm-dialog', 'toast'],
  },
];
