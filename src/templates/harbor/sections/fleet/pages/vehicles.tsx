import * as React from 'react';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { EmptyState } from '@/components/app/empty-state';
import { FilterBar } from '@/components/app/filter-bar';
import { PageTabs } from '@/components/app/page-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleHealthCard } from '@/components/fleet/vehicle-health-card';
import { VEHICLES } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { modelLine, STATUS_LABEL, toFleetVehicle, type FleetVehicle } from '../helpers';

const FLEET = VEHICLES.map(toFleetVehicle);
const KLASSES = ['Van', 'Truck', 'Pickup'];

const healthBadge = (score: number) => (
  <Badge variant={score < 60 ? 'default' : 'outline'} style={score < 60 ? { background: '#ec4899' } : undefined} className="font-mono tabular-nums">
    {score}
  </Badge>
);

export function VehiclesPage() {
  const { navigate } = useHarborRouter();
  const { state } = useHarbor();
  const [status, setStatus] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [klass, setKlass] = React.useState<string | undefined>();
  const [view, setView] = React.useState('cards');

  const openOrders = (vehicle: FleetVehicle) => state.workOrders.filter((order) => order.vehicle === vehicle.name && order.status !== 'done').length;

  const rows = FLEET.filter(
    (vehicle) =>
      (status === 'all' || vehicle.status === status) &&
      (!klass || vehicle.klass === klass) &&
      `${vehicle.name} ${vehicle.plate} ${vehicle.driver} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: DataColumn<FleetVehicle>[] = [
    {
      id: 'name',
      header: 'Vehicle',
      sortValue: (row) => row.name,
      cell: (row) => (
        <span className="block min-w-0">
          <span className="block truncate text-sm font-bold">{row.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{modelLine(row)}</span>
        </span>
      ),
    },
    { id: 'plate', header: 'Plate', hideBelow: 'sm', sortValue: (row) => row.plate, cell: (row) => <span className="font-mono text-xs">{row.plate}</span> },
    { id: 'driver', header: 'Driver', hideBelow: 'lg', sortValue: (row) => row.driver, cell: (row) => row.driver },
    { id: 'status', header: 'Status', hideBelow: 'md', sortValue: (row) => row.status, cell: (row) => <Badge variant="outline">{STATUS_LABEL[row.status]}</Badge> },
    { id: 'orders', header: 'Open jobs', align: 'right', hideBelow: 'md', sortValue: (row) => openOrders(row), cell: (row) => <span className="font-mono tabular-nums">{openOrders(row)}</span> },
    { id: 'odometer', header: 'Odometer', align: 'right', hideBelow: 'lg', sortValue: (row) => row.odometerKm, cell: (row) => <span className="font-mono tabular-nums">{row.odometerKm.toLocaleString('en-US')} km</span> },
    { id: 'health', header: 'Health', align: 'right', sortValue: (row) => row.health, cell: (row) => healthBadge(row.health) },
  ];

  const count = (value: string) => (value === 'all' ? FLEET.length : FLEET.filter((vehicle) => vehicle.status === value).length);

  return (
    <HarborPage
      title="Vehicles"
      description={`${FLEET.length} vehicles carry the deliveries. Health is scored 0 to 100 from open issues, overdue services and fault codes.`}
      actions={
        <Button size="sm" onClick={() => navigate('/maintenance')}>
          Schedule a service
        </Button>
      }
      tabs={
        <PageTabs
          activeId={status}
          onChange={(tab) => setStatus(tab.id)}
          tabs={[
            { id: 'all', label: 'All', count: count('all') },
            { id: 'on-road', label: 'On the road', count: count('on-road') },
            { id: 'depot', label: 'At the depot', count: count('depot') },
            { id: 'in-shop', label: 'In the shop', count: count('in-shop') },
          ]}
        />
      }
    >
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, plate or driver"
        filters={[{ id: 'klass', label: 'Type', options: KLASSES.map((value) => ({ value, label: value })) }]}
        values={{ klass }}
        onFilterChange={(_, value) => setKlass(value)}
        onClear={() => {
          setSearch('');
          setKlass(undefined);
        }}
        trailing={
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="No vehicles match" description="Try another status or clear the filters." />
      ) : view === 'cards' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...rows]
            .sort((a, b) => a.health - b.health)
            .map((vehicle) => (
              <VehicleHealthCard
                key={vehicle.id}
                name={vehicle.name}
                model={modelLine(vehicle)}
                plate={vehicle.plate}
                odometerKm={vehicle.odometerKm}
                score={vehicle.health}
                issues={vehicle.issues}
                nextService={vehicle.nextService}
                onOpen={() => navigate(`/vehicles/${vehicle.id}`)}
                onSchedule={() => navigate('/maintenance')}
              />
            ))}
        </div>
      ) : (
        <DataTable rows={rows} columns={columns} getRowId={(row) => row.id} defaultSort={{ id: 'health', dir: 'asc' }} pageSize={8} onRowClick={(row) => navigate(`/vehicles/${row.id}`)} />
      )}
    </HarborPage>
  );
}
