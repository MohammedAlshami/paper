import { useToast } from '@/components/app/toast';
import { CoverageMap } from '@/components/maps/coverage-map';
import { HeatmapCard } from '@/components/maps/heatmap-card';
import { PickupPointSelector } from '@/components/maps/pickup-point-selector';
import { ServiceAreaChecker } from '@/components/maps/service-area-checker';
import { CHECKER_START, COVERAGE_CELLS, HEAT_POINTS, PICKUP_POINTS, SERVICE_ZONES, searchPlaces } from '../../../data/delivery';
import { HarborPage } from '../../../layout';
import { useHarbor } from '../../../state';

/** Where Harbor delivers, how well, and where customers can collect instead. */
export function ZonesPage() {
  const { actions } = useHarbor();
  const { toast } = useToast();
  return (
    <HarborPage title="Zones and pickup" description="Where Harbor delivers, how well each part of the city is served, and where people can collect an order.">
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <ServiceAreaChecker
          className="w-full max-w-none"
          zones={SERVICE_ZONES}
          defaultPosition={CHECKER_START}
          search={searchPlaces}
          onCheck={() => undefined}
          onNotify={() => {
            actions.log('recorded interest from outside the zones near', 'a customer address', 'settings', '/zones');
            toast({ title: 'Noted', description: "We'll tell them if the zones grow.", variant: 'success' });
          }}
        />
        <CoverageMap className="w-full max-w-none" cells={COVERAGE_CELLS} title="Delivery coverage" />
      </div>
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <PickupPointSelector
          className="w-full max-w-none"
          points={PICKUP_POINTS}
          userPosition={CHECKER_START}
          defaultSelectedId="mission"
          confirmLabel="Offer at checkout"
          onConfirm={(point) => {
            actions.log('made the pickup point live:', point.name, 'settings', '/zones');
            toast({ title: `${point.name} is live`, description: 'Customers can now choose it at checkout.', variant: 'success' });
          }}
        />
        <HeatmapCard className="w-full max-w-none" points={HEAT_POINTS} title="Delivery density" unit="deliveries" defaultRange={[11, 20]} />
      </div>
    </HarborPage>
  );
}
