import { PageHeader } from '@/components/app/page-header';
import { RouteOptimizerResult } from '@/components/maps/route-optimizer-result';
import { TripReplay } from '@/components/maps/trip-replay';
import { VehicleDetailPanel } from '@/components/maps/vehicle-detail-panel';
import { OPTIMIZER_BEST, OPTIMIZER_BEST_ROUTE, OPTIMIZER_NAIVE, OPTIMIZER_NAIVE_ROUTE } from '../data/optimizer';
import { OPTIMIZER_STOPS, REPLAY, VEHICLE, VEHICLE_STOPS, VEHICLE_TRAIL } from '../data/ops';

/** Planning: what the optimiser saved on tomorrow's run, and how a finished run actually went. */
export function RoutesPage() {
  return (
    <>
      <PageHeader title="Routes" description="Tomorrow's run for Van 12, and yesterday's for comparison." breadcrumbs={[{ label: 'Courier' }, { label: 'Routes' }]} />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <RouteOptimizerResult
          className="w-full max-w-none"
          stops={OPTIMIZER_STOPS}
          before={{ route: OPTIMIZER_NAIVE_ROUTE, ...OPTIMIZER_NAIVE }}
          after={{ route: OPTIMIZER_BEST_ROUTE, ...OPTIMIZER_BEST }}
        />
        <TripReplay className="w-full max-w-none" {...REPLAY} defaultProgress={0.42} />
      </div>
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
        <VehicleDetailPanel className="w-full max-w-none" vehicle={VEHICLE} trail={VEHICLE_TRAIL} stops={VEHICLE_STOPS} />
      </div>
    </>
  );
}
