import type { TemplatePage } from '../../../types';

/** Metadata only (no component imports) so tooling can read it in Node. */
export const INSIGHT_PAGES: TemplatePage[] = [
  {
    path: '/sales',
    label: 'Sales',
    description: 'Revenue for every channel over any date range, top products and where orders come from.',
    components: ['stat-card-grid', 'date-range-picker', 'revenue-chart', 'share-bar-list', 'data-table', 'heatmap-card'],
  },
  {
    path: '/stores',
    label: 'Stores',
    description: 'How each location is doing on a leaderboard, all of them on a map, and as a directory with hours and contacts.',
    components: ['page-tabs', 'stat-card-grid', 'metric-leaderboard', 'store-locator', 'branch-directory'],
  },
  {
    path: '/customers',
    label: 'Customers',
    description: 'The segment views over a table of buyers, a side sheet with their orders, and bulk export or tagging.',
    components: ['filter-bar', 'data-table', 'record-detail-sheet', 'timeline', 'bulk-action-bar', 'toast'],
  },
  {
    path: '/customers/:id',
    label: 'Customer detail',
    description: 'One customer: spend, orders and notes you can edit in place, with the deliveries that went to their address.',
    components: ['stat-card-grid', 'inline-edit', 'activity-feed', 'record-detail-sheet', 'place-card', 'location-badge', 'empty-state', 'toast'],
    example: '/customers/c-01',
  },
  {
    path: '/reports',
    label: 'Reports',
    description: 'Build a report from a type, a date range, locations and a format; the history has its download and delete.',
    components: ['date-range-picker', 'multi-select', 'data-table', 'confirm-dialog', 'toast'],
  },
  {
    path: '/team',
    label: 'Team',
    description: 'Who can sign in and what they can do, with an invite dialog and a remove confirmation, plus who works which shift this week.',
    components: ['page-tabs', 'team-members', 'roster-grid', 'confirm-dialog', 'toast'],
  },
  {
    path: '/settings',
    label: 'Settings',
    description: 'Your profile, notification preferences, the delivery defaults, integrations, API keys and a danger zone.',
    components: ['settings-layout', 'profile-form', 'notification-preferences', 'integration-list', 'api-key-list', 'danger-zone-card', 'toast'],
  },
  {
    path: '/audit-log',
    label: 'Audit log',
    description: 'Every recorded change with filters by type and person. Rows lead back to the page they changed.',
    components: ['filter-bar', 'data-table', 'empty-state', 'toast'],
  },
];
