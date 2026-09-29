import { Truck } from 'lucide-react';
import { EmptyState } from '@/components/app/empty-state';
import { PageHeader } from '@/components/app/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiagnosticCodeList } from '@/components/fleet/diagnostic-code-list';
import { DocumentExpiryTracker } from '@/components/fleet/document-expiry-tracker';
import { FluidsAndBatteryPanel } from '@/components/fleet/fluids-battery-panel';
import { FuelTransactionList } from '@/components/fleet/fuel-transaction-list';
import { ServiceIntervalGauge } from '@/components/fleet/service-interval-gauge';
import { TireStatusGrid } from '@/components/fleet/tire-status-grid';
import { VehicleHealthCard } from '@/components/fleet/vehicle-health-card';
import { VehicleSpecSheet } from '@/components/fleet/vehicle-spec-sheet';
import { VehicleTimeline } from '@/components/fleet/vehicle-timeline';
import { codesFor, documentsFor, FUEL_TX, fluidsFor, getVehicle, intervalsFor, modelLine, specsFor, TODAY, tiresFor, timelineFor } from '../data';
import { GarageShell, PageBody } from '../shell';
import type { PageContext } from '../context';

export function VehicleDetailPage(ctx: PageContext) {
  const { navigate, base, params } = ctx;
  const vehicle = getVehicle(params.id);

  if (!vehicle) {
    return (
      <GarageShell activeId="vehicles" ctx={ctx}>
        <PageBody>
          <EmptyState
            icon={Truck}
            title="No such vehicle"
            description={`Nothing in the fleet has the id "${params.id}".`}
            action={{ label: 'Back to vehicles', onClick: () => navigate('/vehicles') }}
          />
        </PageBody>
      </GarageShell>
    );
  }

  const codes = codesFor(vehicle.id);
  const documents = documentsFor(vehicle);
  const fuel = FUEL_TX.filter((transaction) => transaction.vehicle === vehicle.name);
  const { fluids, battery } = fluidsFor(vehicle.id);

  return (
    <GarageShell activeId="vehicles" ctx={ctx}>
      <PageBody>
        <PageHeader
          breadcrumbs={[{ label: 'Vehicles', href: `${base}/vehicles` }, { label: vehicle.name }]}
          onCrumb={(crumb) => crumb.href && navigate('/vehicles')}
          title={vehicle.name}
          badge={<Badge variant="outline">{vehicle.status}</Badge>}
          description={`${modelLine(vehicle)} · ${vehicle.odometerKm.toLocaleString('en-US')} km. Driven by ${vehicle.driver}.`}
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => navigate('/schedule')}>
                Schedule service
              </Button>
              <Button size="sm" onClick={() => navigate('/work-orders/new')}>
                Report a defect
              </Button>
            </>
          }
        />
        <Tabs defaultValue="overview">
          <TabsList className="group-data-[orientation=horizontal]/tabs:h-auto flex-wrap justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="condition">Condition</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="fuel">Fuel</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <VehicleHealthCard
                name={vehicle.name}
                model={modelLine(vehicle)}
                plate={vehicle.plate}
                odometerKm={vehicle.odometerKm}
                score={vehicle.score}
                issues={vehicle.issues}
                nextService={vehicle.nextService}
                onSchedule={() => navigate('/schedule')}
              />
              <VehicleSpecSheet title={vehicle.name} subtitle={`${modelLine(vehicle)} · ${vehicle.odometerKm.toLocaleString('en-US')} km`} groups={specsFor(vehicle)} />
            </div>
          </TabsContent>

          <TabsContent value="condition">
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <TireStatusGrid vehicle={vehicle.name} odometerKm={vehicle.odometerKm} tires={tiresFor(vehicle)} />
              <FluidsAndBatteryPanel vehicle={vehicle.name} fluids={fluids} battery={battery} />
              <ServiceIntervalGauge vehicle={vehicle.name} odometerKm={vehicle.odometerKm} intervals={intervalsFor(vehicle)} />
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <VehicleTimeline events={timelineFor(vehicle)} />
              {codes.length ? (
                <DiagnosticCodeList codes={codes} onCreateWorkOrder={() => navigate('/work-orders/new')} />
              ) : (
                <EmptyState title="No fault codes" description={`${vehicle.name} has not reported any diagnostic trouble codes.`} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="fuel">
            {fuel.length ? <FuelTransactionList transactions={fuel} /> : <EmptyState title="No fuel purchases this week" description="Card transactions appear here as they are made." />}
          </TabsContent>

          <TabsContent value="documents">
            {documents.length ? (
              <DocumentExpiryTracker documents={documents} today={TODAY} />
            ) : (
              <EmptyState title="No documents on file" description="Upload insurance, registration and inspection certificates to track their expiry." action={{ label: 'Upload a document' }} />
            )}
          </TabsContent>
        </Tabs>
      </PageBody>
    </GarageShell>
  );
}
