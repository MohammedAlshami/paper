/**
 * Everything Garage shows, in one place. One invented fleet: eight vehicles, one workshop, "today" is 29 Sep 2026.
 * Replace these with calls to your own API.
 */
import { AlertTriangle, Bell, CalendarDays, FileText, LayoutDashboard, LogOut, Package, Settings, Truck, User, Wrench, BarChart3 } from 'lucide-react';
import type { ActivityItem } from '@/components/app/activity-feed';
import type { NavGroup, UserMenuItem } from '@/components/app/app-shell';
import type { CommandGroup } from '@/components/app/command-palette';
import type { AppNotification } from '@/components/app/notifications-popover';
import type { NotificationChannel, NotificationGroup } from '@/components/app/notification-preferences';
import type { ProfileValues } from '@/components/app/profile-form';
import type { DiagnosticCode } from '@/components/fleet/diagnostic-code-list';
import type { FluidLevel } from '@/components/fleet/fluids-battery-panel';
import type { HealthIssue } from '@/components/fleet/vehicle-health-card';
import type { ServiceInterval } from '@/components/fleet/service-interval-gauge';
import type { SpecGroup } from '@/components/fleet/vehicle-spec-sheet';
import type { Tire } from '@/components/fleet/tire-status-grid';
import type { TimelineEvent } from '@/components/fleet/vehicle-timeline';
import type { WorkOrder } from '@/components/fleet/work-order-card';
import { dayFromToday, TODAY, VEHICLES, type DemoVehicle } from './fleet';
import { CODES, DOCUMENTS, FLUIDS, BATTERY, TRUCK_05_TIRES, VAN_12_INTERVALS, VAN_12_TIMELINE, VAN_12_TIRES, WORK_ORDER } from './fleet-data';

export * from './fleet-data';
export { TODAY, VEHICLES, dayFromToday };
export type { DemoVehicle };

/* ---------- shell ---------- */

export const NAV: NavGroup[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'vehicles', label: 'Vehicles', icon: Truck, badge: VEHICLES.length },
      { id: 'work-orders', label: 'Work orders', icon: Wrench, badge: 9 },
      { id: 'schedule', label: 'Schedule', icon: CalendarDays },
      { id: 'inventory', label: 'Inventory', icon: Package, badge: 3 },
    ],
  },
  {
    heading: 'Insight',
    items: [
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

/** Where each nav id goes, inside the template. */
export const NAV_PATHS: Record<string, string> = {
  dashboard: '/',
  vehicles: '/vehicles',
  'work-orders': '/work-orders',
  schedule: '/schedule',
  inventory: '/inventory',
  reports: '/reports',
  settings: '/settings',
};

export const USER = { name: 'Priya Nair', email: 'priya@northwind.example' };

export const USER_MENU: UserMenuItem[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'signout', label: 'Sign out', icon: LogOut, destructive: true },
];

export const COMMANDS: CommandGroup[] = [
  {
    heading: 'Go to',
    commands: [
      { id: 'go:dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'G D' },
      { id: 'go:vehicles', label: 'Vehicles', icon: Truck, shortcut: 'G V', keywords: ['fleet', 'vans', 'trucks'] },
      { id: 'go:work-orders', label: 'Work orders', icon: Wrench, shortcut: 'G W', keywords: ['repairs', 'jobs'] },
      { id: 'go:schedule', label: 'Schedule', icon: CalendarDays, keywords: ['calendar', 'service'] },
      { id: 'go:inventory', label: 'Inventory', icon: Package, keywords: ['parts', 'stock'] },
      { id: 'go:reports', label: 'Reports', icon: BarChart3, keywords: ['costs', 'fuel'] },
    ],
  },
  {
    heading: 'Create',
    commands: [{ id: 'go:work-orders/new', label: 'Report a defect', icon: AlertTriangle, keywords: ['new work order', 'inspection'] }],
  },
  {
    heading: 'Vehicles',
    commands: VEHICLES.map((vehicle) => ({ id: `go:vehicles/${vehicle.id}`, label: `${vehicle.name} · ${vehicle.plate}`, icon: Truck, keywords: [vehicle.make, vehicle.model, vehicle.driver] })),
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'Van 21 failed its inspection', body: 'Coolant leak at the water pump. A work order was opened.', time: '4 min ago', icon: Wrench },
  { id: 'n2', title: 'PO-1184 is on its way', body: 'Northline Parts expects to deliver on 2 Oct.', time: '1 hour ago', icon: Package },
  { id: 'n3', title: 'Insurance for Van 21 has expired', body: 'Renew it before the vehicle goes back on the road.', time: '3 hours ago', icon: FileText },
  { id: 'n4', title: 'Low stock: Battery H8 95 Ah', body: 'Zero on hand, minimum is 2.', time: 'Yesterday', icon: Bell, read: true },
];

export const ACTIVITY: ActivityItem[] = [
  { id: 'a1', actor: { name: 'Tomas Reyes' }, action: 'moved', subject: 'WO-2261 Front brakes and rotors', detail: 'To in the bay. Rotors arrive Thursday.', at: `${TODAY}T08:40:00Z` },
  { id: 'a2', actor: { name: 'Lena Fischer' }, action: 'reported a defect on', subject: 'Van 21', detail: 'Coolant smell in the cab and a puddle under the front.', at: `${TODAY}T07:55:00Z` },
  { id: 'a3', actor: { name: 'Aisha Khan' }, action: 'completed', subject: 'WO-2250 Oil and filter (Truck 02)', at: '2026-09-28T16:20:00Z' },
  {
    id: 'a4',
    actor: { name: 'Priya Nair' },
    action: 'approved the estimate for',
    subject: 'WO-2256 Exhaust catalyst',
    detail: '$1,420 with parts on back order until 3 Oct.',
    at: '2026-09-28T11:05:00Z',
  },
  { id: 'a5', actor: { name: 'Omar Haddad' }, action: 'logged a fuel purchase for', subject: 'Truck 02', at: '2026-09-28T07:12:00Z' },
  { id: 'a6', actor: { name: 'Diego Alvarez' }, action: 'passed the pre-trip inspection for', subject: 'Van 07', at: '2026-09-27T06:30:00Z' },
];

/* ---------- vehicles ---------- */

export interface VehicleRecord extends DemoVehicle {
  score: number;
  issues: HealthIssue[];
  nextService?: { label: string; due: string };
  status: 'On the road' | 'In the shop' | 'Parked';
}

const HEALTH: Record<string, Pick<VehicleRecord, 'score' | 'issues' | 'nextService' | 'status'>> = {
  v12: {
    score: 71,
    status: 'On the road',
    issues: [
      { id: 'i1', label: 'Rear right tyre at 2.0 mm tread', severity: 'critical' },
      { id: 'i2', label: 'Front right tyre 50 kPa under target', severity: 'minor' },
    ],
    nextService: { label: 'Tyre rotation', due: 'Overdue by 1,210 km' },
  },
  v07: { score: 92, status: 'On the road', issues: [], nextService: { label: 'Oil and filter', due: 'In 74 days · 5,570 km' } },
  v21: {
    score: 54,
    status: 'In the shop',
    issues: [
      { id: 'i1', label: 'Coolant leak at the water pump', severity: 'critical' },
      { id: 'i2', label: 'Rear brake pads at 15%', severity: 'major' },
      { id: 'i3', label: 'Insurance expired 9 days ago', severity: 'major' },
    ],
    nextService: { label: 'Brakes and cooling repair', due: 'Booked Thu 1 Oct · Bay 2' },
  },
  v03: { score: 96, status: 'On the road', issues: [], nextService: { label: '60,000 km service', due: 'Booked Thu 8 Oct · Bay 2' } },
  v18: {
    score: 63,
    status: 'Parked',
    issues: [
      { id: 'i1', label: 'Catalytic converter below efficiency', severity: 'major' },
      { id: 'i2', label: 'Transmission fluid due in 20 days', severity: 'minor' },
    ],
    nextService: { label: 'Transmission fluid', due: 'Booked Tue 6 Oct · Bay 1' },
  },
  t02: { score: 80, status: 'On the road', issues: [{ id: 'i1', label: 'Registration expires in 12 days', severity: 'minor' }], nextService: { label: 'Oil and filter', due: 'In 5 days · 650 km' } },
  t05: {
    score: 88,
    status: 'On the road',
    issues: [{ id: 'i1', label: 'Rear right tyre 80 kPa under target', severity: 'minor' }],
    nextService: { label: 'Coolant flush', due: 'Booked Tue 13 Oct · Bay 1' },
  },
  p09: {
    score: 66,
    status: 'In the shop',
    issues: [{ id: 'i1', label: 'P0300 random misfire, 6 occurrences', severity: 'critical' }],
    nextService: { label: 'Annual inspection', due: 'Booked Fri 2 Oct · Bay 3' },
  },
};

export const VEHICLE_RECORDS: VehicleRecord[] = VEHICLES.map((vehicle) => ({ ...vehicle, ...HEALTH[vehicle.id] }));
export const getVehicle = (id: string) => VEHICLE_RECORDS.find((vehicle) => vehicle.id === id);
export const modelLine = (vehicle: DemoVehicle) => `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

const ENGINE: Record<DemoVehicle['klass'], { engine: string; fuel: string; transmission: string; drive: string; payload: string; tank: string; cargo: string; tyre: string }> = {
  Van: { engine: '3.5 L V6 EcoBoost', fuel: 'Petrol', transmission: '10-speed automatic', drive: 'Rear wheel', payload: '1,470 kg', tank: '95 L', cargo: '10.6 m³', tyre: '235/65 R16C' },
  Truck: { engine: '5.2 L 4-cylinder turbo diesel', fuel: 'Diesel', transmission: '6-speed automatic', drive: 'Rear wheel', payload: '3,600 kg', tank: '150 L', cargo: '24 m³', tyre: '225/70 R19.5' },
  Pickup: { engine: '3.5 L V6', fuel: 'Petrol', transmission: '6-speed automatic', drive: 'Four wheel', payload: '640 kg', tank: '80 L', cargo: '1.6 m³ bed', tyre: '265/65 R17' },
};

export function specsFor(vehicle: DemoVehicle): SpecGroup[] {
  const spec = ENGINE[vehicle.klass];
  return [
    {
      title: 'Identity',
      rows: [
        { label: 'Plate', value: vehicle.plate, copyable: true },
        { label: 'VIN', value: vehicle.vin, copyable: true },
        { label: 'Year', value: String(vehicle.year) },
        { label: 'Make and model', value: `${vehicle.make} ${vehicle.model}` },
        { label: 'Driver', value: vehicle.driver },
      ],
    },
    {
      title: 'Powertrain',
      rows: [
        { label: 'Engine', value: spec.engine },
        { label: 'Fuel', value: spec.fuel },
        { label: 'Transmission', value: spec.transmission },
        { label: 'Drive', value: spec.drive },
      ],
    },
    {
      title: 'Capacity',
      rows: [
        { label: 'Payload', value: spec.payload },
        { label: 'Fuel tank', value: spec.tank },
        { label: 'Cargo', value: spec.cargo },
        { label: 'Tyre size', value: spec.tyre },
      ],
    },
  ];
}

export function timelineFor(vehicle: DemoVehicle): TimelineEvent[] {
  const ratio = vehicle.odometerKm / 148210;
  return VAN_12_TIMELINE.filter((event) => Number(event.date.slice(0, 4)) >= vehicle.year)
    .map((event, index) => ({
      ...event,
      id: `${vehicle.id}-${event.id}`,
      date: index === 0 ? `${vehicle.year}-03-18` : event.date,
      odometerKm: event.odometerKm !== undefined ? Math.round(event.odometerKm * ratio) : undefined,
    }))
    .map((event, index) => (index === 0 ? { ...event, type: 'purchase' as const, title: 'Bought new', cost: event.cost ?? 41800 } : event));
}

export function codesFor(id: string): DiagnosticCode[] {
  if (id === 'v21') return CODES.slice(0, 4);
  if (id === 'p09') return CODES.filter((code) => code.code === 'P0300');
  if (id === 'v18') return CODES.filter((code) => code.code === 'P0420');
  if (id === 'v12') return CODES.filter((code) => code.code === 'C0035' || code.code === 'P0456');
  return [];
}

export function tiresFor(vehicle: DemoVehicle): Tire[] {
  if (vehicle.klass === 'Truck') return vehicle.id === 't05' ? TRUCK_05_TIRES : TRUCK_05_TIRES.map((tire) => ({ ...tire, treadMm: tire.treadMm + 1.2, pressureKpa: tire.targetKpa }));
  if (vehicle.id === 'v12') return VAN_12_TIRES;
  return VAN_12_TIRES.map((tire) => ({ ...tire, treadMm: +(tire.treadMm + 2.1).toFixed(1), pressureKpa: tire.targetKpa - 3, ageMonths: 9 }));
}

export function fluidsFor(id: string): { fluids: FluidLevel[]; battery: typeof BATTERY } {
  if (id === 'v21') return { fluids: FLUIDS, battery: BATTERY };
  return {
    fluids: [
      { id: 'oil', label: 'Engine oil life', level: 72, note: 'About 8,600 km until the next change' },
      { id: 'coolant', label: 'Coolant', level: 88 },
      { id: 'brake', label: 'Brake fluid', level: 81 },
      { id: 'washer', label: 'Washer fluid', level: 55 },
    ],
    battery: { voltage: 12.7, healthPercent: 91, coldCrankAmps: 720, testedOn: '2026-08-20' },
  };
}

export function intervalsFor(vehicle: DemoVehicle): ServiceInterval[] {
  const shift = vehicle.odometerKm - 148210;
  return VAN_12_INTERVALS.map((interval) => ({ ...interval, lastDoneKm: interval.lastDoneKm + shift }));
}

export const documentsFor = (vehicle: DemoVehicle) => DOCUMENTS.filter((document) => document.vehicle === vehicle.name);

/* ---------- work orders ---------- */

/** A full job card for a board order, built from the one detailed example. */
export function fullOrder(order: { id: string; title: string; vehicle: string; status: WorkOrder['status']; priority: WorkOrder['priority']; technician?: string; openedOn: string }): WorkOrder {
  const plate = VEHICLES.find((vehicle) => vehicle.name === order.vehicle)?.plate;
  return { ...WORK_ORDER, ...order, vehicle: plate ? `${order.vehicle} · ${plate}` : order.vehicle, bay: order.status === 'in-bay' ? 'Bay 2' : undefined };
}

export const SYSTEMS = ['Brakes', 'Engine', 'Tyres', 'Lights', 'Steering', 'Body', 'Cab', 'Other'];

/* ---------- account ---------- */

export const PROFILE: ProfileValues = {
  name: 'Priya Nair',
  email: 'priya@northwind.example',
  role: 'Fleet manager',
  bio: 'Runs maintenance for the depot. Ask me about brake pads.',
};
export const ROLES = ['Fleet manager', 'Workshop lead', 'Technician', 'Driver', 'Viewer'];

export const CHANNELS: NotificationChannel[] = [
  { id: 'email', label: 'Email' },
  { id: 'push', label: 'Push' },
];

export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    id: 'work',
    title: 'Work',
    items: [
      { id: 'assigned', label: 'A work order is assigned to me' },
      { id: 'status', label: 'A work order changes status' },
    ],
  },
  {
    id: 'fleet',
    title: 'Fleet',
    items: [
      { id: 'due', label: 'A service is coming due', description: 'Seven days before the date or 500 km before the reading.' },
      { id: 'faults', label: 'A new fault code appears' },
      { id: 'docs', label: 'A document is about to expire' },
    ],
  },
  { id: 'stock', title: 'Inventory', items: [{ id: 'low', label: 'A part drops below its minimum' }] },
];

export const NOTIFICATION_DEFAULTS: Record<string, boolean> = {
  'assigned.email': true,
  'assigned.push': true,
  'status.push': true,
  'due.email': true,
  'faults.push': true,
  'docs.email': true,
  'low.email': true,
};
