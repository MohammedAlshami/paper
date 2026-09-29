import type { HarborSection } from '../../types';
import { INSIGHT_PAGES } from './pages';
import { AuditLogPage } from './pages/audit-log';
import { CustomerDetailPage } from './pages/customer-detail';
import { CustomersPage } from './pages/customers';
import { ReportsPage } from './pages/reports';
import { SalesPage } from './pages/sales';
import { SettingsPage } from './pages/settings';
import { StoresPage } from './pages/stores';
import { TeamPage } from './pages/team';

/** The insight and admin section of Harbor: the numbers, the people and the settings. */
export const INSIGHT: HarborSection = {
  pages: INSIGHT_PAGES,
  routes: [
    { path: '/sales', render: () => <SalesPage /> },
    { path: '/stores', render: () => <StoresPage /> },
    { path: '/customers', render: () => <CustomersPage /> },
    { path: '/customers/:id', render: ({ params }) => <CustomerDetailPage id={params.id} /> },
    { path: '/reports', render: () => <ReportsPage /> },
    { path: '/team', render: () => <TeamPage /> },
    { path: '/settings', render: () => <SettingsPage /> },
    { path: '/audit-log', render: () => <AuditLogPage /> },
  ],
};
