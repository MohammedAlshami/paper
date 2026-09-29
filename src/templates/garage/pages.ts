import type { TemplatePage } from '../types';

/** The routes of the Garage template and the components each one uses. */
export const GARAGE_PAGES: TemplatePage[] = [
  {
    path: '/login',
    label: 'Sign in',
    description: 'Split sign-in page. The right-hand panel is a live vehicle health card, so the page shows what is behind it.',
    components: ['auth-card', 'login-form', 'vehicle-health-card'],
  },
  {
    path: '/register',
    label: 'Create a workspace',
    description: 'Registration with a company field and a password strength meter. Submitting goes to the dashboard.',
    components: ['auth-card', 'register-form', 'vehicle-health-card'],
  },
  { path: '/forgot-password', label: 'Reset password', description: 'Ask for a reset link, then a confirmation state.', components: ['auth-card', 'forgot-password-form'] },
  {
    path: '/',
    label: 'Dashboard',
    description: 'What needs attention today: KPIs, services due, forecast downtime, expiring documents and workshop activity. Cmd-K opens the palette.',
    components: ['app-shell', 'page-header', 'command-palette', 'notifications-popover', 'fleet-kpi-strip', 'service-due-list', 'downtime-forecast', 'activity-feed', 'document-expiry-tracker'],
  },
  {
    path: '/vehicles',
    label: 'Vehicles',
    description: 'The fleet as a sortable, filterable table or as health cards. Click one to open it.',
    components: ['data-table', 'vehicle-health-card', 'page-header'],
  },
  {
    path: '/vehicles/:id',
    example: '/vehicles/v21',
    label: 'Vehicle detail',
    description: 'One vehicle in tabs: overview, condition (tyres, fluids, intervals), history, fuel and documents.',
    components: [
      'page-header',
      'vehicle-health-card',
      'vehicle-spec-sheet',
      'tire-status-grid',
      'fluids-battery-panel',
      'service-interval-gauge',
      'vehicle-timeline',
      'diagnostic-code-list',
      'fuel-transaction-list',
      'document-expiry-tracker',
      'empty-state',
    ],
  },
  {
    path: '/work-orders',
    label: 'Work orders',
    description: 'The workshop board. Drag cards between columns, or open one for its job card in a side sheet.',
    components: ['work-order-board', 'work-order-card', 'record-detail-sheet', 'page-header'],
  },
  {
    path: '/work-orders/new',
    label: 'Report a defect',
    description: 'A driver files a defect or does a pre-trip inspection; either opens a work order on the board.',
    components: ['defect-report-form', 'inspection-checklist', 'page-header'],
  },
  {
    path: '/schedule',
    label: 'Schedule',
    description: 'The booking calendar with the downtime forecast, the preventive maintenance plans, and interval gauges per vehicle.',
    components: ['maintenance-calendar', 'downtime-forecast', 'pm-schedule-builder', 'service-interval-gauge', 'page-header'],
  },
  {
    path: '/inventory',
    label: 'Inventory',
    description: 'Parts on the shelf with search and filters, stock levels, reorder suggestions that raise purchase orders, and a part detail sheet.',
    components: ['parts-inventory-table', 'stock-level-bar', 'reorder-suggestions', 'purchase-order-card', 'part-detail-panel', 'parts-usage-chart', 'page-header'],
  },
  {
    path: '/reports',
    label: 'Reports',
    description: 'Costs by vehicle, a utilisation grid, fuel economy and card transactions, and a replacement planner.',
    components: ['fleet-kpi-strip', 'cost-breakdown-chart', 'vehicle-leaderboard', 'utilization-grid', 'fuel-economy-trend', 'fuel-transaction-list', 'replacement-planner'],
  },
  { path: '/settings', label: 'Settings', description: 'Profile and notification preferences in a settings layout.', components: ['settings-layout', 'profile-form', 'notification-preferences'] },
];
