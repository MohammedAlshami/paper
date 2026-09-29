import type { HarborSection } from '../../types';
import { FuelAndCostsPage } from './pages/fuel-and-costs';
import { MaintenancePage } from './pages/maintenance';
import { VehicleDetailPage } from './pages/vehicle-detail';
import { VehiclesPage } from './pages/vehicles';
import { WorkOrdersPage } from './pages/work-orders';
import { FLEET_PAGES } from './pages';

/** The fleet section of Harbor: the vans, their upkeep and their running costs. */
export const FLEET: HarborSection = {
  pages: FLEET_PAGES,
  routes: [
    { path: '/vehicles', render: () => <VehiclesPage /> },
    { path: '/vehicles/:id', render: ({ params }) => <VehicleDetailPage id={params.id} /> },
    { path: '/maintenance', render: () => <MaintenancePage /> },
    { path: '/work-orders', render: () => <WorkOrdersPage /> },
    { path: '/fuel-and-costs', render: () => <FuelAndCostsPage /> },
  ],
};
