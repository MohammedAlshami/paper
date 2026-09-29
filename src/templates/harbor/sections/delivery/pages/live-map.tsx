import * as React from 'react';
import { AlertTriangle, CheckCheck, PackageOpen, Truck } from 'lucide-react';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { EmptyState } from '@/components/app/empty-state';
import { StatCardGrid, type Stat } from '@/components/app/stat-card-grid';
import { useToast } from '@/components/app/toast';
import { FleetOverview } from '@/components/maps/fleet-overview';
import { GeofenceAlertFeed } from '@/components/maps/geofence-alert-feed';
import { VehicleDetailPanel } from '@/components/maps/vehicle-detail-panel';
import { Badge } from '@/components/ui/badge';
import { TODAY, VEHICLES, formatTime, getCustomer, isLate, type DeliveryJob, type Order } from '../../../data';
import { GEOFENCE_EVENTS, driverOf, fleetVehicles, isOpenJob, vehicleStops, vehicleTrail } from '../../../data/delivery';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';

interface OpenJob {
  job: DeliveryJob;
  order?: Order;
}

const STATUS_LABEL: Record<DeliveryJob['status'], string> = { unassigned: 'Unassigned', assigned: 'Assigned', 'en-route': 'On the way', delivered: 'Delivered', failed: 'Failed' };

/** Every van and every open delivery, right now: the map, the vehicle you picked, and the jobs still to do. */
export function LiveMapPage() {
  const { state } = useHarbor();
  const { navigate } = useHarborRouter();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = React.useState<string | null>('v07');

  const vehicles = React.useMemo(() => fleetVehicles(state.jobs), [state.jobs]);
  const open = state.jobs.filter(isOpenJob);
  const late = open.filter(isLate);
  const deliveredToday = state.jobs.filter((job) => job.status === 'delivered' && job.windowFrom.slice(0, 10) === TODAY).length;
  const onRoad = vehicles.filter((vehicle) => vehicle.status === 'moving' || vehicle.status === 'delayed').length;

  const stats: Stat[] = [
    { id: 'road', label: 'On the road', value: `${onRoad} of ${vehicles.length}`, icon: Truck },
    { id: 'open', label: 'Open deliveries', value: String(open.length), icon: PackageOpen },
    { id: 'late', label: 'Running late', value: String(late.length), icon: AlertTriangle, goodWhen: 'down' },
    { id: 'done', label: 'Delivered today', value: String(deliveredToday), icon: CheckCheck },
  ];

  const selected = VEHICLES.find((vehicle) => vehicle.id === selectedId);
  const selectedFleet = vehicles.find((vehicle) => vehicle.id === selectedId);
  const driver = selected ? driverOf(selected.id) : undefined;

  const rows: OpenJob[] = open.map((job) => ({ job, order: state.orders.find((order) => order.id === job.orderId) }));
  const columns: DataColumn<OpenJob>[] = [
    {
      id: 'order',
      header: 'Order',
      sortValue: ({ order }) => order?.number ?? '',
      cell: ({ order }) => (
        <span className="flex flex-col">
          <span className="font-medium">{order?.number}</span>
          <span className="text-xs text-muted-foreground">{order ? getCustomer(order.customerId)?.name : ''}</span>
        </span>
      ),
    },
    { id: 'to', header: 'Drop-off', hideBelow: 'md', sortValue: ({ job }) => job.dropoff.label, cell: ({ job }) => job.dropoff.label },
    {
      id: 'driver',
      header: 'Driver',
      hideBelow: 'sm',
      sortValue: ({ job }) => driverOf(job.vehicleId ?? '')?.name ?? '~',
      cell: ({ job }) => (job.driverId ? (driverOf(job.vehicleId ?? '')?.name ?? '') : <span className="text-muted-foreground">Nobody yet</span>),
    },
    { id: 'window', header: 'Window', hideBelow: 'lg', sortValue: ({ job }) => job.windowTo, cell: ({ job }) => <span className="font-mono text-xs tabular-nums">{formatTime(job.windowFrom)} – {formatTime(job.windowTo)}</span> },
    {
      id: 'status',
      header: 'Status',
      align: 'right',
      sortValue: ({ job }) => job.status,
      cell: ({ job }) =>
        isLate(job) ? (
          <Badge style={{ background: '#ec4899', color: '#fff' }}>Late</Badge>
        ) : (
          <Badge variant="outline">{STATUS_LABEL[job.status]}</Badge>
        ),
    },
  ];

  return (
    <HarborPage title="Live map" description="Every van and every open delivery, right now.">
      <StatCardGrid stats={stats} period="today" />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <FleetOverview className="w-full max-w-none" vehicles={vehicles} selectedId={selectedId} onSelect={(vehicle) => setSelectedId(vehicle.id)} />
        {selected && selectedFleet ? (
          <VehicleDetailPanel
            className="w-full max-w-none"
            vehicle={{
              name: selected.name,
              plate: selected.plate,
              status: selectedFleet.status,
              driver: { name: driver?.name ?? 'Unassigned', phone: driver?.phone },
              speedKph: selectedFleet.speedKph ?? 0,
              fuelPercent: selected.fuelLevel,
              odometerKm: selected.odometerKm,
              position: selectedFleet.position,
            }}
            trail={vehicleTrail(selected, state.jobs)}
            stops={vehicleStops(selected, state.jobs, state.orders)}
            onCall={() => toast({ title: `Calling ${driver?.name ?? 'the driver'}`, description: driver?.phone, variant: 'success' })}
          />
        ) : (
          <EmptyState icon={Truck} title="Pick a vehicle" description="Choose one on the map or in the list to see its speed, fuel and where it has been today." />
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <DataTable
          rows={rows}
          columns={columns}
          getRowId={({ job }) => job.id}
          searchText={({ job, order }) => `${order?.number ?? ''} ${job.dropoff.label} ${driverOf(job.vehicleId ?? '')?.name ?? ''}`}
          searchPlaceholder="Search open deliveries"
          filter={{
            label: 'Status',
            options: [
              { value: 'en-route', label: 'On the way' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'unassigned', label: 'Unassigned' },
            ],
            match: ({ job }, value) => job.status === value,
          }}
          defaultSort={{ id: 'window', dir: 'asc' }}
          pageSize={5}
          onRowClick={({ job }) => navigate(`/orders/${job.orderId}`)}
          emptyTitle="No open deliveries"
          emptyDescription="Everything has been delivered."
        />
        <GeofenceAlertFeed className="w-full max-w-none" events={GEOFENCE_EVENTS} />
      </div>
    </HarborPage>
  );
}
