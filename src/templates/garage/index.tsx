import * as React from 'react';
import { resolveRoute } from '../router';
import type { TemplateProps } from '../types';
import { BOARD_ORDERS } from './data';
import type { PageContext } from './context';
import { ForgotPasswordPage, LoginPage, RegisterPage } from './pages/auth';
import { DashboardPage } from './pages/dashboard';
import { InventoryPage } from './pages/inventory';
import { NotFoundPage } from './pages/not-found';
import { ReportsPage } from './pages/reports';
import { SchedulePage } from './pages/schedule';
import { SettingsPage } from './pages/settings';
import { VehicleDetailPage } from './pages/vehicle-detail';
import { VehiclesPage } from './pages/vehicles';
import { WorkOrderNewPage } from './pages/work-order-new';
import { WorkOrdersPage } from './pages/work-orders';

/** Order matters: "/work-orders/new" must come before anything that could read "new" as an id. */
const ROUTES: { path: string; page: React.ComponentType<PageContext> }[] = [
  { path: '/login', page: LoginPage },
  { path: '/register', page: RegisterPage },
  { path: '/forgot-password', page: ForgotPasswordPage },
  { path: '/', page: DashboardPage },
  { path: '/vehicles', page: VehiclesPage },
  { path: '/vehicles/:id', page: VehicleDetailPage },
  { path: '/work-orders', page: WorkOrdersPage },
  { path: '/work-orders/new', page: WorkOrderNewPage },
  { path: '/schedule', page: SchedulePage },
  { path: '/inventory', page: InventoryPage },
  { path: '/reports', page: ReportsPage },
  { path: '/settings', page: SettingsPage },
];

/** Garage — a fleet maintenance app. Start at /login, or go straight to the dashboard at /. */
export default function GarageTemplate({ path, navigate, base }: TemplateProps) {
  const [orders, setOrders] = React.useState(BOARD_ORDERS);
  const match = resolveRoute(ROUTES, path);
  const ctx: PageContext = { base, navigate, params: match?.params ?? {}, orders, setOrders };
  const Page = match?.route.page ?? NotFoundPage;
  return <Page key={match?.route.path ?? path} {...ctx} />;
}
