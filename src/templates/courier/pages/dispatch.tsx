import * as React from 'react';
import { Plus } from 'lucide-react';
import { ActivityFeed } from '@/components/app/activity-feed';
import { PageHeader } from '@/components/app/page-header';
import { StatCardGrid } from '@/components/app/stat-card-grid';
import { DispatchBoard } from '@/components/maps/dispatch-board';
import { FleetOverview } from '@/components/maps/fleet-overview';
import { GeofenceAlertFeed } from '@/components/maps/geofence-alert-feed';
import { Button } from '@/components/ui/button';
import { ACTIVITY, fleetAt, STATS } from '../data/ops';
import { DISPATCH_DRIVERS, DISPATCH_JOBS, GEOFENCE_EVENTS } from '../data/places';

/** The dispatcher's home: the day in numbers, the board to assign jobs, the live fleet, and what just happened. */
export function DispatchPage() {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const timer = window.setInterval(() => setTick((current) => current + 1), 1600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <PageHeader
        title="Dispatch"
        description="Today's deliveries, and the drivers to give them to."
        breadcrumbs={[{ label: 'Courier' }, { label: 'Dispatch' }]}
        actions={
          <Button size="sm">
            <Plus /> New job
          </Button>
        }
      />
      <StatCardGrid stats={STATS} period="vs yesterday" />
      <DispatchBoard className="w-full" jobs={DISPATCH_JOBS} drivers={DISPATCH_DRIVERS} defaultAssignments={{ j1: 'd2', j3: 'd1' }} />
      <FleetOverview className="w-full" vehicles={fleetAt(tick)} />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <GeofenceAlertFeed className="w-full max-w-none" events={GEOFENCE_EVENTS} />
        <ActivityFeed items={ACTIVITY} today="2026-09-29" title="Recent activity" />
      </div>
    </>
  );
}
