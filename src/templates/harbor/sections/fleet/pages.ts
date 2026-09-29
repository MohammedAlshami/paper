import type { TemplatePage } from '../../../types';

/** Metadata only (no component imports) so tooling can read it in Node. */
export const FLEET_PAGES: TemplatePage[] = [
  {
    path: '/vehicles',
    label: 'Vehicles',
    description: 'The delivery vans as health cards or a table, filtered by where they are today. A card opens the vehicle.',
    components: ['page-tabs', 'filter-bar', 'vehicle-health-card', 'data-table', 'empty-state'],
  },
  {
    path: '/vehicles/:id',
    label: 'Vehicle detail',
    description: 'One van: its health and specs, the deliveries it carries today (each links to its order), tyres, fluids, history, fuel and documents.',
    components: ['vehicle-health-card', 'vehicle-spec-sheet', 'work-order-card', 'data-table', 'tire-status-grid', 'fluids-battery-panel', 'service-interval-gauge', 'vehicle-timeline', 'diagnostic-code-list', 'fuel-economy-trend', 'fuel-transaction-list', 'document-expiry-tracker', 'toast'],
    example: '/vehicles/v21',
  },
  {
    path: '/maintenance',
    label: 'Maintenance',
    description: 'The service calendar, what is coming due (scheduling one opens a work order and puts it on the calendar), the downtime forecast, plans and intervals.',
    components: ['maintenance-calendar', 'service-due-list', 'downtime-forecast', 'pm-schedule-builder', 'service-interval-gauge', 'toast'],
  },
  {
    path: '/work-orders',
    label: 'Work orders',
    description: 'The workshop board. Drag a job on, open its job card and estimate in a side sheet, or raise a new one from a defect report or an inspection.',
    components: ['work-order-board', 'work-order-card', 'record-detail-sheet', 'repair-estimate-table', 'defect-report-form', 'inspection-checklist', 'toast'],
  },
  {
    path: '/fuel-and-costs',
    label: 'Fuel and costs',
    description: 'Running costs, fuel economy and card purchases (filter them by date), utilisation by day, and when each van is worth replacing.',
    components: ['date-range-picker', 'fleet-kpi-strip', 'cost-breakdown-chart', 'vehicle-leaderboard', 'fuel-economy-trend', 'fuel-transaction-list', 'utilization-grid', 'replacement-planner'],
  },
];
