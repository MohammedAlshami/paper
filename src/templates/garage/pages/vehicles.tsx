import * as React from 'react';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleHealthCard } from '@/components/fleet/vehicle-health-card';
import { modelLine, VEHICLE_RECORDS, type VehicleRecord } from '../data';
import { GarageShell, PageBody } from '../shell';
import type { PageContext } from '../context';

const scoreBadge = (score: number) => (
  <Badge variant={score < 60 ? 'default' : 'outline'} style={score < 60 ? { background: '#ec4899' } : undefined} className="font-mono tabular-nums">
    {score}
  </Badge>
);

const COLUMNS: DataColumn<VehicleRecord>[] = [
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
  { id: 'status', header: 'Status', hideBelow: 'md', sortValue: (row) => row.status, cell: (row) => <Badge variant="outline">{row.status}</Badge> },
  {
    id: 'odometer',
    header: 'Odometer',
    align: 'right',
    hideBelow: 'md',
    sortValue: (row) => row.odometerKm,
    cell: (row) => <span className="font-mono tabular-nums">{row.odometerKm.toLocaleString('en-US')} km</span>,
  },
  { id: 'score', header: 'Health', align: 'right', sortValue: (row) => row.score, cell: (row) => scoreBadge(row.score) },
];

export function VehiclesPage(ctx: PageContext) {
  const { navigate } = ctx;
  const [view, setView] = React.useState('table');
  return (
    <GarageShell activeId="vehicles" ctx={ctx}>
      <PageBody>
        <PageHeader
          title="Vehicles"
          description={`${VEHICLE_RECORDS.length} vehicles. Health is scored 0 to 100 from open issues, overdue services and fault codes.`}
          actions={
            <Button size="sm" onClick={() => navigate('/work-orders/new')}>
              Report a defect
            </Button>
          }
        />
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <DataTable
              rows={VEHICLE_RECORDS}
              columns={COLUMNS}
              getRowId={(row) => row.id}
              searchText={(row) => `${row.name} ${row.plate} ${row.driver} ${row.make} ${row.model}`}
              searchPlaceholder="Search by name, plate or driver"
              filter={{
                label: 'Status',
                options: [
                  { value: 'On the road', label: 'On the road' },
                  { value: 'In the shop', label: 'In the shop' },
                  { value: 'Parked', label: 'Parked' },
                ],
                match: (row, value) => row.status === value,
              }}
              defaultSort={{ id: 'score', dir: 'asc' }}
              pageSize={8}
              onRowClick={(row) => navigate(`/vehicles/${row.id}`)}
            />
          </TabsContent>
          <TabsContent value="cards">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[...VEHICLE_RECORDS]
                .sort((a, b) => a.score - b.score)
                .map((vehicle) => (
                  <VehicleHealthCard
                    key={vehicle.id}
                    name={vehicle.name}
                    model={modelLine(vehicle)}
                    plate={vehicle.plate}
                    odometerKm={vehicle.odometerKm}
                    score={vehicle.score}
                    issues={vehicle.issues}
                    nextService={vehicle.nextService}
                    onOpen={() => navigate(`/vehicles/${vehicle.id}`)}
                    onSchedule={() => navigate('/schedule')}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </PageBody>
    </GarageShell>
  );
}
