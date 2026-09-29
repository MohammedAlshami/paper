import { BarChart3, CalendarClock, ClipboardList, Fuel, Handshake, Inbox, LayoutDashboard, Map, MapPinned, Package, PackageCheck, Route, ScrollText, Settings, ShoppingBag, Store, Truck, Undo2, UserRound, Users, UsersRound, Warehouse, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NavGroup } from '@/components/app/app-shell';
import type { HarborCounts } from './state';

export interface HarborNavItem {
  id: string;
  label: string;
  /** The Harbor path. */
  path: string;
  icon: LucideIcon;
  /** Which count from the state, if any, shows as the badge. */
  badge?: keyof HarborCounts;
  /** Extra words for the command palette. */
  keywords?: string[];
}

export interface HarborNavGroup {
  heading: string;
  defaultCollapsed?: boolean;
  items: HarborNavItem[];
}

/** The whole app in one list: the sidebar, the command palette and the active-item logic all read this. */
export const NAV: HarborNavGroup[] = [
  {
    heading: 'Command',
    items: [
      { id: 'overview', label: 'Overview', path: '/', icon: LayoutDashboard, keywords: ['dashboard', 'today'] },
      { id: 'inbox', label: 'Inbox', path: '/inbox', icon: Inbox, badge: 'unreadAlerts', keywords: ['alerts', 'notifications'] },
    ],
  },
  {
    heading: 'Orders',
    items: [
      { id: 'orders', label: 'Orders', path: '/orders', icon: ShoppingBag, badge: 'newOrders', keywords: ['sales'] },
      { id: 'pick-and-pack', label: 'Pick and pack', path: '/pick-and-pack', icon: PackageCheck, keywords: ['warehouse', 'fulfil'] },
      { id: 'returns', label: 'Returns', path: '/returns', icon: Undo2, badge: 'pendingReturns', keywords: ['refunds'] },
    ],
  },
  {
    heading: 'Delivery',
    items: [
      { id: 'live-map', label: 'Live map', path: '/live-map', icon: Map, keywords: ['vans', 'tracking'] },
      { id: 'dispatch', label: 'Dispatch', path: '/dispatch', icon: Route, badge: 'unassignedJobs', keywords: ['assign', 'jobs'] },
      { id: 'routes', label: 'Routes', path: '/routes', icon: Route, keywords: ['optimiser', 'trips'] },
      { id: 'drivers', label: 'Drivers', path: '/drivers', icon: Users, keywords: ['roster', 'shifts'] },
      { id: 'zones', label: 'Zones and pickup', path: '/zones', icon: MapPinned, keywords: ['coverage', 'service area', 'lockers'] },
    ],
  },
  {
    heading: 'Catalog and stock',
    items: [
      { id: 'products', label: 'Products', path: '/products', icon: Package, keywords: ['catalogue', 'sku'] },
      { id: 'inventory', label: 'Inventory', path: '/inventory', icon: Warehouse, badge: 'lowStock', keywords: ['stock', 'levels'] },
      { id: 'purchasing', label: 'Purchasing', path: '/purchasing', icon: ClipboardList, keywords: ['reorder', 'purchase orders', 'po', 'receive'] },
      { id: 'suppliers', label: 'Suppliers', path: '/suppliers', icon: Handshake, keywords: ['vendors'] },
    ],
  },
  {
    heading: 'Fleet',
    defaultCollapsed: true,
    items: [
      { id: 'vehicles', label: 'Vehicles', path: '/vehicles', icon: Truck, keywords: ['vans', 'trucks'] },
      { id: 'maintenance', label: 'Maintenance', path: '/maintenance', icon: CalendarClock, keywords: ['service', 'schedule', 'downtime'] },
      { id: 'work-orders', label: 'Work orders', path: '/work-orders', icon: Wrench, badge: 'openWorkOrders', keywords: ['repairs', 'garage'] },
      { id: 'fuel-and-costs', label: 'Fuel and costs', path: '/fuel-and-costs', icon: Fuel, keywords: ['running costs'] },
    ],
  },
  {
    heading: 'Insight and admin',
    defaultCollapsed: true,
    items: [
      { id: 'sales', label: 'Sales', path: '/sales', icon: BarChart3, keywords: ['revenue', 'analytics'] },
      { id: 'stores', label: 'Stores', path: '/stores', icon: Store, keywords: ['locations', 'branches', 'leaderboard'] },
      { id: 'customers', label: 'Customers', path: '/customers', icon: UserRound, keywords: ['crm'] },
      { id: 'reports', label: 'Reports', path: '/reports', icon: ClipboardList, keywords: ['export'] },
      { id: 'team', label: 'Team', path: '/team', icon: UsersRound, keywords: ['roles', 'members', 'permissions'] },
      { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, keywords: ['profile', 'notifications', 'api keys'] },
      { id: 'audit-log', label: 'Audit log', path: '/audit-log', icon: ScrollText, keywords: ['activity', 'history'] },
    ],
  },
];

export const NAV_ITEMS = NAV.flatMap((group) => group.items);
export const NAV_PATHS: Record<string, string> = Object.fromEntries(NAV_ITEMS.map((item) => [item.id, item.path]));

/** Which nav item a path belongs to: the one whose path is the longest prefix of it. "/orders/o-1042" is "orders". */
export function activeIdFor(path: string) {
  if (path === '/' || path === '') return 'overview';
  const match = NAV_ITEMS.filter((item) => item.path !== '/' && (path === item.path || path.startsWith(`${item.path}/`))).sort((a, b) => b.path.length - a.path.length)[0];
  return match?.id ?? '';
}

/** The AppShell nav for the current counts: real hrefs (so links open in a new tab) and badges. */
export function buildNav(base: string, counts: HarborCounts): NavGroup[] {
  return NAV.map((group) => ({
    heading: group.heading,
    collapsible: true,
    defaultCollapsed: group.defaultCollapsed,
    items: group.items.map((item) => {
      const count = item.badge ? counts[item.badge] : 0;
      return { id: item.id, label: item.label, icon: item.icon, href: `${base}${item.path === '/' ? '' : item.path}`, ...(count ? { badge: count } : {}) };
    }),
  }));
}
