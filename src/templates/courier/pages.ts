import type { TemplatePage } from '../types';

/** The routes of the Courier template and the components each one uses. */
export const COURIER_PAGES: TemplatePage[] = [
  { path: '/login', label: 'Sign in', description: 'A split sign-in page with a quote beside the form. Submitting goes to dispatch.', components: ['auth-card', 'login-form'] },
  { path: '/register', label: 'Create an account', description: 'Sign-up with a company field and a password strength meter.', components: ['auth-card', 'register-form'] },
  { path: '/forgot-password', label: 'Reset password', description: 'Ask for a reset link, then see the confirmation.', components: ['auth-card', 'forgot-password-form'] },
  {
    path: '/track/:id',
    label: 'Order tracking',
    description: 'The public page a customer opens from a text. Order 48213 is on its way; 48190 is delivered and shows the proof.',
    components: ['site-header', 'site-footer', 'page-header', 'delivery-tracker-card', 'proof-of-delivery', 'order-route-mini', 'place-card', 'empty-state'],
    example: '/track/48213',
  },
  {
    path: '/checkout',
    label: 'Checkout',
    description: 'Three steps: pick an address, check we deliver there, choose door or pickup.',
    components: ['step-indicator', 'address-picker', 'service-area-checker', 'pickup-point-selector', 'empty-state'],
  },
  {
    path: '/dispatch',
    label: 'Dispatch',
    description: 'The dispatcher home: numbers for the day, a board to assign jobs to drivers, the live fleet and recent events.',
    components: ['app-shell', 'command-palette', 'notifications-popover', 'page-header', 'stat-card-grid', 'dispatch-board', 'fleet-overview', 'geofence-alert-feed', 'activity-feed'],
  },
  {
    path: '/routes',
    label: 'Routes',
    description: 'What the optimiser saved on the next run, a replay of a finished one, and the vehicle behind it.',
    components: ['route-optimizer-result', 'trip-replay', 'vehicle-detail-panel'],
  },
  {
    path: '/analytics',
    label: 'Analytics',
    description: 'Headline numbers, where orders are dense, where the network reaches, and how states compare.',
    components: ['stat-card-grid', 'heatmap-card', 'coverage-map', 'region-choropleth'],
  },
  {
    path: '/settings',
    label: 'Settings',
    description: 'A profile form, notification switches by channel, and a two-step sign-in code.',
    components: ['settings-layout', 'profile-form', 'notification-preferences', 'verify-code-form'],
  },
];
