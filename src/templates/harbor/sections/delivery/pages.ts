import type { TemplatePage } from '../../../types';

/** Metadata only (no component imports) so tooling can read it in Node. */
export const DELIVERY_PAGES: TemplatePage[] = [
  {
    path: '/live-map',
    label: 'Live map',
    description: 'Every van and every open delivery on one map. Pick a vehicle for its speed, fuel and trail, and work down the list of jobs still to do.',
    components: ['stat-card-grid', 'fleet-overview', 'vehicle-detail-panel', 'data-table', 'geofence-alert-feed', 'empty-state'],
  },
  {
    path: '/dispatch',
    label: 'Dispatch',
    description: 'Drag a job onto a driver, or auto-assign to the nearest free one. The order, the job and the van update on every other page. The week roster and the recent activity sit underneath.',
    components: ['stat-card-grid', 'dispatch-board', 'roster-grid', 'activity-feed'],
  },
  {
    path: '/routes',
    label: 'Routes',
    description: 'A driver\'s run as booked against the run after optimising, the stops in the new order with their times, and a replay of a finished run.',
    components: ['stat-card-grid', 'route-optimizer-result', 'timeline', 'trip-replay'],
  },
  {
    path: '/drivers',
    label: 'Drivers',
    description: 'A filterable table of drivers with a detail sheet for each, a leaderboard, van utilisation over 28 days and the week\'s roster.',
    components: ['stat-card-grid', 'filter-bar', 'data-table', 'record-detail-sheet', 'timeline', 'vehicle-leaderboard', 'utilization-grid', 'roster-grid'],
  },
  {
    path: '/zones',
    label: 'Zones and pickup',
    description: 'Check whether an address is inside a delivery zone, see how well each part of the city is served, choose pickup points, and read the delivery density by hour.',
    components: ['service-area-checker', 'coverage-map', 'pickup-point-selector', 'heatmap-card'],
  },
];
