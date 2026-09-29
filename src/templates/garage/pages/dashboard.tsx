import { PageHeader } from '@/components/app/page-header';
import { ActivityFeed } from '@/components/app/activity-feed';
import { Button } from '@/components/ui/button';
import { DocumentExpiryTracker } from '@/components/fleet/document-expiry-tracker';
import { DowntimeForecast } from '@/components/fleet/downtime-forecast';
import { FleetKpiStrip } from '@/components/fleet/fleet-kpi-strip';
import { ServiceDueList } from '@/components/fleet/service-due-list';
import { ACTIVITY, DOCUMENTS, DOWNTIME_DAYS, DOWNTIME_VEHICLES, DUE_SERVICES, KPIS, TODAY, VEHICLES } from '../data';
import { GarageShell, PageBody } from '../shell';
import type { PageContext } from '../context';

export function DashboardPage(ctx: PageContext) {
  const { navigate } = ctx;
  return (
    <GarageShell activeId="dashboard" ctx={ctx}>
      <PageBody>
        <PageHeader
          title="Dashboard"
          description="Tuesday 29 September. Five of eight vehicles are on the road today."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => navigate('/schedule')}>
                Schedule a service
              </Button>
              <Button size="sm" onClick={() => navigate('/work-orders/new')}>
                Report a defect
              </Button>
            </>
          }
        />
        <FleetKpiStrip kpis={KPIS} period="vs last month" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <ServiceDueList items={DUE_SERVICES} today={TODAY} onSchedule={() => navigate('/schedule')} />
          <DowntimeForecast days={DOWNTIME_DAYS} vehicles={DOWNTIME_VEHICLES} fleetSize={VEHICLES.length} />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <ActivityFeed items={ACTIVITY} today={TODAY} title="Workshop activity" />
          <DocumentExpiryTracker documents={DOCUMENTS} today={TODAY} />
        </div>
      </PageBody>
    </GarageShell>
  );
}
