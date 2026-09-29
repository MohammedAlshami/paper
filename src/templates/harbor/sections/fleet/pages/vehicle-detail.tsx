import { Truck } from 'lucide-react';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { EmptyState } from '@/components/app/empty-state';
import { useToast } from '@/components/app/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiagnosticCodeList } from '@/components/fleet/diagnostic-code-list';
import { DocumentExpiryTracker } from '@/components/fleet/document-expiry-tracker';
import { FluidsAndBatteryPanel } from '@/components/fleet/fluids-battery-panel';
import { FuelEconomyTrend } from '@/components/fleet/fuel-economy-trend';
import { FuelTransactionList } from '@/components/fleet/fuel-transaction-list';
import { ServiceIntervalGauge } from '@/components/fleet/service-interval-gauge';
import { TireStatusGrid } from '@/components/fleet/tire-status-grid';
import { VehicleHealthCard } from '@/components/fleet/vehicle-health-card';
import { VehicleSpecSheet } from '@/components/fleet/vehicle-spec-sheet';
import { VehicleTimeline } from '@/components/fleet/vehicle-timeline';
import { WorkOrderCard } from '@/components/fleet/work-order-card';
import { formatTime, getVehicle, TODAY, type DeliveryJob } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { FUEL_DATA, FUEL_VEHICLES } from '../demo-data';
import { ALL_FUEL, codesFor, documentsFor, fluidsFor, intervalsFor, modelLine, specsFor, STATUS_LABEL, tiresFor, timelineFor, toFleetVehicle } from '../helpers';

const JOB_STATUS: Record<DeliveryJob['status'], string> = { unassigned: 'Unassigned', assigned: 'Assigned', 'en-route': 'En route', delivered: 'Delivered', failed: 'Failed' };

export function VehicleDetailPage({ id }: { id: string }) {
  const { navigate } = useHarborRouter();
  const { state, actions } = useHarbor();
  const { toast } = useToast();
  const found = getVehicle(id);

  if (!found) {
    return (
      <HarborPage title="Vehicle not found" crumbs={[{ label: 'Vehicles', path: '/vehicles' }]}>
        <EmptyState icon={Truck} title="No such vehicle" description={`Nothing in the fleet has the id "${id}".`} action={{ label: 'Back to vehicles', onClick: () => navigate('/vehicles') }} />
      </HarborPage>
    );
  }

  const vehicle = toFleetVehicle(found);
  const codes = codesFor(vehicle.id);
  const documents = documentsFor(vehicle);
  const fuel = ALL_FUEL.filter((transaction) => transaction.vehicle === vehicle.name);
  const { fluids, battery } = fluidsFor(vehicle.id);
  const jobs = state.jobs.filter((job) => job.vehicleId === vehicle.id);
  const openOrders = state.workOrders.filter((order) => order.vehicle === vehicle.name && order.status !== 'done');
  const fuelVehicle = FUEL_VEHICLES.some((item) => item.id === vehicle.id) ? vehicle.id : undefined;

  const bookService = () => {
    const orderId = actions.addWorkOrder({
      title: 'Service booked',
      vehicle: vehicle.name,
      status: 'scheduled',
      priority: 'normal',
      tasks: [{ id: 't1', label: 'Inspection and service', done: false }],
      parts: [],
      laborHours: 1.5,
      laborRate: 95,
    });
    toast({ title: `Service booked for ${vehicle.name}`, description: `Work order ${orderId.toUpperCase()} is on the board.`, variant: 'success', action: { label: 'View', onClick: () => navigate('/work-orders') } });
  };

  const jobColumns: DataColumn<DeliveryJob>[] = [
    {
      id: 'order',
      header: 'Order',
      sortValue: (row) => row.orderId,
      cell: (row) => <span className="font-mono text-xs font-bold">#{state.orders.find((order) => order.id === row.orderId)?.number ?? row.orderId}</span>,
    },
    { id: 'dropoff', header: 'Drop-off', cell: (row) => <span className="block truncate">{row.dropoff.label}</span> },
    { id: 'window', header: 'Window', hideBelow: 'sm', cell: (row) => <span className="font-mono text-xs">{formatTime(row.windowFrom)} to {formatTime(row.windowTo)}</span> },
    { id: 'status', header: 'Status', align: 'right', sortValue: (row) => row.status, cell: (row) => <Badge variant="outline">{JOB_STATUS[row.status]}</Badge> },
  ];

  return (
    <HarborPage
      title={vehicle.name}
      crumbs={[{ label: 'Vehicles', path: '/vehicles' }]}
      badge={<Badge variant="outline">{STATUS_LABEL[vehicle.status]}</Badge>}
      description={
        <>
          {modelLine(vehicle)} · {vehicle.odometerKm.toLocaleString('en-US')} km. Driven by{' '}
          <Button variant="link" className="h-auto p-0 text-sm" onClick={() => navigate('/drivers')}>
            {vehicle.driver}
          </Button>
          .
        </>
      }
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => navigate('/work-orders')}>
            Work orders
          </Button>
          <Button size="sm" onClick={bookService}>
            Book a service
          </Button>
        </>
      }
    >
      <Tabs defaultValue="overview">
        <TabsList className="group-data-[orientation=horizontal]/tabs:h-auto flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries {jobs.length ? `(${jobs.length})` : ''}</TabsTrigger>
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
              score={vehicle.health}
              issues={vehicle.issues}
              nextService={vehicle.nextService}
              onSchedule={bookService}
            />
            <VehicleSpecSheet title={vehicle.name} subtitle={`${modelLine(vehicle)} · ${vehicle.odometerKm.toLocaleString('en-US')} km`} groups={specsFor(vehicle)} />
            {openOrders.map((order) => (
              <WorkOrderCard key={order.id} order={order} onAdvance={(status) => actions.moveWorkOrder(order.id, status)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deliveries">
          {jobs.length ? (
            <DataTable rows={jobs} columns={jobColumns} getRowId={(row) => row.id} pageSize={8} onRowClick={(row) => navigate(`/orders/${row.orderId}`)} />
          ) : (
            <EmptyState icon={Truck} title="No deliveries today" description={`${vehicle.name} has no jobs assigned. Assign one from Dispatch.`} action={{ label: 'Open dispatch', onClick: () => navigate('/dispatch') }} />
          )}
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
              <DiagnosticCodeList
                codes={codes}
                onCreateWorkOrder={(code) => {
                  const orderId = actions.addWorkOrder({
                    title: `Fault ${code.code}`,
                    vehicle: vehicle.name,
                    status: 'requested',
                    priority: code.severity === 'critical' ? 'high' : 'normal',
                    tasks: [{ id: 't1', label: `Diagnose ${code.code}`, done: false }],
                    parts: [],
                    laborHours: 1,
                    laborRate: 95,
                  });
                  toast({ title: `Work order ${orderId.toUpperCase()} opened`, description: `For fault code ${code.code}.`, variant: 'success' });
                }}
              />
            ) : (
              <EmptyState title="No fault codes" description={`${vehicle.name} has not reported any diagnostic trouble codes.`} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="fuel">
          <div className="grid items-start gap-6 xl:grid-cols-2">
            <FuelEconomyTrend data={FUEL_DATA} vehicles={FUEL_VEHICLES} defaultVehicleId={fuelVehicle} unit="L/100 km" />
            {fuel.length ? <FuelTransactionList transactions={fuel} /> : <EmptyState title="No fuel purchases this week" description="Card transactions appear here as they are made." />}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          {documents.length ? (
            <DocumentExpiryTracker documents={documents} today={TODAY} />
          ) : (
            <EmptyState title="No documents on file" description="Upload insurance, registration and inspection certificates to track their expiry." />
          )}
        </TabsContent>
      </Tabs>
    </HarborPage>
  );
}
