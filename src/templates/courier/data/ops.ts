import { BarChart3, CheckCheck, Clock, LayoutDashboard, LogOut, Map, PackageCheck, Search, Settings, Timer, Truck, TriangleAlert, User } from 'lucide-react';
import type { CommandGroup } from '@/components/app/command-palette';
import type { NavGroup, ShellUser, UserMenuItem } from '@/components/app/app-shell';
import type { AppNotification } from '@/components/app/notifications-popover';
import type { NotificationChannel, NotificationGroup } from '@/components/app/notification-preferences';
import type { ActivityItem } from '@/components/app/activity-feed';
import type { ProfileValues } from '@/components/app/profile-form';
import type { Stat } from '@/components/app/stat-card-grid';
import type { FleetVehicle } from '@/components/maps/fleet-overview';
import { bearing, type LngLat } from '@/components/maps/map-kit';
import { FLEET_ROUTES } from './fleet-routes';
import { US_STATE_NAMES } from './us-states';
import type { RegionDatum } from '@/components/maps/region-choropleth';
import { TRIP_ROUTE } from './trip';

/* ---------- the shell ---------- */

export const NAV: NavGroup[] = [
  {
    items: [
      { id: 'dispatch', label: 'Dispatch', icon: LayoutDashboard, href: '/dispatch', badge: 7 },
      { id: 'routes', label: 'Routes', icon: Map, href: '/routes' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
    ],
  },
  {
    heading: 'Account',
    items: [{ id: 'settings', label: 'Settings', icon: Settings, href: '/settings' }],
  },
];

export const USER: ShellUser = { name: 'Priya Nair', email: 'priya@courier.example' };

export const USER_MENU: UserMenuItem[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'signout', label: 'Sign out', icon: LogOut, destructive: true },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'Van 21 is delayed', body: 'Road closed on Market St. New ETA 3:05 pm.', time: '4 min ago', icon: TriangleAlert },
  { id: 'n2', title: 'Order #48190 delivered', body: 'Signed for by Jordan Ellis.', time: '32 min ago', icon: PackageCheck, read: true },
  { id: 'n3', title: 'Bike 09 went offline', body: 'No signal for 42 minutes.', time: '1 h ago', icon: Clock },
];

export const COMMANDS: CommandGroup[] = [
  {
    heading: 'Go to',
    commands: [
      { id: '/dispatch', label: 'Dispatch', icon: LayoutDashboard, shortcut: 'G D' },
      { id: '/routes', label: 'Routes', icon: Map, shortcut: 'G R' },
      { id: '/analytics', label: 'Analytics', icon: BarChart3, shortcut: 'G A' },
      { id: '/settings', label: 'Settings', icon: Settings, keywords: ['profile', 'notifications'] },
    ],
  },
  {
    heading: 'Public pages',
    commands: [
      { id: '/track/48213', label: 'Tracking page, order in transit', icon: Search, keywords: ['customer'] },
      { id: '/track/48190', label: 'Tracking page, order delivered', icon: CheckCheck },
      { id: '/checkout', label: 'Checkout address step', icon: Truck },
    ],
  },
];

/* ---------- dispatch ---------- */

export const STATS: Stat[] = [
  { id: 'active', label: 'Active deliveries', value: '23', icon: Truck, delta: 8.2, goodWhen: 'up', trend: [12, 15, 14, 18, 17, 21, 20, 23] },
  { id: 'ontime', label: 'On time', value: '94.1%', icon: CheckCheck, delta: -1.3, goodWhen: 'up', trend: [96, 95, 96, 95, 95, 94, 95, 94] },
  { id: 'avg', label: 'Average delivery', value: '31 min', icon: Timer, delta: -4.5, goodWhen: 'down', trend: [36, 35, 34, 34, 33, 32, 32, 31] },
  { id: 'late', label: 'Late orders', value: '2', icon: TriangleAlert, delta: 100, goodWhen: 'down', trend: [0, 1, 0, 1, 1, 0, 1, 2] },
];

const at = (time: string) => `2026-09-29T${time}:00Z`;
export const ACTIVITY: ActivityItem[] = [
  { id: 'a1', actor: { name: 'Marcus Lee' }, action: 'delivered', subject: 'Order #48213', at: at('14:41') },
  { id: 'a2', actor: { name: 'Priya Nair' }, action: 'assigned', subject: 'Order #48216 to Van 12', at: at('14:22') },
  { id: 'a3', actor: { name: 'Diego Alvarez' }, action: 'reported', subject: 'a blocked driveway', detail: 'Left the parcel with the neighbour at number 14.', at: at('13:58') },
  { id: 'a4', actor: { name: 'Sam Okafor' }, action: 'picked up', subject: 'Order #48214', at: at('13:31') },
  { id: 'a5', actor: { name: 'Lena Fischer' }, action: 'is delayed on', subject: 'Order #48209', detail: 'Road closed ahead, rerouting.', at: at('12:47') },
];

interface FleetSeed {
  id: string;
  name: string;
  driver: string;
  task: string;
  status: FleetVehicle['status'];
  route?: number;
  offset?: number;
  speedKph?: number;
  position?: LngLat;
}

const FLEET_SEED: FleetSeed[] = [
  { id: 'v12', name: 'Van 12', driver: 'Priya Nair', task: '6 stops left', status: 'moving', route: 0, offset: 10, speedKph: 34 },
  { id: 'v07', name: 'Van 07', driver: 'Diego Alvarez', task: '3 stops left', status: 'moving', route: 1, offset: 25, speedKph: 41 },
  { id: 'b03', name: 'Bike 03', driver: 'Sam Okafor', task: 'Delivering', status: 'moving', route: 2, offset: 5, speedKph: 19 },
  { id: 'v21', name: 'Van 21', driver: 'Lena Fischer', task: 'Road closed ahead', status: 'delayed', route: 3, offset: 30, speedKph: 6 },
  { id: 't02', name: 'Truck 02', driver: 'Omar Haddad', task: 'Returning to depot', status: 'moving', route: 4, offset: 15, speedKph: 37 },
  { id: 'v03', name: 'Van 03', driver: 'Mia Chen', task: 'At the depot', status: 'idle', position: [-122.3998, 37.7605], speedKph: 0 },
  { id: 'v18', name: 'Van 18', driver: 'Jon Berg', task: 'On break', status: 'idle', position: [-122.446, 37.771], speedKph: 0 },
  { id: 'b09', name: 'Bike 09', driver: 'Unassigned', task: 'No signal for 42 min', status: 'offline', position: [-122.418, 37.79] },
];

/** Where every vehicle is after `tick` steps. Moving vehicles walk their real route; the delayed one stays put. */
export function fleetAt(tick: number): FleetVehicle[] {
  return FLEET_SEED.map((seed) => {
    if (seed.route === undefined) {
      return { id: seed.id, name: seed.name, driver: seed.driver, task: seed.task, status: seed.status, position: seed.position!, speedKph: seed.speedKph };
    }
    const path = FLEET_ROUTES[seed.route];
    const index = ((seed.offset ?? 0) + tick * (seed.status === 'delayed' ? 0 : 1)) % (path.length - 1);
    return { id: seed.id, name: seed.name, driver: seed.driver, task: seed.task, status: seed.status, position: path[index], heading: bearing(path[index], path[index + 1]), speedKph: seed.speedKph };
  });
}

/* ---------- routes ---------- */

export const OPTIMIZER_STOPS = [
  { label: 'Depot', position: [-122.3998, 37.7605] as LngLat, beforeIndex: 0, afterIndex: 0 },
  { label: 'Haight St', position: [-122.4477, 37.7691] as LngLat, beforeIndex: 1, afterIndex: 2 },
  { label: 'North Beach', position: [-122.4102, 37.8005] as LngLat, beforeIndex: 2, afterIndex: 4 },
  { label: 'Cole Valley', position: [-122.446, 37.771] as LngLat, beforeIndex: 3, afterIndex: 3 },
  { label: 'Mission', position: [-122.4195, 37.7599] as LngLat, beforeIndex: 4, afterIndex: 1 },
  { label: 'Marina', position: [-122.437, 37.8036] as LngLat, beforeIndex: 5, afterIndex: 5 },
];

export const VEHICLE = {
  name: 'Van 12',
  plate: '8KTR204',
  status: 'moving' as const,
  driver: { name: 'Priya Nair', phone: '+1 415 555 0118' },
  speedKph: 34,
  fuelPercent: 62,
  odometerKm: 48210,
  position: FLEET_ROUTES[0][30],
};
export const VEHICLE_TRAIL = FLEET_ROUTES[0].slice(0, 31);
export const VEHICLE_STOPS = [
  { time: '8:05 am', label: 'Depot, loaded', dwell: '22 min' },
  { time: '9:40 am', label: '412 Hayes St', dwell: '4 min' },
  { time: '10:52 am', label: '1200 Valencia St', dwell: '6 min' },
];

export const REPLAY = {
  route: TRIP_ROUTE,
  movingMin: 46,
  startMinutes: 8 * 60 + 12,
  stops: [
    { at: 0.36, label: 'Drop at Presidio Gate', dwellMin: 6 },
    { at: 0.7, label: 'Drop at the Marina', dwellMin: 4 },
  ],
};

/* ---------- analytics ---------- */

/** Deterministic sample values, so the page looks the same every time. Not real data. */
export const STATE_DATA: RegionDatum[] = US_STATE_NAMES.map((name) => {
  let hash = 0;
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) % 997;
  return { id: name, value: 38 + (hash % 131) };
});

export const ANALYTICS_STATS: Stat[] = [
  { id: 'orders', label: 'Orders this week', value: '1,842', icon: PackageCheck, delta: 12.4, goodWhen: 'up', trend: [210, 230, 224, 260, 251, 292, 375] },
  { id: 'ontime', label: 'On time', value: '94.1%', icon: CheckCheck, delta: -1.3, goodWhen: 'up', trend: [96, 95, 96, 95, 95, 94, 94] },
  { id: 'avg', label: 'Average delivery', value: '31 min', icon: Timer, delta: -4.5, goodWhen: 'down', trend: [36, 35, 34, 34, 33, 32, 31] },
  { id: 'fleet', label: 'Vehicles on the road', value: '8', icon: Truck, delta: 0, goodWhen: 'up', trend: [8, 8, 7, 8, 8, 8, 8] },
];

/* ---------- settings ---------- */

export const PROFILE: ProfileValues = {
  name: 'Priya Nair',
  email: 'priya@courier.example',
  role: 'Dispatcher',
  bio: 'Runs the evening dispatch shift. Prefers the map open before the list.',
};
export const ROLES = ['Dispatcher', 'Driver', 'Operations lead', 'Viewer'];

export const CHANNELS: NotificationChannel[] = [
  { id: 'email', label: 'Email' },
  { id: 'push', label: 'Push' },
  { id: 'sms', label: 'SMS' },
];

export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    id: 'deliveries',
    title: 'Deliveries',
    items: [
      { id: 'late', label: 'An order is running late', description: 'When the ETA slips by more than ten minutes.' },
      { id: 'delivered', label: 'An order is delivered' },
    ],
  },
  {
    id: 'fleet',
    title: 'Fleet',
    items: [
      { id: 'geofence', label: 'A vehicle crosses a zone boundary' },
      { id: 'offline', label: 'A vehicle goes offline', description: 'No signal for more than 15 minutes.' },
    ],
  },
];

export const NOTIFICATION_DEFAULTS: Record<string, boolean> = {
  'late.email': true,
  'late.push': true,
  'late.sms': true,
  'delivered.push': true,
  'geofence.push': true,
  'offline.email': true,
  'offline.push': true,
};
